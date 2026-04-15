"use client"

import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { formatAddress } from "@/lib/web3/client"
import { Wallet, AlertTriangle } from "lucide-react"

export function WalletButton() {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchNetwork,
    isLoading,
    error,
  } = useWallet()

  // MetaMask (or compatible wallet) not detected
  if (!isMetaMaskInstalled) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">No wallet detected</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("https://metamask.io/download/", "_blank")}
        >
          Install MetaMask
        </Button>
      </div>
    )
  }

  // Not connected — show connect button (triggers wallet popup on click)
  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button onClick={connect} disabled={isLoading} size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    )
  }

  // Connected but on wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Wrong Network
        </span>
        <Button variant="outline" size="sm" onClick={switchNetwork}>
          Switch to Sepolia
        </Button>
        <Button variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  // Connected on correct network
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
        <Wallet className="mr-1.5 inline h-3 w-3" />
        {formatAddress(address!)}
      </span>
      <Button variant="ghost" size="sm" onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  )
}
