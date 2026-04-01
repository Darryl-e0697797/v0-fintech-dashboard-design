"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { 
  mintTokens, 
  burnTokens, 
  transferTokens, 
  getBalanceOf,
  isWhitelisted 
} from "@/lib/web3/contract"
import { getExplorerTxUrl } from "@/lib/web3/client"
import { Coins, Send, Flame, CheckCircle, XCircle, Loader2, ExternalLink, AlertTriangle } from "lucide-react"

type TxStatus = "idle" | "submitting" | "confirming" | "confirmed" | "failed"

interface TxResult {
  status: TxStatus
  message: string
  txHash?: string
}

function MintSection() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [amount, setAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [result, setResult] = useState<TxResult | null>(null)

  const handleMint = async () => {
    if (!amount || !walletAddress || !isConnected) return
    
    setResult({ status: "submitting", message: "Submitting transaction..." })
    
    try {
      // Check if recipient is whitelisted
      const whitelisted = await isWhitelisted(walletAddress)
      if (!whitelisted) {
        setResult({ 
          status: "failed", 
          message: "Recipient wallet is not whitelisted. KYC verification required." 
        })
        return
      }

      const tx = await mintTokens(walletAddress, amount)
      setResult({ 
        status: "confirming", 
        message: "Waiting for confirmation...",
        txHash: tx.hash 
      })
      
      await tx.wait()
      setResult({ 
        status: "confirmed", 
        message: `Successfully minted ${amount} GCORE tokens`,
        txHash: tx.hash 
      })
      setAmount("")
      setWalletAddress("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setResult({ status: "failed", message })
    }
  }

  const isDisabled = !isConnected || !isCorrectNetwork || !amount || !walletAddress || result?.status === "submitting" || result?.status === "confirming"

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
            disabled={!isConnected || !isCorrectNetwork}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mint-wallet">Wallet Address</Label>
          <Input
            id="mint-wallet"
            placeholder="0x..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            disabled={!isConnected || !isCorrectNetwork}
          />
        </div>
        <Button 
          onClick={handleMint} 
          disabled={isDisabled}
          className="w-full"
        >
          {result?.status === "submitting" || result?.status === "confirming" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {result.status === "submitting" ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Mint Tokens"
          )}
        </Button>
        <TxResultDisplay result={result} />
      </CardContent>
    </Card>
  )
}

function TransferSection() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [amount, setAmount] = useState("")
  const [toAddress, setToAddress] = useState("")
  const [balance, setBalance] = useState<string | null>(null)
  const [result, setResult] = useState<TxResult | null>(null)

  // Fetch balance when wallet connects
  useState(() => {
    if (address && isConnected && isCorrectNetwork) {
      getBalanceOf(address).then(setBalance).catch(() => setBalance(null))
    }
  })

  const handleTransfer = async () => {
    if (!amount || !toAddress || !isConnected) return
    
    setResult({ status: "submitting", message: "Submitting transaction..." })
    
    try {
      // Check if recipient is whitelisted
      const whitelisted = await isWhitelisted(toAddress)
      if (!whitelisted) {
        setResult({ 
          status: "failed", 
          message: "Transfer blocked: recipient wallet is not whitelisted" 
        })
        return
      }

      const tx = await transferTokens(toAddress, amount)
      setResult({ 
        status: "confirming", 
        message: "Waiting for confirmation...",
        txHash: tx.hash 
      })
      
      await tx.wait()
      setResult({ 
        status: "confirmed", 
        message: `Successfully transferred ${amount} GCORE tokens`,
        txHash: tx.hash 
      })
      setAmount("")
      setToAddress("")
      
      // Refresh balance
      if (address) {
        getBalanceOf(address).then(setBalance).catch(() => {})
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setResult({ status: "failed", message })
    }
  }

  const isDisabled = !isConnected || !isCorrectNetwork || !amount || !toAddress || result?.status === "submitting" || result?.status === "confirming"

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/20">
            <Send className="h-5 w-5 text-[#3b82f6]" />
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
            disabled={!isConnected || !isCorrectNetwork}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="transfer-amount">Amount</Label>
            {balance && (
              <span className="text-xs text-muted-foreground">
                Balance: {parseFloat(balance).toFixed(2)}
              </span>
            )}
          </div>
          <Input
            id="transfer-amount"
            type="number"
            placeholder="Enter amount to transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isConnected || !isCorrectNetwork}
          />
        </div>
        <Button 
          onClick={handleTransfer} 
          disabled={isDisabled}
          className="w-full"
          variant="secondary"
        >
          {result?.status === "submitting" || result?.status === "confirming" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {result.status === "submitting" ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Transfer Tokens"
          )}
        </Button>
        <TxResultDisplay result={result} />
      </CardContent>
    </Card>
  )
}

function BurnSection() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<string | null>(null)
  const [result, setResult] = useState<TxResult | null>(null)

  // Fetch balance when wallet connects
  useState(() => {
    if (address && isConnected && isCorrectNetwork) {
      getBalanceOf(address).then(setBalance).catch(() => setBalance(null))
    }
  })

  const handleBurn = async () => {
    if (!amount || !address || !isConnected) return
    
    setResult({ status: "submitting", message: "Submitting transaction..." })
    
    try {
      const tx = await burnTokens(address, amount)
      setResult({ 
        status: "confirming", 
        message: "Waiting for confirmation...",
        txHash: tx.hash 
      })
      
      await tx.wait()
      setResult({ 
        status: "confirmed", 
        message: `Successfully burned ${amount} GCORE tokens`,
        txHash: tx.hash 
      })
      setAmount("")
      
      // Refresh balance
      getBalanceOf(address).then(setBalance).catch(() => {})
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed"
      setResult({ status: "failed", message })
    }
  }

  const isDisabled = !isConnected || !isCorrectNetwork || !amount || result?.status === "submitting" || result?.status === "confirming"

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
            {balance && (
              <span className="text-xs text-muted-foreground">
                Balance: {parseFloat(balance).toFixed(2)}
              </span>
            )}
          </div>
          <Input
            id="burn-amount"
            type="number"
            placeholder="Enter amount to burn"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!isConnected || !isCorrectNetwork}
          />
        </div>
        <Button 
          onClick={handleBurn} 
          disabled={isDisabled}
          className="w-full"
          variant="destructive"
        >
          {result?.status === "submitting" || result?.status === "confirming" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {result.status === "submitting" ? "Submitting..." : "Confirming..."}
            </>
          ) : (
            "Burn Tokens"
          )}
        </Button>
        <TxResultDisplay result={result} />
      </CardContent>
    </Card>
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
        {result.status === "failed" && result.message.includes("whitelist") && (
          <span className="text-xs opacity-80 block mt-1">
            KYC required - Wallet must be whitelisted before receiving tokens
          </span>
        )}
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

export default function TokenActionsPage() {
  const { isConnected, isCorrectNetwork } = useWallet()

  return (
    <DashboardLayout 
      title="Token Actions" 
      description="Mint, transfer, and burn GCORE tokens"
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
                  ? "Connect your wallet to perform token actions" 
                  : "Please switch to the correct network to interact with the contract"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
