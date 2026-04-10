"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/hooks/use-wallet"
import { DEMO_WALLETS } from "@/lib/demo-wallets"
import { clearDemoSessionCookies } from "@/lib/demo-session"
import { formatAddress, getExplorerAddressUrl } from "@/lib/web3/client"
import { AlertTriangle, ExternalLink, LogOut, Shield, Wallet } from "lucide-react"

export function WalletButton() {
  const {
    isConnected,
    address,
    isCorrectNetwork,
    currentProfile,
    isProfileMatch,
    isLoading,
    isMetaMaskInstalled,
    connect,
    switchNetwork,
  } = useWallet()

  const profileLabel = DEMO_WALLETS[currentProfile].label

  const handleLogout = () => {
    clearDemoSessionCookies()
    window.location.href = "/login"
  }

  if (!isMetaMaskInstalled) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          {profileLabel}
        </span>
        <Button variant="outline" size="sm" asChild>
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
            Install MetaMask
          </a>
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          {profileLabel}
        </span>
        <Button onClick={connect} disabled={isLoading} size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          {profileLabel}
        </span>
        <Button onClick={switchNetwork} variant="destructive" size="sm">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Wrong Network
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-md border px-2 py-1 text-xs ${
          isProfileMatch
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-amber-500/30 bg-amber-500/10 text-amber-500"
        }`}
      >
        {profileLabel}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="font-mono">
            <Wallet className="mr-2 h-4 w-4" />
            {formatAddress(address || "")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{profileLabel}</div>
            <div className="mt-1">
              {isProfileMatch ? "Connected wallet matches profile" : "Connected wallet does not match profile"}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={getExplorerAddressUrl(address || "")} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View wallet on explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Shield className="mr-2 h-4 w-4" />
            Expected: {formatAddress(DEMO_WALLETS[currentProfile].address)}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}