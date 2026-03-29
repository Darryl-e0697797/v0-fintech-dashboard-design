"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDashboardStore, Transaction } from "@/lib/store"
import { Coins, Send, Flame, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

function getTypeIcon(type: Transaction["type"]) {
  switch (type) {
    case "Mint":
      return <Coins className="h-4 w-4" />
    case "Transfer":
      return <Send className="h-4 w-4" />
    case "Burn":
      return <Flame className="h-4 w-4" />
  }
}

function getStatusBadge(status: Transaction["status"]) {
  switch (status) {
    case "Success":
      return (
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          <CheckCircle className="mr-1 h-3 w-3" />
          Success
        </Badge>
      )
    case "Blocked":
      return (
        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Blocked
        </Badge>
      )
    case "Pending":
      return (
        <Badge variant="outline" className="border-chart-4/30 bg-chart-4/10 text-chart-4">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
  }
}

export default function TransactionsPage() {
  const { transactions } = useDashboardStore()

  const stats = {
    total: transactions.length,
    success: transactions.filter(t => t.status === "Success").length,
    blocked: transactions.filter(t => t.status === "Blocked").length,
  }

  return (
    <DashboardLayout 
      title="Transactions" 
      description="View all token transactions and their status"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
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
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-semibold text-primary">{stats.success}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-semibold text-destructive">{stats.blocked}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="mt-6 border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-foreground">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Tx Hash</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">From / To</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">
                      {tx.txHash}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-6 w-6 items-center justify-center rounded ${
                          tx.type === "Mint" ? "bg-primary/10 text-primary" :
                          tx.type === "Transfer" ? "bg-chart-2/10 text-chart-2" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="text-sm text-foreground">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {tx.type === "Mint" && tx.to && (
                        <span>To: {tx.to.slice(0, 10)}...</span>
                      )}
                      {tx.type === "Transfer" && (
                        <>
                          <span className="block">From: {tx.from?.slice(0, 10)}...</span>
                          <span className="block">To: {tx.to?.slice(0, 10)}...</span>
                        </>
                      )}
                      {tx.type === "Burn" && tx.from && (
                        <span>From: {tx.from.slice(0, 10)}...</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-foreground">Transaction Status Guide</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Success</p>
                <p className="text-xs text-muted-foreground">
                  Transaction completed successfully and recorded on-chain.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Blocked</p>
                <p className="text-xs text-muted-foreground">
                  Transaction blocked due to non-whitelisted wallet address.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
                <Clock className="h-4 w-4 text-chart-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pending</p>
                <p className="text-xs text-muted-foreground">
                  Transaction is being processed and awaiting confirmation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
