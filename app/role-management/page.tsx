"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import {
  getRoleStatuses,
  getWalletAccessProfile,
  grantRoleToWallet,
  revokeRoleFromWallet,
  setWhitelistStatus,
  type WalletAccessProfile,
} from "@/lib/web3/contract"
import {
  getSavedWallets,
  saveWallet,
  removeSavedWallet,
  findSavedWallet,
  type SavedWalletEntry,
  type SavedWalletRoleTag,
} from "@/lib/wallet-registry"
import {
  ROLE_HASHES,
  formatAddress,
  getExplorerAddressUrl,
} from "@/lib/web3/client"
import {
  Search,
  ExternalLink,
  Shield,
  KeyRound,
  Wallet,
  CheckCircle,
  XCircle,
} from "lucide-react"

type ManagedRoleKey =
  | "DEFAULT_ADMIN_ROLE"
  | "OPERATOR_ROLE"
  | "COMPLIANCE_ROLE"
  | "ORACLE_ROLE"

const ROLE_OPTIONS: {
  key: ManagedRoleKey
  label: string
  hash: string
}[] = [
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

const LOCAL_ROLE_OPTIONS: SavedWalletRoleTag[] = [
  "DEFAULT_ADMIN_ROLE",
  "OPERATOR_ROLE",
  "COMPLIANCE_ROLE",
  "ORACLE_ROLE",
  "INVESTOR",
  "UNAPPROVED",
  "OTHER",
]

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

function getRoleActive(profile: WalletAccessProfile, roleKey: ManagedRoleKey) {
  switch (roleKey) {
    case "DEFAULT_ADMIN_ROLE":
      return profile.defaultAdmin
    case "OPERATOR_ROLE":
      return profile.operator
    case "COMPLIANCE_ROLE":
      return profile.compliance
    case "ORACLE_ROLE":
      return profile.oracle
    default:
      return false
  }
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const [savedWallets, setSavedWallets] = useState<SavedWalletEntry[]>([])
  const [walletLabel, setWalletLabel] = useState("")
  const [walletNotes, setWalletNotes] = useState("")
  const [intendedRole, setIntendedRole] = useState<SavedWalletRoleTag>("OTHER")

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

  useEffect(() => {
    setSavedWallets(getSavedWallets())
  }, [])

  const canManageRoles = !!viewerRoles?.defaultAdmin
  const canManageWhitelist = !!viewerRoles?.defaultAdmin || !!viewerRoles?.compliance

  const savedWalletInfo = useMemo(() => {
    return targetWallet ? findSavedWallet(targetWallet) : null
  }, [targetWallet])

  async function loadWalletProfile(wallet: string) {
    const trimmed = wallet.trim()

    setError(null)
    setFeedback(null)

    if (!trimmed) {
      setError("Enter a wallet address.")
      setTargetProfile(null)
      return
    }

    if (!isValidAddress(trimmed)) {
      setError("Enter a valid wallet address.")
      setTargetProfile(null)
      return
    }

    setIsLoadingProfile(true)

    try {
      const profile = await getWalletAccessProfile(trimmed)
      setTargetProfile(profile)

      const saved = findSavedWallet(trimmed)
      if (saved) {
        setWalletLabel(saved.label)
        setWalletNotes(saved.notes || "")
        setIntendedRole(saved.intendedRole || "OTHER")
      } else {
        setWalletLabel("")
        setWalletNotes("")
        setIntendedRole("OTHER")
      }
    } catch (err) {
      console.error(err)
      setTargetProfile(null)
      setError("Failed to load wallet profile.")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  function handleSaveWallet() {
    const trimmedAddress = targetWallet.trim()
    const trimmedLabel = walletLabel.trim()

    setError(null)
    setFeedback(null)

    if (!isValidAddress(trimmedAddress)) {
      setError("Enter a valid wallet address before saving.")
      return
    }

    if (!trimmedLabel) {
      setError("Enter a wallet label before saving.")
      return
    }

    const updated = saveWallet({
      address: trimmedAddress,
      label: trimmedLabel,
      notes: walletNotes,
      intendedRole,
    })

    setSavedWallets(updated)
    setFeedback("Wallet saved for quick access.")
  }

  function handleRemoveWallet(addressToRemove: string) {
    const updated = removeSavedWallet(addressToRemove)
    setSavedWallets(updated)

    if (targetWallet.trim().toLowerCase() === addressToRemove.trim().toLowerCase()) {
      setWalletLabel("")
      setWalletNotes("")
      setIntendedRole("OTHER")
    }
  }

  async function handleGrantRole(roleHash: string, roleLabel: string) {
    const trimmed = targetWallet.trim()

    setError(null)
    setFeedback(null)

    if (!isValidAddress(trimmed)) {
      setError(`Enter a valid target wallet before granting ${roleLabel}.`)
      return
    }

    setIsSubmitting(true)

    try {
      const tx = await grantRoleToWallet(roleHash, trimmed)
      setFeedback(`Granting ${roleLabel}... (${tx.hash})`)
      await tx.wait()

      setFeedback(`${roleLabel} granted successfully.`)
      await loadWalletProfile(trimmed)
    } catch (err) {
      console.error(err)
      setError(`Failed to grant ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRevokeRole(roleHash: string, roleLabel: string) {
    const trimmed = targetWallet.trim()

    setError(null)
    setFeedback(null)

    if (!isValidAddress(trimmed)) {
      setError(`Enter a valid target wallet before revoking ${roleLabel}.`)
      return
    }

    setIsSubmitting(true)

    try {
      const tx = await revokeRoleFromWallet(roleHash, trimmed)
      setFeedback(`Revoking ${roleLabel}... (${tx.hash})`)
      await tx.wait()

      setFeedback(`${roleLabel} revoked successfully.`)
      await loadWalletProfile(trimmed)
    } catch (err) {
      console.error(err)
      setError(`Failed to revoke ${roleLabel}.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSetWhitelist(status: boolean) {
    const trimmed = targetWallet.trim()

    setError(null)
    setFeedback(null)

    if (!isValidAddress(trimmed)) {
      setError("Enter a valid target wallet before updating whitelist status.")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("👉 Step 1: Start")

      // 🔥 ADD THIS BLOCK HERE
      const contract = await getContractWithSigner()

      if (!contract) {
        alert("Please connect wallet and try again")
        return
      }

      console.log("✅ Contract ready")

      const tx = await contract.setWhitelist(trimmed, status)

      console.log("🚀 TX SENT:", tx.hash)

      setFeedback(
        `${status ? "Adding wallet to whitelist" : "Removing wallet from whitelist"}... (${tx.hash})`
      )

      await tx.wait()

      setFeedback("Whitelist updated successfully.")

      await loadWalletProfile(trimmed)

    } catch (err) {
      console.error(err)

      // Handle user rejection properly
      if (err.code === 4001) {
        setError("Transaction rejected by user.")
      } else if (err?.message?.includes("insufficient funds")) {
        setError("Insufficient funds to perform this action.")
      } else {
        setError("Failed to update whitelist status.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Role Management"
      description="Inspect wallets, manage on-chain roles, update whitelist status, and save wallet addresses for quick reuse."
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

        <Card className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <CardHeader>
            <CardTitle className="text-base">Wallet Lookup</CardTitle>
            <CardDescription>
              Load any wallet to inspect its live on-chain role and whitelist status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                placeholder="0x... target wallet"
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={() => loadWalletProfile(targetWallet)}
                disabled={isLoadingProfile}
                className="rounded-xl font-semibold"
              >
                <Search className="mr-2 h-4 w-4" />
                {isLoadingProfile ? "Loading..." : "Load Wallet"}
              </Button>
            </div>

            {targetWallet.trim() && isValidAddress(targetWallet.trim()) && (
              <a
                href={getExplorerAddressUrl(targetWallet.trim())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View wallet on explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
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

        <Card className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <CardHeader>
            <CardTitle className="text-base">Saved Wallets</CardTitle>
            <CardDescription>
              Local quick-access registry only. Actual roles and whitelist status still come from the contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Wallet label"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
              />
              <Input
                placeholder="Notes (optional)"
                value={walletNotes}
                onChange={(e) => setWalletNotes(e.target.value)}
              />
              <select
                value={intendedRole}
                onChange={(e) => setIntendedRole(e.target.value as SavedWalletRoleTag)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {LOCAL_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSaveWallet} className="rounded-xl font-semibold">
              Save Current Wallet
            </Button>

            <div className="space-y-3">
              {savedWallets.length === 0 ? (
                <div className="rounded-md border border-white/10 bg-background/40 p-3 text-sm text-muted-foreground">
                  No saved wallets yet.
                </div>
              ) : (
                savedWallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">{wallet.label}</div>
                      <div className="font-mono text-xs text-muted-foreground">{wallet.address}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Intended role: {wallet.intendedRole || "OTHER"}
                      </div>
                      {wallet.notes ? (
                        <div className="mt-1 text-xs text-muted-foreground">{wallet.notes}</div>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTargetWallet(wallet.address)
                          loadWalletProfile(wallet.address)
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveWallet(wallet.address)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {targetProfile && (
          <>
            <Card className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <CardHeader>
                <CardTitle className="text-base">Wallet Profile</CardTitle>
                <CardDescription>
                  Live on-chain status for the currently loaded wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-white/10 bg-background/40 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Wallet address</div>
                    <div className="mt-1 break-all font-mono text-sm text-foreground">
                      {targetWallet}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Saved wallet label</div>
                    <div className="mt-1 text-sm text-foreground">
                      {savedWalletInfo?.label ?? "Not saved locally"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Derived access profile</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <RoleBadge
                        label={targetProfile.profileLabel}
                        active={true}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Whitelist status</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <RoleBadge
                        label={targetProfile.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                        active={targetProfile.isWhitelisted}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-background/40 p-4">
                  <div className="text-xs text-muted-foreground">Current roles</div>
                  <div className="flex flex-wrap gap-2">
                    <RoleBadge label="Admin" active={targetProfile.defaultAdmin} />
                    <RoleBadge label="Operator" active={targetProfile.operator} />
                    <RoleBadge label="Compliance" active={targetProfile.compliance} />
                    <RoleBadge label="Oracle" active={targetProfile.oracle} />
                  </div>

                  <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                    Actual role truth and whitelist eligibility come from the contract.
                    Saved wallets are only for quick selection and labeling.
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <CardHeader>
                  <CardTitle className="text-base">Whitelist Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canManageWhitelist ? (
                    <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      Requires COMPLIANCE_ROLE or DEFAULT_ADMIN_ROLE.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="rounded-xl font-semibold"
                        onClick={() => handleSetWhitelist(true)}
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Add to Whitelist
                      </Button>

                      <Button
                        variant="destructive"
                        className="rounded-xl font-semibold"
                        onClick={() => handleSetWhitelist(false)}
                        disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove from Whitelist
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
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
                        const active = getRoleActive(targetProfile, role.key)

                        return (
                          <div
                            key={role.key}
                            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background/40 p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium text-foreground">{role.label}</div>
                              <div className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
                                {role.hash}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <RoleBadge label={active ? "Assigned" : "Not Assigned"} active={active} />
                              <Button
                                size="sm"
                                className="rounded-xl font-semibold"
                                onClick={() => handleGrantRole(role.hash, role.label)}
                                disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Grant
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-xl font-semibold"
                                onClick={() => handleRevokeRole(role.hash, role.label)}
                                disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                              >
                                <KeyRound className="mr-2 h-4 w-4" />
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