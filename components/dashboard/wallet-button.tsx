"use client"

import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WalletButton() {
  const { address, isConnected, connect, disconnect, isLoading, error } = useWallet()
  const [manualAddress, setManualAddress] = useState(address ?? "")

  return (
    <div className="flex items-center gap-2">
      <Input
        value={manualAddress}
        onChange={(e) => setManualAddress(e.target.value)}
        placeholder="Enter wallet address"
        className="w-[280px]"
      />
      <Button onClick={() => connect(manualAddress)} disabled={isLoading}>
        {isConnected ? "Update Address" : "Connect Wallet"}
      </Button>
      {isConnected && (
        <Button variant="outline" onClick={disconnect}>
          Clear
        </Button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}