"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import { DEMO_WALLET_LIST } from "@/lib/demo-wallets"
import {
  attemptOperatorTransfer,
  burnTokens,
  mintTokens,
  transferTokens,
} from "@/lib/web3/contract"

export default function TokenActionsPage() {
  const { currentProfile } = useWallet()
  const isAdmin = currentProfile === "admin"

  const [mintTo, setMintTo] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [burnFrom, setBurnFrom] = useState("")
  const [burnAmount, setBurnAmount] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [opFrom, setOpFrom] = useState("")
  const [opTo, setOpTo] = useState("")
  const [opAmount, setOpAmount] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  async function handleMint() {
    const tx = await mintTokens(mintTo, mintAmount)
    await tx.wait()
    setMessage(`Mint confirmed: ${tx.hash}`)
  }

  async function handleBurn() {
    const tx = await burnTokens(burnFrom, burnAmount)
    await tx.wait()
    setMessage(`Burn confirmed: ${tx.hash}`)
  }

  async function handleTransfer() {
    const tx = await transferTokens(transferTo, transferAmount)
    await tx.wait()
    setMessage(`Transfer confirmed: ${tx.hash}`)
  }

  async function handleOperatorTransfer() {
    const tx = await attemptOperatorTransfer(opFrom, opTo, opAmount)
    await tx.wait()
    setMessage(`Operator transfer attempt confirmed: ${tx.hash}`)
  }

  const demoOptions = DEMO_WALLET_LIST.map((wallet) => (
    <option key={wallet.key} value={wallet.address}>
      {wallet.label} — {wallet.address}
    </option>
  ))

  return (
    <DashboardLayout title="Token Actions" description="Mint, burn, transfer, and blocked transfer demo controls">
      {message && (
        <Card className="mb-6 border-primary/30 bg-primary/10">
          <CardContent className="p-4 text-sm text-primary">{message}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {isAdmin && (
          <>
            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Mint</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={mintTo} onChange={(e) => setMintTo(e.target.value)}>
                  <option value="">Select wallet</option>
                  {demoOptions}
                </select>
                <Input placeholder="Or freeform address" value={mintTo} onChange={(e) => setMintTo(e.target.value)} />
                <Input placeholder="Amount" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} />
                <Button onClick={handleMint}>Mint tokens</Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader><CardTitle className="text-base">Burn</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={burnFrom} onChange={(e) => setBurnFrom(e.target.value)}>
                  <option value="">Select wallet</option>
                  {demoOptions}
                </select>
                <Input placeholder="Or freeform address" value={burnFrom} onChange={(e) => setBurnFrom(e.target.value)} />
                <Input placeholder="Amount" value={burnAmount} onChange={(e) => setBurnAmount(e.target.value)} />
                <Button variant="destructive" onClick={handleBurn}>Burn tokens</Button>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Operator Transfer Attempt</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={opFrom} onChange={(e) => setOpFrom(e.target.value)}>
                    <option value="">From wallet</option>
                    {demoOptions}
                  </select>
                  <Input placeholder="Or freeform from address" value={opFrom} onChange={(e) => setOpFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={opTo} onChange={(e) => setOpTo(e.target.value)}>
                    <option value="">To wallet</option>
                    {demoOptions}
                  </select>
                  <Input placeholder="Or freeform to address" value={opTo} onChange={(e) => setOpTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Amount" value={opAmount} onChange={(e) => setOpAmount(e.target.value)} />
                  <Button onClick={handleOperatorTransfer}>Attempt transfer</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Self Transfer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
              <option value="">Select recipient</option>
              {demoOptions}
            </select>
            <Input placeholder="Or freeform address" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
            <Input placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
            <Button onClick={handleTransfer}>Transfer tokens</Button>
          </CardContent>
        </Card>

        {!isAdmin && (
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">Investor Mode</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Mint, burn, whitelist, and operator transfer attempt are hidden for non-admin demo profiles.
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}