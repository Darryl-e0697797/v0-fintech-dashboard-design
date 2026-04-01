"use client"

import { useEffect, useState } from "react"
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
import { getRecentTransfers } from "@/lib/web3/contract"
import { fromTokenUnits, getExplorerTxUrl, formatAddress } from "@/lib/web3/client"
import { Coins, Send, Flame, CheckCircle, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react"
import type { TransferEvent } from "@/types/ethereum"

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

interface DisplayTransaction {
  type: "Mint" | "Transfer" | "Burn"
  from: string
  to: string
  amount: string
  txHash: string
  blockNumber: number
}

function getTransactionType(from: string, to: string): "Mint" | "Transfer" | "Burn" {
  if (from === ZERO_ADDRESS) return "Mint"
  if (to === ZERO_ADDRESS) return "Burn"
  return "Transfer"
}

function getTypeIcon(type: DisplayTransaction["type"]) {
  switch (type) {
    case "Mint":
      return <Coins className="h-4 w-4" />
    case "Transfer":
      return <Send className="h-4 w-4" />
    case "Burn":
      return <Flame className="h-4 w-4" />
  }
}

function getTypeStyle(type: DisplayTransaction["type"]) {
  switch (type) {
    case "Mint":
      return "bg-primary/10 text-primary"
    case "Transfer":
      return "bg-[#3b82f6]/10 text-[#3b82f6]"
    case "Burn":
      return "bg-destructive/10 text-destructive"
  }
}

export default function TransactionsPage() {
  const { isConnected, isCorrectNetwork } = useWallet()
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!isConnected || !isCorrectNetwork) {
      setTransactions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const events = await getRecentTransfers()
      
      const displayTxs: DisplayTransaction[] = events.map((event: TransferEvent) => ({
        type: getTransactionType(event.from, event.to),
        from: event.from,
        to: event.to,
        amount: fromTokenUnits(event.value),
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
      })).reverse() // Most recent first

      setTransactions(displayTxs)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [isConnected, isCorrectNetwork])

  const stats = {
    total: transactions.length,
    mints: transactions.filter(t => t.type === "Mint").length,
    transfers: transactions.filter(t => t.type === "Transfer").length,
    burns: transactions.filter(t => t.type === "Burn").length,
  }

  return (
    <DashboardLayout 
      title="Transactions" 
      description="View all token transactions from the blockchain"
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
                {!isConnected ? "Wallet not connected" : "Wrong network"}
              </p>
              <p className="text-xs text-muted-foreground">
                {!isConnected 
                  ? "Connect your wallet to view live transactions" 
                  : "Please switch to the correct network"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
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

        <Card className="border-[#3b82f6]/30 bg-[#3b82f6]/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Transfers</p>
              <p className="text-2xl font-semibold text-[#3b82f6]">{stats.transfers}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/20">
              <Send className="h-5 w-5 text-[#3b82f6]" />
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
      </div>

      {/* Transactions Table */}
      <Card className="mt-6 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-foreground">
              Recent Transfer Events
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTransactions}
              disabled={isLoading || !isConnected || !isCorrectNetwork}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchTransactions}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {isConnected && isCorrectNetwork 
                  ? "No transactions found" 
                  : "Connect wallet to view transactions"
                }
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
                    <TableHead className="text-right text-muted-foreground">Tx Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, i) => (
                    <TableRow key={`${tx.txHash}-${i}`} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded ${getTypeStyle(tx.type)}`}>
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {parseFloat(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.from === ZERO_ADDRESS ? (
                          <Badge variant="outline" className="text-xs">Minted</Badge>
                        ) : (
                          formatAddress(tx.from)
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tx.to === ZERO_ADDRESS ? (
                          <Badge variant="outline" className="text-xs">Burned</Badge>
                        ) : (
                          formatAddress(tx.to)
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        #{tx.blockNumber.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href={getExplorerTxUrl(tx.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {tx.txHash.slice(0, 10)}...
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
          <h3 className="text-base font-medium text-foreground">Transaction Types</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Mint</p>
                <p className="text-xs text-muted-foreground">
                  New tokens created and sent to a wallet (from zero address).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6]/10">
                <Send className="h-4 w-4 text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Transfer</p>
                <p className="text-xs text-muted-foreground">
                  Tokens moved between two whitelisted wallets.
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
                  Tokens permanently destroyed (sent to zero address).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
