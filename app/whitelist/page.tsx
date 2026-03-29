"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { useDashboardStore } from "@/lib/store"
import { Shield, Plus, CheckCircle, XCircle, UserX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function WhitelistPage() {
  const { whitelist, addToWhitelist, removeFromWhitelist } = useDashboardStore()
  const [newAddress, setNewAddress] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const stats = {
    total: whitelist.length,
    approved: whitelist.filter(w => w.status === "Approved").length,
    blocked: whitelist.filter(w => w.status === "Blocked").length,
  }

  const handleAddWallet = async () => {
    if (!newAddress) return
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const res = addToWhitelist(newAddress)
    setResult(res)
    setIsLoading(false)
    
    if (res.success) {
      setNewAddress("")
    }
    
    // Clear result after 3 seconds
    setTimeout(() => setResult(null), 3000)
  }

  const handleRemoveWallet = (address: string) => {
    removeFromWhitelist(address)
  }

  return (
    <DashboardLayout 
      title="Whitelist" 
      description="Manage KYC-verified wallet addresses"
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Wallets</p>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-semibold text-primary">{stats.approved}</p>
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

      {/* Add Wallet Form */}
      <Card className="mt-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Add Wallet to Whitelist</CardTitle>
              <CardDescription>Add a KYC-verified wallet address</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddWallet}
                disabled={isLoading || !newAddress}
              >
                {isLoading ? "Adding..." : "Add to Whitelist"}
              </Button>
            </div>
          </div>
          {result && (
            <div className={`mt-4 flex items-center gap-2 rounded-lg p-3 ${
              result.success 
                ? "bg-primary/10 text-primary" 
                : "bg-destructive/10 text-destructive"
            }`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Whitelist Table */}
      <Card className="mt-6 border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-foreground">
            Whitelisted Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Address</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Added</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whitelist.map((wallet) => (
                  <TableRow key={wallet.address} className="border-border">
                    <TableCell className="font-mono text-sm text-foreground">
                      {wallet.address}
                    </TableCell>
                    <TableCell>
                      {wallet.status === "Approved" ? (
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Blocked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(wallet.addedAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      {wallet.status === "Approved" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <UserX className="mr-1 h-4 w-4" />
                              Block
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Block this wallet?</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will prevent the wallet from receiving or transferring tokens. 
                                The wallet can be re-added later if needed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemoveWallet(wallet.address)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Block Wallet
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {wallet.status === "Blocked" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary"
                          onClick={() => addToWhitelist(wallet.address)}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Reactivate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {whitelist.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No wallets in whitelist</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-foreground">Why Whitelist?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The whitelist ensures compliance with KYC (Know Your Customer) regulations. 
            Only verified wallet addresses can participate in token transactions, 
            maintaining regulatory compliance and protecting all token holders.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Compliance Benefits</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>- KYC/AML verification</li>
                <li>- Regulatory adherence</li>
                <li>- Fraud prevention</li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">Security Features</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>- Controlled token flow</li>
                <li>- Audit trail</li>
                <li>- Instant blocking capability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
