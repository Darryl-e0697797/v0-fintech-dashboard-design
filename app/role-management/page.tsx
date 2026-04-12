"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import {
  getRoleStatuses,
  grantRoleToWallet,
  revokeRoleFromWallet,
} from "@/lib/web3/contract"
import { ROLE_HASHES, formatAddress } from "@/lib/web3/client"

type ManagedRoleKey =
  | "DEFAULT_ADMIN_ROLE"
  | "OPERATOR_ROLE"
  | "COMPLIANCE_ROLE"
  | "ORACLE_ROLE"

const ROLE_OPTIONS: { key: ManagedRoleKey; label: string; hash: string }[] = [
  {
    key: "DEFAULT_ADMIN_ROLE",
    label: "Super Admin",
    hash: ROLE_HASHES.DEFAULT_ADMIN_ROLE,
  },
  {
    key: "OPERATOR_ROLE",
    label: "Operator",
    hash: ROLE_HASHES.OPERATOR_ROLE,
  },
  {
    key: "COMPLIANCE_ROLE",
    label: "Compliance",
    hash: ROLE_HASHES.COMPLIANCE_ROLE,
  },
  {
    key: "ORACLE_ROLE",
    label: "Oracle",
    hash: ROLE_HASHES.ORACLE_ROLE,
  },
]

type RoleWalletForm = {
  currentWallet: string
  newWallet: string
}

const EMPTY_ROLE_FORMS: Record<ManagedRoleKey, RoleWalletForm> = {
  DEFAULT_ADMIN_ROLE: { currentWallet: "", newWallet: "" },
  OPERATOR_ROLE: { currentWallet: "", newWallet: "" },
  COMPLIANCE_ROLE: { currentWallet: "", newWallet: "" },
  ORACLE_ROLE: { currentWallet: "", newWallet: "" },
}

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

