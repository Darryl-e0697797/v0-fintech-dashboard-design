"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useWallet } from "@/hooks/use-wallet"
import { getUnifiedTransactions } from "@/lib/web3/contract"
import { formatAddress, getExplorerTxUrl } from "@/lib/web3/client"
import {
  Coins,
  Send,
  Flame,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Ban,
  Clock3,
} from "lucide-react"
import type { UnifiedActivityRow } from "@/types/ethereum"

type ActivityFilter = "all" | "mint" | "burn" | "transfer" | "blocked"

function getTypeIcon(type: UnifiedActivityRow["type"]) {
  switch (type) {
    case "mint":
      return <Coins className="h-4 w-4" />
    case "transfer":
      return <Send className="h-4 w-4" />
    case "burn":
      return <Flame className="h-4 w-4" />
    case "blocked":
      return <Ban className="h-4 w-4" />
    default:
      return <Coins className="h-4 w-4" />
  }
}

function getTypeStyle(type: UnifiedActivityRow["type"]) {
  switch (type) {
    case "mint":
      return "bg-primary/10 text-primary"
    case "transfer":
      return "bg-sky-500/10 text-sky-600"
    case "burn":
      return "bg-destructive/10 text-destructive"
    case "blocked":
      return "bg-amber-500/10 text-amber-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getTypeLabel(type: UnifiedActivityRow["type"]) {
  switch (type) {
    case "mint":
      return "Mint"
    case "transfer":
      return "Transfer"
    case "burn":
      return "Burn"
    case "blocked":
      return "Blocked"
    default:
      return type
  }
}

function formatAmount(amount: string) {
  const value = Number(amount)
  if (Number.isNaN(value)) return amount
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

function formatLastUpdated(value: number | null) {
  if (!value) return "Not loaded"
  return new Date(value).toLocaleString()
}

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "mint", label: "Mint" },
  { key: "burn", label: "Burn" },
  { key: "transfer", label: "Transfer" },
  { key: "blocked", label: "Blocked" },
]

export default function TransactionsPage() {
  const { isConnected, isCorrectNetwork } = useWallet()

  const [rows, setRows] = useState<UnifiedActivityRow[]>([])
  const [filter, setFilter] = useState<ActivityFilter>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getUnifiedTransactions()
      setRows(Array.isArray(data) ? data : [])
      setLastUpdated(Date.now())
    } catch (err) {
      console.error("Error fetching unified transactions:", err)
      setRows([])
      setError("Unable to load transactions from the RPC endpoint right now.")
    } finally {
      setIsLoading(false)
      setHasLoadedOnce(true)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return filter === "all" ? rows : rows.filter((row) => row.type === filter)
  }, [rows, filter])

  const stats = useMemo(() => {
    return {
      total: rows.length,
      mints: rows.filter((r) => r.type === "mint").length,
      transfers: rows.filter((r) => r.type === "transfer").length,
      burns: rows.filter((r) => r.type === "burn").length,
      blocked: rows.filter((r) => r.type === "blocked").length,
    }
  }, [rows])

  return (
    <DashboardLayout
      title="Transactions"
      description="Unified event view for mint, burn, transfer, and blocked transfer activity"
    >
      {(!isConnected || !isCorrectNetwork) && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Read-only mode</p>
              <p className="text-xs text-muted-foreground">
                Event history can still load through the RPC endpoint. Connect a wallet on Sepolia for live write actions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Coins className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Mints</p>
              <p className="text-2xl font-semibold text-primary">{stats.mints}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Coins className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-500/30 bg-sky-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Transfers</p>
              <p className="text-2xl font-semibold text-sky-600">{stats.transfers}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20">
              <Send className="h-5 w-5 text-sky-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Burns</p>
              <p className="text-2xl font-semibold text-destructive">{stats.burns}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-semibold text-amber-600">{stats.blocked}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Ban className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}

          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-4 w-4" />
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-foreground">
            Unified Event Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !hasLoadedOnce ? (
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
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                This usually means the configured RPC endpoint is unavailable or contract reads failed.
              </p>
              <Button variant="outline" size="sm" onClick={load} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {rows.length === 0
                  ? "No transaction events found yet."
                  : `No ${filter} events found for the selected filter.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">From</TableHead>
                    <TableHead className="text-muted-foreground">To</TableHead>
                    <TableHead className="text-muted-foreground">Block</TableHead>
                    <TableHead className="text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-right text-muted-foreground">Tx Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row, i) => (
                    <TableRow
                      key={`${row.txHash}-${row.blockNumber}-${row.type}-${i}`}
                      className="border-border"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded ${getTypeStyle(row.type)}`}
                          >
                            {getTypeIcon(row.type)}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {getTypeLabel(row.type)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {formatAmount(row.amount)}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.type === "mint" ? (
                          <Badge variant="outline" className="text-xs">
                            Minted
                          </Badge>
                        ) : (
                          formatAddress(row.from)
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.type === "burn" ? (
                          <Badge variant="outline" className="text-xs">
                            Burned
                          </Badge>
                        ) : (
                          formatAddress(row.to)
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        #{row.blockNumber.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {row.type === "blocked" ? row.reason ?? "Blocked by compliance rule" : "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <a
                          href={getExplorerTxUrl(row.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {row.txHash.slice(0, 10)}...
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

      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-foreground">Transaction Types</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Mint</p>
                <p className="text-xs text-muted-foreground">
                  New tokens created and assigned to a wallet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                <Send className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Tokens moved between permitted wallets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Burn</p>
                <p className="text-xs text-muted-foreground">
                  Tokens permanently removed from circulation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Ban className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Blocked Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Attempted transfer rejected by whitelist or compliance rules.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}