"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import { DEMO_WALLET_LIST, findDemoWalletByAddress } from "@/lib/demo-wallets"
import {
  getBalanceOf,
  getRoleStatuses,
  getWalletAccessProfile,
  grantRoleToWallet,
  revokeRoleFromWallet,
  setWhitelistStatus,
  type WalletAccessProfile,
} from "@/lib/web3/contract"
import { ROLE_HASHES } from "@/lib/web3/client"
import { formatAddress } from "@/lib/web3/client"
import { cn } from "@/lib/utils"

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

function StatusBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "muted"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variant === "default" && "border-border bg-secondary text-secondary-foreground",
        variant === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        variant === "warning" && "border-amber-500/30 bg-amber-500/10 text-amber-600",
        variant === "danger" && "border-red-500/30 bg-red-500/10 text-red-600",
        variant === "muted" && "border-border bg-muted text-muted-foreground"
      )}
    >
      {children}
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

  const [targetWallet, setTargetWallet] = useState("")
  const [targetProfile, setTargetProfile] = useState<WalletAccessProfile | null>(null)
  const [targetBalance, setTargetBalance] = useState<string>("0")
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
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
  const canManageWhitelist = !!viewerRoles?.defaultAdmin || !!viewerRoles?.compliance

  const knownWalletLabel = useMemo(() => {
    return findDemoWalletByAddress(targetWallet)?.label ?? null
  }, [targetWallet])

  async function loadWalletProfile(wallet: string) {
    const trimmed = wallet.trim()
    if (!trimmed) {
      setError("Enter a wallet address.")
      setTargetProfile(null)
      return
    }

    setIsLoadingProfile(true)
    setError(null)
    setFeedback(null)

    try {
      const [profile, balance] = await Promise.all([
        getWalletAccessProfile(trimmed),
        getBalanceOf(trimmed),
      ])

      setTargetProfile(profile)
      setTargetBalance(balance)
    } catch (err) {
      console.error(err)
      setTargetProfile(null)
      setTargetBalance("0")
      setError("Failed to load wallet profile. Check the address and contract connection.")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  async function handleGrantRole(roleHash: string, roleLabel: string) {
    if (!targetWallet.trim()) return

    setIsSubmitting(true)
    setError(null)
    setFeedback(null)

    try {
      const tx = await grantRoleToWallet(roleHash, targetWallet.trim())
      setFeedback(`Granting ${roleLabel}... waiting for confirmation (${tx.hash})`)
      await tx.wait()
      setFeedback(`${roleLabel} granted successfully.`)
      await loadWalletProfile(targetWallet)
    } catch (err) {
      console.error(err)
      setError(`Failed to grant ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRevokeRole(roleHash: string, roleLabel: string) {
    if (!targetWallet.trim()) return

    setIsSubmitting(true)
    setError(null)
    setFeedback(null)

    try {
      const tx = await revokeRoleFromWallet(roleHash, targetWallet.trim())
      setFeedback(`Revoking ${roleLabel}... waiting for confirmation (${tx.hash})`)
      await tx.wait()
      setFeedback(`${roleLabel} revoked successfully.`)
      await loadWalletProfile(targetWallet)
    } catch (err) {
      console.error(err)
      setError(`Failed to revoke ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleWhitelist(status: boolean) {
    if (!targetWallet.trim()) return

    setIsSubmitting(true)
    setError(null)
    setFeedback(null)

    try {
      const tx = await setWhitelistStatus(targetWallet.trim(), status)
      setFeedback(
        `${status ? "Adding to" : "Removing from"} whitelist... waiting for confirmation (${tx.hash})`
      )
      await tx.wait()
      setFeedback(`Whitelist updated successfully.`)
      await loadWalletProfile(targetWallet)
    } catch (err) {
      console.error(err)
      setError(`Failed to update whitelist status.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const connectedProfileText = useMemo(() => {
    if (!viewerRoles) return "Disconnected / unavailable"
    if (viewerRoles.defaultAdmin) return "Super Admin"
    if (viewerRoles.compliance && viewerRoles.operator && viewerRoles.oracle) return "Platform Admin"
    if (viewerRoles.compliance) return "Compliance Admin"
    if (viewerRoles.operator) return "Operations Admin"
    if (viewerRoles.oracle) return "Oracle Admin"
    return "Read-only wallet"
  }, [viewerRoles])

  return (
    <DashboardLayout
      title="Role Management"
      description="Manage on-chain access roles and whitelist status using connected wallet permissions."
    >
      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Connected Wallet Access</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">Connected wallet</div>
              <div className="mt-1 font-mono text-sm">
                {address ? formatAddress(address) : "Not connected"}
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">Network</div>
              <div className="mt-1 text-sm">{isCorrectNetwork ? "Sepolia" : "Wrong / not connected"}</div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">Profile</div>
              <div className="mt-1 text-sm">{connectedProfileText}</div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted-foreground">Permissions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {viewerRoles?.defaultAdmin && <StatusBadge variant="success">Super Admin</StatusBadge>}
                {viewerRoles?.operator && <StatusBadge variant="default">Operator</StatusBadge>}
                {viewerRoles?.compliance && <StatusBadge variant="warning">Compliance</StatusBadge>}
                {viewerRoles?.oracle && <StatusBadge variant="muted">Oracle</StatusBadge>}
                {!viewerRoles?.defaultAdmin &&
                  !viewerRoles?.operator &&
                  !viewerRoles?.compliance &&
                  !viewerRoles?.oracle && <StatusBadge variant="danger">Read-only</StatusBadge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Lookup Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <Input
                placeholder="Enter wallet address"
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={() => loadWalletProfile(targetWallet)}
                disabled={!isConnected || !isCorrectNetwork || isLoadingProfile}
              >
                {isLoadingProfile ? "Loading..." : "Load Wallet"}
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {DEMO_WALLET_LIST.map((wallet) => (
                <button
                  key={wallet.key}
                  type="button"
                  onClick={() => {
                    setTargetWallet(wallet.address)
                    loadWalletProfile(wallet.address)
                  }}
                  className="rounded-lg border border-border p-3 text-left transition hover:bg-muted"
                >
                  <div className="text-sm font-medium">{wallet.label}</div>
                  <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {wallet.address || "Not configured"}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {wallet.notes || "Known wallet"}
                  </div>
                </button>
              ))}
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

        {targetProfile && (
          <>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Wallet Profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Wallet address</div>
                    <div className="mt-1 break-all font-mono text-sm">{targetWallet}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Known wallet label</div>
                    <div className="mt-1 text-sm">{knownWalletLabel ?? "Not in known wallet list"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Profile label</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge
                        variant={
                          targetProfile.defaultAdmin
                            ? "success"
                            : targetProfile.isWhitelisted
                            ? "default"
                            : "danger"
                        }
                      >
                        {targetProfile.profileLabel}
                      </StatusBadge>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Token balance</div>
                    <div className="mt-1 text-sm">{targetBalance}</div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="text-xs text-muted-foreground">Current access state</div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant={targetProfile.isWhitelisted ? "success" : "danger"}>
                      {targetProfile.isWhitelisted ? "Whitelisted" : "Not whitelisted"}
                    </StatusBadge>
                    {targetProfile.defaultAdmin && <StatusBadge variant="success">Super Admin</StatusBadge>}
                    {targetProfile.operator && <StatusBadge variant="default">Operator</StatusBadge>}
                    {targetProfile.compliance && <StatusBadge variant="warning">Compliance</StatusBadge>}
                    {targetProfile.oracle && <StatusBadge variant="muted">Oracle</StatusBadge>}
                  </div>

                  <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    Investor wallets should usually be whitelisted and carry no admin roles. Professor or
                    reviewer wallets can be granted admin roles on-chain without changing frontend code.
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Whitelist Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canManageWhitelist ? (
                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      Requires Compliance Role or Super Admin.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleWhitelist(true)}
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        Add to whitelist
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleWhitelist(false)}
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        Remove from whitelist
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Role Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canManageRoles ? (
                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      Requires DEFAULT_ADMIN_ROLE.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ROLE_OPTIONS.map((role) => {
                        const active =
                          (role.key === "DEFAULT_ADMIN_ROLE" && targetProfile.defaultAdmin) ||
                          (role.key === "OPERATOR_ROLE" && targetProfile.operator) ||
                          (role.key === "COMPLIANCE_ROLE" && targetProfile.compliance) ||
                          (role.key === "ORACLE_ROLE" && targetProfile.oracle)

                        return (
                          <div
                            key={role.key}
                            className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3 lg:flex-row lg:items-center"
                          >
                            <div>
                              <div className="text-sm font-medium">{role.label}</div>
                              <div className="mt-1 text-xs text-muted-foreground font-mono">
                                {role.hash}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusBadge variant={active ? "success" : "muted"}>
                                {active ? "Assigned" : "Not assigned"}
                              </StatusBadge>
                              <Button
                                size="sm"
                                onClick={() => handleGrantRole(role.hash, role.label)}
                                disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                              >
                                Grant
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRevokeRole(role.hash, role.label)}
                                disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                              >
                                Revoke
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}