"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboardStore } from "@/lib/store"
import { Coins, Send, Flame, CheckCircle, XCircle } from "lucide-react"

interface ActionResult {
  success: boolean
  message: string
}

function MintSection() {
  const { mintTokens } = useDashboardStore()
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleMint = async () => {
    if (!amount || !walletAddress) return
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const res = mintTokens(Number(amount), walletAddress)
    setResult(res)
    setIsLoading(false)
    
    if (res.success) {
      setAmount("")
      setWalletAddress("")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Mint Tokens</CardTitle>
            <CardDescription>Create new GCORE tokens</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mint-amount">Amount</Label>
          <Input
            id="mint-amount"
            type="number"
            placeholder="Enter amount to mint"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mint-wallet">Wallet Address</Label>
          <Input
            id="mint-wallet"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleMint} 
          disabled={isLoading || !amount || !walletAddress}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Mint Tokens"}
        </Button>
        {result && (
          <div className={`flex items-start gap-2 rounded-lg p-3 ${
            result.success 
              ? "bg-primary/10 text-primary" 
              : "bg-destructive/10 text-destructive"
          }`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <span className="text-sm font-medium block">{result.message}</span>
              {!result.success && (
                <span className="text-xs opacity-80 block mt-1">KYC required - Wallet must be whitelisted before receiving tokens</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TransferSection() {
  const { transferTokens, myBalance } = useDashboardStore()
  const [amount, setAmount] = useState("")
  const [toAddress, setToAddress] = useState("")
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTransfer = async () => {
    if (!amount || !toAddress) return
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const res = transferTokens(toAddress, Number(amount))
    setResult(res)
    setIsLoading(false)
    
    if (res.success) {
      setAmount("")
      setToAddress("")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
            <Send className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <CardTitle className="text-lg">Transfer Tokens</CardTitle>
            <CardDescription>Send tokens to another wallet</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transfer-to">To Address</Label>
          <Input
            id="transfer-to"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="transfer-amount">Amount</Label>
            <span className="text-xs text-muted-foreground">
              Balance: {myBalance.toLocaleString()}
            </span>
          </div>
          <Input
            id="transfer-amount"
            type="number"
            placeholder="Enter amount to transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleTransfer} 
          disabled={isLoading || !amount || !toAddress}
          className="w-full"
          variant="secondary"
        >
          {isLoading ? "Processing..." : "Transfer Tokens"}
        </Button>
        {result && (
          <div className={`flex items-start gap-2 rounded-lg p-3 ${
            result.success 
              ? "bg-primary/10 text-primary" 
              : "bg-destructive/10 text-destructive"
          }`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <span className="text-sm font-medium block">
                {result.success ? result.message : "Transfer blocked: wallet not whitelisted"}
              </span>
              {!result.success && (
                <span className="text-xs opacity-80 block mt-1">KYC required - Recipient must complete verification before receiving tokens</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BurnSection() {
  const { burnTokens, myBalance } = useDashboardStore()
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBurn = async () => {
    if (!amount) return
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const res = burnTokens(Number(amount))
    setResult(res)
    setIsLoading(false)
    
    if (res.success) {
      setAmount("")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-lg">Burn Tokens</CardTitle>
            <CardDescription>Permanently destroy tokens</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="burn-amount">Amount</Label>
            <span className="text-xs text-muted-foreground">
              Balance: {myBalance.toLocaleString()}
            </span>
          </div>
          <Input
            id="burn-amount"
            type="number"
            placeholder="Enter amount to burn"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleBurn} 
          disabled={isLoading || !amount}
          className="w-full"
          variant="destructive"
        >
          {isLoading ? "Processing..." : "Burn Tokens"}
        </Button>
        {result && (
          <div className={`flex items-center gap-2 rounded-lg p-3 ${
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
  )
}

export default function TokenActionsPage() {
  return (
    <DashboardLayout 
      title="Token Actions" 
      description="Mint, transfer, and burn GCORE tokens"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <MintSection />
        <TransferSection />
        <BurnSection />
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-medium text-foreground">How it works</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-foreground">Minting</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create new tokens and add them to a whitelisted wallet. Only KYC-verified addresses can receive tokens.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Transferring</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Send tokens to another whitelisted address. Transfers to non-whitelisted wallets will be blocked.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Burning</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently remove tokens from circulation. This reduces total supply and your balance.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
