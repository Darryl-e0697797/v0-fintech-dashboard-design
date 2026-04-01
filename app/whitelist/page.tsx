"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { useWallet } from "@/hooks/use-wallet"
import { isWhitelisted, setWhitelistStatus } from "@/lib/web3/contract"
import { getExplorerTxUrl, getExplorerAddressUrl } from "@/lib/web3/client"
import { 
  Shield, 
  Plus, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Search, 
  Loader2, 
  ExternalLink,
  AlertTriangle 
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

export default function WhitelistPage() {
  const { isConnected, isCorrectNetwork } = useWallet()
  
  // Add wallet state
  const [newAddress, setNewAddress] = useState("")
  const [addResult, setAddResult] = useState<TxResult | null>(null)
  
  // Check wallet state
  const [checkAddress, setCheckAddress] = useState("")
  const [checkResult, setCheckResult] = useState<WhitelistCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  
  // Remove wallet state
  const [removeAddress, setRemoveAddress] = useState("")
  const [removeResult, setRemoveResult] = useState<TxResult | null>(null)

  // Recent checks history (in-memory)
  const [recentChecks, setRecentChecks] = useState<WhitelistCheckResult[]>([])

  const handleAddWallet = async () => {
    if (!newAddress || !isConnected || !isCorrectNetwork) return
    
    setAddResult({ status: "submitting", message: "Submitting transaction..." })
    
    try {
      const tx = await setWhitelistStatus(newAddress, true)
      setAddResult({ 
        status: "confirming", 
        message: "Waiting for confirmation...",
        txHash: tx.hash 
      })
      
      await tx.wait()
      setAddResult({ 
        status: "confirmed", 
        message: `Wallet ${newAddress.slice(0, 10)}... has been whitelisted`,
        txHash: tx.hash 
      })
      setNewAddress("")
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
      setRecentChecks(prev => [result, ...prev.slice(0, 4)])
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
        txHash: tx.hash 
      })
      
      await tx.wait()
      setRemoveResult({ 
        status: "confirmed", 
        message: `Wallet ${removeAddress.slice(0, 10)}... has been removed from whitelist`,
        txHash: tx.hash 
      })
      setRemoveAddress("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setRemoveResult({ status: "failed", message })
    }
  }

  const isAddDisabled = !isConnected || !isCorrectNetwork || !newAddress || addResult?.status === "submitting" || addResult?.status === "confirming"
  const isRemoveDisabled = !isConnected || !isCorrectNetwork || !removeAddress || removeResult?.status === "submitting" || removeResult?.status === "confirming"

  return (
    <DashboardLayout 
      title="Whitelist" 
      description="Manage KYC-verified wallet addresses"
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
                  ? "Connect your wallet to manage the whitelist (owner only)" 
                  : "Please switch to the correct network"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check Whitelist Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Check Whitelist Status</CardTitle>
                <CardDescription>Verify if a wallet is whitelisted</CardDescription>
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
              <div className={`flex items-center gap-3 rounded-lg p-4 ${
                checkResult.isWhitelisted 
                  ? "bg-primary/10 border border-primary/30" 
                  : "bg-destructive/10 border border-destructive/30"
              }`}>
                {checkResult.isWhitelisted ? (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    checkResult.isWhitelisted ? "text-primary" : "text-destructive"
                  }`}>
                    {checkResult.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
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
            <Button 
              onClick={handleAddWallet}
              disabled={isAddDisabled}
              className="w-full"
            >
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
                <Button 
                  disabled={isRemoveDisabled}
                  className="w-full"
                  variant="destructive"
                >
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
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Remove this wallet?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will prevent the wallet from receiving or transferring tokens. 
                    The wallet can be re-added later if needed.
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
                      <span className="text-sm font-mono">
                        {check.address.slice(0, 10)}...{check.address.slice(-6)}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={check.isWhitelisted 
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
        <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />
      ) : result.status === "confirmed" ? (
        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
      ) : result.status === "failed" ? (
        <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
      ) : null}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{result.message}</span>
        {result.txHash && (
          <a 
            href={getExplorerTxUrl(result.txHash)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 mt-1 hover:underline"
          >
            View transaction <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  )
}
