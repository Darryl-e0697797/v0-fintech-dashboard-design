"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import {
  getCurrentWhitelistState,
  getRoleStatuses,
  isWhitelisted,
  setWhitelistStatus,
} from "@/lib/web3/contract"
import {
  getSavedWallets,
  findSavedWallet,
  type SavedWalletEntry,
} from "@/lib/wallet-registry"
import { formatAddress, getExplorerAddressUrl } from "@/lib/web3/client"
import type { RoleStatus } from "@/types/ethereum"
import {
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Wallet,
  Globe,
  Lock,
} from "lucide-react"

interface WhitelistRow {
  address: string
  status: boolean
  lastBlock: number
  txHash: string
}

function isValidAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

export default function WhitelistPage() {
  const { isConnected, address, isCorrectNetwork } = useWallet()

  const [viewerRoles, setViewerRoles] = useState<RoleStatus | null>(null)
  const [rows, setRows] = useState<WhitelistRow[]>([])
  const [rowsLoading, setRowsLoading] = useState(false)

  const [savedWallets, setSavedWallets] = useState<SavedWalletEntry[]>([])

  const [targetWallet, setTargetWallet] = useState("")
  const [targetStatus, setTargetStatus] = useState<boolean | null>(null)
  const [targetLoading, setTargetLoading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canManageWhitelist = !!viewerRoles?.defaultAdmin || !!viewerRoles?.compliance

  const connectedProfileLabel = useMemo(() => {
    if (!viewerRoles) return "Disconnected / unavailable"
    if (viewerRoles.defaultAdmin) return "Super Admin"
    if (viewerRoles.compliance) return "Compliance Admin"
    if (viewerRoles.operator) return "Operations Admin"
    if (viewerRoles.oracle) return "Oracle Admin"
    return "Read-only wallet"
  }, [viewerRoles])

  const savedWalletInfo = useMemo(() => {
    return targetWallet ? findSavedWallet(targetWallet) : null
  }, [targetWallet])

  async function loadViewerRoles() {
    if (!address || !isConnected || !isCorrectNetwork) {
      setViewerRoles(null)
      return
    }

    try {
      const roles = await getRoleStatuses(address)
      setViewerRoles(roles)
    } catch (err) {
      console.error("Failed to load viewer roles:", err)
      setViewerRoles(null)
    }
  }

  async function loadWhitelistState() {
    setRowsLoading(true)
    try {
      const currentState = await getCurrentWhitelistState()
      setRows(currentState)
    } catch (err) {
      console.error("Failed to load whitelist state:", err)
      setRows([])
    } finally {
      setRowsLoading(false)
    }
  }

  async function lookupWallet(wallet: string) {
    const trimmed = wallet.trim()

    if (!trimmed) {
      setError("Enter a wallet address.")
      setTargetStatus(null)
      return
    }

    if (!isValidAddress(trimmed)) {
      setError("Enter a valid wallet address.")
      setTargetStatus(null)
      return
    }

    setTargetLoading(true)
    setError(null)
    setFeedback(null)

    try {
      const status = await isWhitelisted(trimmed)
      setTargetStatus(status)
    } catch (err) {
      console.error("Failed to lookup wallet:", err)
      setTargetStatus(null)
      setError("Failed to check whitelist status.")
    } finally {
      setTargetLoading(false)
    }
  }

  async function handleSetWhitelist(status: boolean) {
    const trimmed = targetWallet.trim()

    if (!trimmed) {
      setError("Enter a wallet address first.")
      return
    }

    if (!isValidAddress(trimmed)) {
      setError("Enter a valid wallet address.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setFeedback(null)

    try {
      const tx = await setWhitelistStatus(trimmed, status)
      setFeedback(
        `${status ? "Adding wallet to" : "Removing wallet from"} whitelist. Waiting for confirmation: ${tx.hash}`
      )
      await tx.wait()
      setFeedback("Whitelist updated successfully.")
      setTargetStatus(status)
      await loadWhitelistState()
    } catch (err: any) {
      console.error("Whitelist update failed:", err)
      setError(err?.message || "Failed to update whitelist.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    loadViewerRoles()
  }, [address, isConnected, isCorrectNetwork])

  useEffect(() => {
    loadWhitelistState()
    setSavedWallets(getSavedWallets())
  }, [])

  return (
    <DashboardLayout
      title="Whitelist"
      description="Wallet eligibility and whitelist administration"
    >
      <Card className="mb-6 border-white/10 bg-card/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
        <CardHeader>
          <CardTitle className="text-lg">Whitelist Access Status</CardTitle>
          <CardDescription>
            Wallet-based access control for whitelist administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Connected Wallet</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {address ? formatAddress(address, 8) : "Not connected"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Network</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {isConnected ? (isCorrectNetwork ? "Sepolia" : "Wrong network") : "Not connected"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Profile</span>
              </div>
              <div className="text-sm font-medium text-foreground">{connectedProfileLabel}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Whitelist Permissions</span>
              </div>
              {canManageWhitelist ? (
                <Badge className="border-primary/30 bg-primary/15 text-primary">
                  Can Manage
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-white/10 bg-background/60 text-muted-foreground"
                >
                  Read-only
                </Badge>
              )}
            </div>
          </div>

          {viewerRoles && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant={viewerRoles.defaultAdmin ? "default" : "outline"}
                className={
                  viewerRoles.defaultAdmin
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-white/10 bg-background/60 text-muted-foreground"
                }
              >
                DEFAULT_ADMIN_ROLE
              </Badge>
              <Badge
                variant={viewerRoles.compliance ? "default" : "outline"}
                className={
                  viewerRoles.compliance
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-white/10 bg-background/60 text-muted-foreground"
                }
              >
                COMPLIANCE_ROLE
              </Badge>
              <Badge
                variant={viewerRoles.operator ? "default" : "outline"}
                className={
                  viewerRoles.operator
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-white/10 bg-background/60 text-muted-foreground"
                }
              >
                OPERATOR_ROLE
              </Badge>
              <Badge
                variant={viewerRoles.oracle ? "default" : "outline"}
                className={
                  viewerRoles.oracle
                    ? "border-primary/30 bg-primary/15 text-primary"
                    : "border-white/10 bg-background/60 text-muted-foreground"
                }
              >
                ORACLE_ROLE
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 [&>div]:border-white/10 [&>div]:bg-card/85 [&>div]:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Lookup</CardTitle>
            <CardDescription>
              Check whether a wallet is currently whitelisted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedWallets.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Quick fill from saved wallets</div>
                <div className="flex flex-wrap gap-2">
                  {savedWallets.map((wallet) => (
                    <Button
                      key={wallet.address}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setTargetWallet(wallet.address)
                        lookupWallet(wallet.address)
                      }}
                    >
                      {wallet.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Enter wallet address"
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                className="font-mono"
              />
              <Button
                className="rounded-xl font-semibold"
                onClick={() => lookupWallet(targetWallet)}
                disabled={targetLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {targetLoading ? "Checking..." : "Check"}
              </Button>
            </div>

            {targetWallet.trim() && (
              <div className="rounded-xl border border-white/10 bg-background/40 p-4">
                <div className="mb-2 text-xs text-muted-foreground">Target Wallet</div>
                <div className="break-all font-mono text-sm text-foreground">{targetWallet}</div>

                {savedWalletInfo && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Saved as: {savedWalletInfo.label}
                    {savedWalletInfo.intendedRole ? ` • ${savedWalletInfo.intendedRole}` : ""}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2">
                  {targetLoading ? (
                    <Skeleton className="h-6 w-28" />
                  ) : targetStatus === null ? (
                    <Badge
                      variant="outline"
                      className="border-white/10 bg-background/60 text-muted-foreground"
                    >
                      No status loaded
                    </Badge>
                  ) : targetStatus ? (
                    <Badge className="border-primary/30 bg-primary/15 text-primary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Whitelisted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Whitelisted
                    </Badge>
                  )}
                </div>

                {isValidAddress(targetWallet.trim()) && (
                  <a
                    href={getExplorerAddressUrl(targetWallet.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View wallet on explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {canManageWhitelist ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-xl font-semibold"
                  onClick={() => handleSetWhitelist(true)}
                  disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                >
                  Add to Whitelist
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-xl font-semibold"
                  onClick={() => handleSetWhitelist(false)}
                  disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                >
                  Remove from Whitelist
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-white/10 bg-background/40 p-3 text-sm text-muted-foreground">
                Requires COMPLIANCE_ROLE or DEFAULT_ADMIN_ROLE to update whitelist status.
              </div>
            )}

            {feedback && (
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                {feedback}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Whitelist Rules</CardTitle>
            <CardDescription>
              How whitelist controls are used in the token lifecycle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-md border border-white/10 bg-background/40 p-3">
              Only approved wallets should be able to receive or hold tokens.
            </div>
            <div className="rounded-md border border-white/10 bg-background/40 p-3">
              Whitelist status is part of the compliance-by-design model.
            </div>
            <div className="rounded-md border border-white/10 bg-background/40 p-3">
              Blocked transfers should appear when tokens are sent to ineligible wallets.
            </div>
            <div className="rounded-md border border-white/10 bg-background/40 p-3">
              Compliance or super-admin wallets should manage whitelist updates.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-white/10 bg-card/85 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <CardHeader>
          <CardTitle className="text-base">Current Whitelist State</CardTitle>
          <CardDescription>
            Latest observed whitelist status by wallet from on-chain events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rowsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-background/40 p-4 text-sm text-muted-foreground">
              No whitelist events found yet.
            </div>
          ) : (
            rows.map((row) => {
              const saved = findSavedWallet(row.address)
              return (
                <div
                  key={`${row.address}-${row.lastBlock}`}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-mono text-sm text-foreground">{row.address}</div>
                    {saved && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {saved.label}
                        {saved.intendedRole ? ` • ${saved.intendedRole}` : ""}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      Last block: {row.lastBlock}
                    </div>
                    <a
                      href={getExplorerAddressUrl(row.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View wallet
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="text-right">
                    {row.status ? (
                      <Badge className="border-primary/30 bg-primary/15 text-primary">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Whitelisted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                        <XCircle className="mr-1 h-3 w-3" />
                        Not Whitelisted
                      </Badge>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Tx: {formatAddress(row.txHash, 8)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {!isConnected && (
        <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect MetaMask to manage whitelist status. Read-only whitelist history is still available.
        </div>
      )}

      {isConnected && !isCorrectNetwork && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          Connected wallet is on the wrong network. Switch to Sepolia.
        </div>
      )}
    </DashboardLayout>
  )
}