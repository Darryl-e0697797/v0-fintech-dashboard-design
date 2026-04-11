"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/hooks/use-wallet"
import {
  attemptOperatorTransfer,
  burnTokens,
  getRoleStatuses,
  mintTokens,
  transferTokens,
} from "@/lib/web3/contract"
import type { RoleStatus } from "@/types/ethereum"

function RoleBadge({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs ${
        active
          ? "bg-primary/10 text-primary"
          : "border border-border text-muted-foreground"
      }`}
    >
      {label}
    </span>
  )
}

export default function TokenActionsPage() {
  const { address, isConnected, isCorrectNetwork } = useWallet()

  const [roles, setRoles] = useState<RoleStatus | null>(null)
  const [loadingRoles, setLoadingRoles] = useState(false)

  const [mintTo, setMintTo] = useState("")
  const [mintAmount, setMintAmount] = useState("")

  const [burnFrom, setBurnFrom] = useState("")
  const [burnAmount, setBurnAmount] = useState("")

  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")

  const [opFrom, setOpFrom] = useState("")
  const [opTo, setOpTo] = useState("")
  const [opAmount, setOpAmount] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRoles() {
      if (!address || !isConnected || !isCorrectNetwork) {
        setRoles(null)
        return
      }

      try {
        setLoadingRoles(true)
        const result = await getRoleStatuses(address)
        setRoles(result)
      } catch (err) {
        console.error(err)
        setRoles(null)
      } finally {
        setLoadingRoles(false)
      }
    }

    loadRoles()
  }, [address, isConnected, isCorrectNetwork])

  const canOperate = !!roles?.defaultAdmin || !!roles?.operator

  function clearMessages() {
    setFeedback(null)
    setError(null)
  }

  function validateAddress(value: string, label: string) {
    const trimmed = value.trim()
    if (!trimmed) {
      throw new Error(`${label} is required.`)
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      throw new Error(`${label} must be a valid wallet address.`)
    }
    return trimmed
  }

  function validateAmount(value: string) {
    const trimmed = value.trim()
    if (!trimmed) {
      throw new Error("Amount is required.")
    }
    const numeric = Number(trimmed)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new Error("Amount must be greater than 0.")
    }
    return trimmed
  }

  async function handleMint() {
    clearMessages()

    try {
      const to = validateAddress(mintTo, "Recipient wallet")
      const amount = validateAmount(mintAmount)

      setIsSubmitting(true)
      const tx = await mintTokens(to, amount)
      setFeedback(`Mint submitted. Waiting for confirmation: ${tx.hash}`)
      await tx.wait()
      setFeedback(`Mint confirmed: ${tx.hash}`)
      setMintAmount("")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Mint failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBurn() {
    clearMessages()

    try {
      const from = validateAddress(burnFrom, "Burn-from wallet")
      const amount = validateAmount(burnAmount)

      setIsSubmitting(true)
      const tx = await burnTokens(from, amount)
      setFeedback(`Burn submitted. Waiting for confirmation: ${tx.hash}`)
      await tx.wait()
      setFeedback(`Burn confirmed: ${tx.hash}`)
      setBurnAmount("")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Burn failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleTransfer() {
    clearMessages()

    try {
      const to = validateAddress(transferTo, "Recipient wallet")
      const amount = validateAmount(transferAmount)

      setIsSubmitting(true)
      const tx = await transferTokens(to, amount)
      setFeedback(`Transfer submitted. Waiting for confirmation: ${tx.hash}`)
      await tx.wait()
      setFeedback(`Transfer confirmed: ${tx.hash}`)
      setTransferAmount("")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Transfer failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleOperatorTransfer() {
    clearMessages()

    try {
      const from = validateAddress(opFrom, "From wallet")
      const to = validateAddress(opTo, "To wallet")
      const amount = validateAmount(opAmount)

      setIsSubmitting(true)
      const tx = await attemptOperatorTransfer(from, to, amount)
      setFeedback(`Operator transfer attempt submitted. Waiting for confirmation: ${tx.hash}`)
      await tx.wait()
      setFeedback(`Operator transfer attempt confirmed: ${tx.hash}`)
      setOpAmount("")
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : "Operator transfer attempt failed."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Token Actions"
      description="Mint, burn, transfer, and blocked-transfer workflow controls"
    >
      <Card className="mb-6 border-border">
        <CardContent className="p-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
              Connected Wallet: {address || "Not connected"}
            </span>
            <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
              Network: {isConnected ? (isCorrectNetwork ? "Sepolia" : "Wrong network") : "Not connected"}
            </span>

            {loadingRoles ? (
              <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                Loading roles...
              </span>
            ) : (
              <>
                <RoleBadge label="Admin" active={!!roles?.defaultAdmin} />
                <RoleBadge label="Operator" active={!!roles?.operator} />
                <RoleBadge label="Compliance" active={!!roles?.compliance} />
                <RoleBadge label="Oracle" active={!!roles?.oracle} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <Card className="mb-6 border-primary/30 bg-primary/10">
          <CardContent className="p-4 text-sm text-primary">{feedback}</CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Self Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Recipient wallet address"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              className="font-mono"
            />
            <Input
              placeholder="Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Available to connected wallets. Contract whitelist rules still apply.
            </div>
            <Button
              onClick={handleTransfer}
              disabled={!isConnected || !isCorrectNetwork || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Transfer tokens"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>Mint and burn require OPERATOR_ROLE or DEFAULT_ADMIN_ROLE.</div>
            <div>
              Operator transfer attempt is intended for blocked-transfer / compliance workflow testing.
            </div>
            <div>
              Use this page with:
              <br />
              • whitelisted wallet → allowed transfer
              <br />
              • non-whitelisted wallet → blocked transfer attempt
            </div>
          </CardContent>
        </Card>

        {canOperate && (
          <>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Mint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Recipient wallet address"
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  className="font-mono"
                />
                <Input
                  placeholder="Amount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Required role: OPERATOR_ROLE or DEFAULT_ADMIN_ROLE
                </div>
                <Button
                  onClick={handleMint}
                  disabled={!isConnected || !isCorrectNetwork || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Mint tokens"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Burn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Wallet address to burn from"
                  value={burnFrom}
                  onChange={(e) => setBurnFrom(e.target.value)}
                  className="font-mono"
                />
                <Input
                  placeholder="Amount"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Required role: OPERATOR_ROLE or DEFAULT_ADMIN_ROLE
                </div>
                <Button
                  variant="destructive"
                  onClick={handleBurn}
                  disabled={!isConnected || !isCorrectNetwork || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Burn tokens"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Operator Transfer Attempt</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="From wallet address"
                  value={opFrom}
                  onChange={(e) => setOpFrom(e.target.value)}
                  className="font-mono"
                />
                <Input
                  placeholder="To wallet address"
                  value={opTo}
                  onChange={(e) => setOpTo(e.target.value)}
                  className="font-mono"
                />
                <div className="space-y-3">
                  <Input
                    placeholder="Amount"
                    value={opAmount}
                    onChange={(e) => setOpAmount(e.target.value)}
                  />
                  <Button
                    onClick={handleOperatorTransfer}
                    disabled={!isConnected || !isCorrectNetwork || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Attempt transfer"}
                  </Button>
                </div>

                <div className="md:col-span-3 text-xs text-muted-foreground">
                  Required role: OPERATOR_ROLE or DEFAULT_ADMIN_ROLE. Use this to demonstrate
                  blocked transfers and related on-chain event logging.
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!canOperate && (
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Operator Functions Locked</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Connect a wallet with OPERATOR_ROLE or DEFAULT_ADMIN_ROLE to mint, burn, or run
              operator transfer attempts.
            </CardContent>
          </Card>
        )}
      </div>

      {!isConnected && (
        <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect MetaMask to perform token actions.
        </div>
      )}

      {isConnected && !isCorrectNetwork && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          Connected wallet is on the wrong network. Switch to Sepolia.
        </div>
      )}
    </DashboardLayout>
  )
}