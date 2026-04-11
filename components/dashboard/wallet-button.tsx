"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/hooks/use-wallet"
import { formatAddress, getExplorerAddressUrl } from "@/lib/web3/client"
import { Wallet, ExternalLink, LogOut, AlertTriangle } from "lucide-react"

export function WalletButton() {
  const {
    isConnected,
    address,
    isCorrectNetwork,
    isLoading,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Wallet
      </Button>
    )
  }

  if (!isMetaMaskInstalled) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          <Wallet className="mr-2 h-4 w-4" />
          Install MetaMask
        </a>
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button onClick={connect} disabled={isLoading} size="sm">
        <Wallet className="mr-2 h-4 w-4" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Button onClick={switchNetwork} variant="destructive" size="sm" disabled={isLoading}>
        <AlertTriangle className="mr-2 h-4 w-4" />
        Wrong Network
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address || "")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a
            href={getExplorerAddressUrl(address || "")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}