function RoleBadge({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        active
          ? "border border-primary/30 bg-primary/10 text-primary"
          : "border border-white/10 bg-background/60 text-muted-foreground"
      }`}
    >
      {label}
    </span>
  )
}

export default function RoleManagementPage() {
  const { address, isConnected, isCorrectNetwork } = useWallet()

  const [viewerRoles, setViewerRoles] = useState<{
    defaultAdmin: boolean
    operator: boolean
    compliance: boolean
    oracle: boolean
  } | null>(null)

  const [forms, setForms] =
    useState<Record<ManagedRoleKey, RoleWalletForm>>(EMPTY_ROLE_FORMS)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadViewerRoles() {
      if (!address || !isConnected || !isCorrectNetwork) {
        setViewerRoles(null)
        return
      }

      try {
        const roles = await getRoleStatuses(address)
        setViewerRoles(roles)
      } catch (err) {
        console.error(err)
        setViewerRoles(null)
      }
    }

    loadViewerRoles()
  }, [address, isConnected, isCorrectNetwork])

  const canManageRoles = !!viewerRoles?.defaultAdmin

  function updateForm(
    roleKey: ManagedRoleKey,
    field: keyof RoleWalletForm,
    value: string
  ) {
    setForms((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [field]: value,
      },
    }))
  }

  async function handleAssignOrChangeRole(roleKey: ManagedRoleKey, roleHash: string, roleLabel: string) {
    const currentWallet = forms[roleKey].currentWallet.trim()
    const newWallet = forms[roleKey].newWallet.trim()

    setError(null)
    setFeedback(null)

    if (!newWallet) {
      setError(`Enter a new wallet for ${roleLabel}.`)
      return
    }

    if (!isValidAddress(newWallet)) {
      setError(`Invalid new wallet address for ${roleLabel}.`)
      return
    }

    if (currentWallet && !isValidAddress(currentWallet)) {
      setError(`Invalid current wallet address for ${roleLabel}.`)
      return
    }

    if (currentWallet && currentWallet.toLowerCase() === newWallet.toLowerCase()) {
      setError(`Current and new wallet for ${roleLabel} cannot be the same.`)
      return
    }

    setIsSubmitting(true)

    try {
      if (currentWallet) {
        const revokeTx = await revokeRoleFromWallet(roleHash, currentWallet)
        setFeedback(`Revoking ${roleLabel} from ${currentWallet}... (${revokeTx.hash})`)
        await revokeTx.wait()
      }

      const grantTx = await grantRoleToWallet(roleHash, newWallet)
      setFeedback(`Assigning ${roleLabel} to ${newWallet}... (${grantTx.hash})`)
      await grantTx.wait()

      setFeedback(`${roleLabel} updated successfully.`)
      setForms((prev) => ({
        ...prev,
        [roleKey]: {
          currentWallet: newWallet,
          newWallet: "",
        },
      }))
    } catch (err) {
      console.error(err)
      setError(`Failed to update ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveRole(roleKey: ManagedRoleKey, roleHash: string, roleLabel: string) {
    const currentWallet = forms[roleKey].currentWallet.trim()

    setError(null)
    setFeedback(null)

    if (!currentWallet) {
      setError(`Enter the current wallet for ${roleLabel} before removing it.`)
      return
    }

    if (!isValidAddress(currentWallet)) {
      setError(`Invalid current wallet address for ${roleLabel}.`)
      return
    }

    setIsSubmitting(true)

    try {
      const tx = await revokeRoleFromWallet(roleHash, currentWallet)
      setFeedback(`Removing ${roleLabel} from ${currentWallet}... (${tx.hash})`)
      await tx.wait()

      setFeedback(`${roleLabel} removed successfully.`)
      setForms((prev) => ({
        ...prev,
        [roleKey]: {
          currentWallet: "",
          newWallet: "",
        },
      }))
    } catch (err) {
      console.error(err)
      setError(`Failed to remove ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Role Management"
      description="Assign, change, or remove admin-role wallets using the connected DEFAULT_ADMIN_ROLE signer."
    >
      <div className="grid gap-6">
        <Card className="border-white/10 bg-card/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <CardHeader>
            <CardTitle className="text-base">Connected Signer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Wallet</div>
              <div className="mt-1 font-mono text-sm">
                {address ? formatAddress(address) : "Not connected"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="mt-1 text-sm">
                {isCorrectNetwork ? "Sepolia" : "Wrong / not connected"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="text-xs text-muted-foreground">Permissions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <RoleBadge label="Admin" active={!!viewerRoles?.defaultAdmin} />
                <RoleBadge label="Operator" active={!!viewerRoles?.operator} />
                <RoleBadge label="Compliance" active={!!viewerRoles?.compliance} />
                <RoleBadge label="Oracle" active={!!viewerRoles?.oracle} />
              </div>
            </div>
          </CardContent>
        </Card>

        {feedback && (
          <Card className="border-emerald-500/30 bg-emerald-500/10">
            <CardContent className="p-4 text-sm text-emerald-700">{feedback}</CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          {ROLE_OPTIONS.map((role) => (
            <Card
              key={role.key}
              className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            >
              <CardHeader>
                <CardTitle className="text-base">{role.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canManageRoles ? (
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    Requires DEFAULT_ADMIN_ROLE.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Current wallet for this role
                      </div>
                      <Input
                        placeholder="0x... current wallet (leave blank if none)"
                        value={forms[role.key].currentWallet}
                        onChange={(e) => updateForm(role.key, "currentWallet", e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        New wallet for this role
                      </div>
                      <Input
                        placeholder="0x... new wallet"
                        value={forms[role.key].newWallet}
                        onChange={(e) => updateForm(role.key, "newWallet", e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      To change the {role.label.toLowerCase()} wallet, enter the current wallet
                      (if any) and the new wallet, then click <span className="font-medium">Change Wallet</span>.
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="rounded-xl font-semibold"
                        onClick={() =>
                          handleAssignOrChangeRole(role.key, role.hash, role.label)
                        }
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        Change Wallet
                      </Button>

                      <Button
                        variant="destructive"
                        className="rounded-xl font-semibold"
                        onClick={() => handleRemoveRole(role.key, role.hash, role.label)}
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        Remove Current Wallet
                      </Button>
                    </div>

                    <div className="text-[11px] font-mono text-muted-foreground break-all">
                      Role hash: {role.hash}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}