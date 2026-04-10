"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useWallet } from "@/hooks/use-wallet"
import { findDemoWalletByAddress, DEMO_WALLET_LIST } from "@/lib/demo-wallets"
import {
  getBalanceOf,
  getCurrentWhitelistState,
  isWhitelisted,
  setWhitelistStatus,
} from "@/lib/web3/contract"
import { getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/web3/client"
import {
  Shield,
  Plus,
  CheckCircle,
  XCircle,
  UserX,
  Search,
  Loader2,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Users,
  Ban,
} from "lucide-react"

type TxStatus = "idle" | "submitting" | "confirming" | "confirmed" | "failed"

interface TxResult {
  status: TxStatus
  message: string
  txHash?: string
}

interface WhitelistCheckResult {
  address: string
  isWhitelisted: boolean
  checkedAt: Date
}

interface WhitelistStateRow {
  address: string
  status: boolean
  lastBlock: number
  txHash: string
  balance: string
  label: string
  expected: boolean
}

export default function WhitelistPage() {
  const { isConnected, isCorrectNetwork } = useWallet()

  const [newAddress, setNewAddress] = useState("")
  const [addResult, setAddResult] = useState<TxResult | null>(null)

  const [checkAddress, setCheckAddress] = useState("")
  const [checkResult, setCheckResult] = useState<WhitelistCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const [removeAddress, setRemoveAddress] = useState("")
  const [removeResult, setRemoveResult] = useState<TxResult | null>(null)

  const [recentChecks, setRecentChecks] = useState<WhitelistCheckResult[]>([])

  const [rows, setRows] = useState<WhitelistStateRow[]>([])
  const [isLoadingState, setIsLoadingState] = useState(false)
  const [stateError, setStateError] = useState<string | null>(null)

  const loadWhitelistState = async () => {
    setIsLoadingState(true)
    setStateError(null)

    try {
      const state = await getCurrentWhitelistState()

      const withBalances = await Promise.all(
        state.map(async (row) => {
          const balance = await getBalanceOf(row.address).catch(() => "0")
          const demo = findDemoWalletByAddress(row.address)

          return {
            ...row,
            balance,
            label: demo?.label ?? "Unknown Wallet",
            expected: demo?.shouldBeWhitelisted ?? false,
          }
        })
      )

      setRows(withBalances)
    } catch (err) {
      console.error("Error loading whitelist state:", err)
      setStateError("Failed to load whitelist state")
    } finally {
      setIsLoadingState(false)
    }
  }

  useEffect(() => {
    loadWhitelistState()
  }, [])

  const handleAddWallet = async () => {
    if (!newAddress || !isConnected || !isCorrectNetwork) return

    setAddResult({ status: "submitting", message: "Submitting transaction..." })

    try {
      const tx = await setWhitelistStatus(newAddress, true)
      setAddResult({
        status: "confirming",
        message: "Waiting for confirmation...",
        txHash: tx.hash,
      })

      await tx.wait()

      setAddResult({
        status: "confirmed",
        message: `Wallet ${newAddress.slice(0, 10)}... has been whitelisted`,
        txHash: tx.hash,
      })

      setNewAddress("")
      await loadWhitelistState()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setAddResult({ status: "failed", message })
    }
  }

  const handleCheckWallet = async () => {
    if (!checkAddress) return

    setIsChecking(true)
    setCheckResult(null)

    try {
      const whitelisted = await isWhitelisted(checkAddress)
      const result: WhitelistCheckResult = {
        address: checkAddress,
        isWhitelisted: whitelisted,
        checkedAt: new Date(),
      }

      setCheckResult(result)
      setRecentChecks((prev) => [result, ...prev.slice(0, 4)])
    } catch (err) {
      console.error("Error checking whitelist:", err)
    } finally {
      setIsChecking(false)
    }
  }

  const handleRemoveWallet = async () => {
    if (!removeAddress || !isConnected || !isCorrectNetwork) return

    setRemoveResult({ status: "submitting", message: "Submitting transaction..." })

    try {
      const tx = await setWhitelistStatus(removeAddress, false)
      setRemoveResult({
        status: "confirming",
        message: "Waiting for confirmation...",
        txHash: tx.hash,
      })

      await tx.wait()

      setRemoveResult({
        status: "confirmed",
        message: `Wallet ${removeAddress.slice(0, 10)}... has been removed from whitelist`,
        txHash: tx.hash,
      })

      setRemoveAddress("")
      await loadWhitelistState()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setRemoveResult({ status: "failed", message })
    }
  }

  const isAddDisabled =
    !isConnected ||
    !isCorrectNetwork ||
    !newAddress ||
    addResult?.status === "submitting" ||
    addResult?.status === "confirming"

  const isRemoveDisabled =
    !isConnected ||
    !isCorrectNetwork ||
    !removeAddress ||
    removeResult?.status === "submitting" ||
    removeResult?.status === "confirming"

  const stats = useMemo(() => {
    return {
      active: rows.filter((r) => r.status).length,
      blocked: rows.filter((r) => !r.status).length,
      demoCount: DEMO_WALLET_LIST.length,
    }
  }, [rows])

  return (
    <DashboardLayout
      title="Whitelist"
      description="Manage KYC-approved wallets and review current whitelist state"
    >
      {/* Connection Warning */}
      {(!isConnected || !isCorrectNetwork) && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Read-only whitelist view
              </p>
              <p className="text-xs text-muted-foreground">
                You can still check wallet status and review whitelist state. Connect the correct admin wallet on the correct network to add or remove wallets.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Whitelisted</p>
              <p className="text-2xl font-semibold text-foreground">{stats.active}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Blocked / Removed</p>
              <p className="text-2xl font-semibold text-foreground">{stats.blocked}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Demo Wallet Count</p>
              <p className="text-2xl font-semibold text-foreground">{stats.demoCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Check Whitelist Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Check Whitelist Status</CardTitle>
                <CardDescription>Verify whether a wallet is approved</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="check-address">Wallet Address</Label>
              <Input
                id="check-address"
                placeholder="0x..."
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCheckWallet}
              disabled={!checkAddress || isChecking}
              className="w-full"
              variant="secondary"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>

            {checkResult && (
              <div
                className={`flex items-center gap-3 rounded-lg p-4 ${
                  checkResult.isWhitelisted
                    ? "border border-primary/30 bg-primary/10"
                    : "border border-destructive/30 bg-destructive/10"
                }`}
              >
                {checkResult.isWhitelisted ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      checkResult.isWhitelisted ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {checkResult.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {checkResult.address}
                  </p>
                </div>

                <a
                  href={getExplorerAddressUrl(checkResult.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Wallet */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Add to Whitelist</CardTitle>
                <CardDescription>Approve a wallet for token transfers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-address">Wallet Address</Label>
              <Input
                id="add-address"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                disabled={!isConnected || !isCorrectNetwork}
              />
            </div>

            <Button onClick={handleAddWallet} disabled={isAddDisabled} className="w-full">
              {addResult?.status === "submitting" || addResult?.status === "confirming" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {addResult.status === "submitting" ? "Submitting..." : "Confirming..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Whitelist
                </>
              )}
            </Button>

            <TxResultDisplay result={addResult} />
          </CardContent>
        </Card>

        {/* Remove Wallet */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
                <UserX className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">Remove from Whitelist</CardTitle>
                <CardDescription>Block a wallet from token transfers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remove-address">Wallet Address</Label>
              <Input
                id="remove-address"
                placeholder="0x..."
                value={removeAddress}
                onChange={(e) => setRemoveAddress(e.target.value)}
                disabled={!isConnected || !isCorrectNetwork}
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={isRemoveDisabled} className="w-full" variant="destructive">
                  {removeResult?.status === "submitting" || removeResult?.status === "confirming" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {removeResult.status === "submitting" ? "Submitting..." : "Confirming..."}
                    </>
                  ) : (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Remove from Whitelist
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Remove this wallet?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will prevent the wallet from receiving or transferring tokens. You can add it back later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveWallet}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove Wallet
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <TxResultDisplay result={removeResult} />
          </CardContent>
        </Card>

        {/* Recent Checks */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Recent Checks</CardTitle>
                <CardDescription>Recently verified addresses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentChecks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No recent checks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentChecks.map((check, i) => (
                  <div
                    key={`${check.address}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {check.isWhitelisted ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-mono text-sm">
                        {check.address.slice(0, 10)}...{check.address.slice(-6)}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className={
                        check.isWhitelisted
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      {check.isWhitelisted ? "Approved" : "Not Listed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Whitelist State */}
      <Card className="mt-6 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Current Whitelist State</CardTitle>
              <CardDescription>
                Reconstructed from whitelist events, balances, and demo wallet labels
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadWhitelistState} disabled={isLoadingState}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingState ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingState ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : stateError ? (
            <div className="py-10 text-center">
              <p className="text-sm text-destructive">{stateError}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={loadWhitelistState}>
                Try Again
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No whitelist events found yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Last Block</TableHead>
                    <TableHead className="text-right">Tx</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.address}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="font-mono text-xs">{row.address}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            row.status
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          }
                        >
                          {row.status ? "Whitelisted" : "Removed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.expected ? "Should be whitelisted" : "Should stay blocked"}
                      </TableCell>
                      <TableCell>{row.balance}</TableCell>
                      <TableCell>#{row.lastBlock.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <a
                          href={getExplorerTxUrl(row.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-foreground">Why Whitelist?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The whitelist enforces KYC and compliance controls at the wallet level. Only approved wallets should participate in token transfers, helping maintain regulatory discipline, auditability, and investor protection.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Compliance Benefits</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>- KYC / AML verification</li>
                <li>- Regulatory adherence</li>
                <li>- Controlled investor eligibility</li>
              </ul>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Security Features</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>- Controlled token flow</li>
                <li>- On-chain audit trail</li>
                <li>- Fast blocking capability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

function TxResultDisplay({ result }: { result: TxResult | null }) {
  if (!result) return null

  const statusConfig = {
    idle: { bg: "bg-muted", text: "text-muted-foreground" },
    submitting: { bg: "bg-primary/10", text: "text-primary" },
    confirming: { bg: "bg-primary/10", text: "text-primary" },
    confirmed: { bg: "bg-primary/10", text: "text-primary" },
    failed: { bg: "bg-destructive/10", text: "text-destructive" },
  }

  const config = statusConfig[result.status]

  return (
    <div className={`flex items-start gap-2 rounded-lg p-3 ${config.bg} ${config.text}`}>
      {result.status === "submitting" || result.status === "confirming" ? (
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
      ) : result.status === "confirmed" ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : result.status === "failed" ? (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : null}

      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{result.message}</span>
        {result.txHash && (
          <a
            href={getExplorerTxUrl(result.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-xs hover:underline"
          >
            View transaction <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}