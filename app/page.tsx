"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DistributionChart } from "@/components/dashboard/distribution-chart"
import { KeyMetrics } from "@/components/dashboard/key-metrics"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/hooks/use-wallet"
import {
  getActiveWhitelistedWalletCount,
  getAdminGasBalance,
  getBalanceOf,
  getBlockedTransferCount,
  getBurnedTokenAmount,
  getMintedTokenAmount,
  getRoleStatuses,
  getTotalSupply,
  getWalletDistribution,
  isWhitelisted,
} from "@/lib/web3/contract"
import { Coins, Shield, Wallet, Ban, Flame, PlusCircle, Users, Fuel } from "lucide-react"
import type { RoleStatus, WalletDistributionRow } from "@/types/ethereum"

interface OverviewData {
  totalSupply: string
  myBalance: string
  whitelistStatus: boolean
  adminGasBalance: string | null
  activeWhitelistedWallets: number
  blockedTransactions: number
  mintedTokens: string
  burnedTokens: string
  walletRows: WalletDistributionRow[]
  roles: RoleStatus | null
}

export default function OverviewPage() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [data, setData] = useState<OverviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)

        const activeAddress = address || process.env.NEXT_PUBLIC_ADMIN_ADDRESS || ""

        const [
          totalSupply,
          myBalance,
          whitelistStatus,
          adminGasBalance,
          activeWhitelistedWallets,
          blockedTransactions,
          mintedTokens,
          burnedTokens,
          walletRows,
          roles,
        ] = await Promise.all([
          getTotalSupply(),
          activeAddress ? getBalanceOf(activeAddress) : Promise.resolve("0"),
          activeAddress ? isWhitelisted(activeAddress) : Promise.resolve(false),
          getAdminGasBalance(),
          getActiveWhitelistedWalletCount(),
          getBlockedTransferCount(),
          getMintedTokenAmount(),
          getBurnedTokenAmount(),
          getWalletDistribution(),
          activeAddress ? getRoleStatuses(activeAddress).catch(() => null) : Promise.resolve(null),
        ])

        setData({
          totalSupply,
          myBalance,
          whitelistStatus,
          adminGasBalance,
          activeWhitelistedWallets,
          blockedTransactions,
          mintedTokens,
          burnedTokens,
          walletRows,
          roles,
        })
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard data")
      }
    }

    load()
  }, [address, isCorrectNetwork])

  return (
    <DashboardLayout
      title="Overview"
      description="Core Phase 1 dashboard for the tokenized GRN.SI wrapper"
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
            <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
              Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "Not configured"}
            </span>

            {data?.roles && (
              <>
                {data.roles.defaultAdmin && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    Admin
                  </span>
                )}
                {data.roles.operator && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    Operator
                  </span>
                )}
                {data.roles.compliance && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    Compliance
                  </span>
                )}
                {data.roles.oracle && (
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                    Oracle
                  </span>
                )}
                {!data.roles.defaultAdmin &&
                  !data.roles.operator &&
                  !data.roles.compliance &&
                  !data.roles.oracle && (
                    <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                      Investor / read-only
                    </span>
                  )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/10">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Supply"
          value={data?.totalSupply ?? "---"}
          icon={Coins}
          subtitle="GCORE tokens"
        />
        <StatCard
          title="My Balance"
          value={data?.myBalance ?? "---"}
          icon={Wallet}
          subtitle="Connected wallet or admin fallback"
          variant="primary"
        />
        <StatCard
          title="Whitelist Status"
          value={data?.whitelistStatus ? "Approved" : "Not approved"}
          icon={Shield}
          subtitle="Wallet-level KYC status"
        />
        <StatCard
          title="Admin Gas Balance"
          value={data?.adminGasBalance ?? "---"}
          icon={Fuel}
          subtitle="ETH on Sepolia"
        />
        <StatCard
          title="Active Whitelisted Wallets"
          value={data?.activeWhitelistedWallets ?? "---"}
          icon={Users}
          subtitle="Current approved wallets"
        />
        <StatCard
          title="Blocked Transactions"
          value={data?.blockedTransactions ?? "---"}
          icon={Ban}
          subtitle="TransferBlocked events"
        />
        <StatCard
          title="Minted Tokens"
          value={data?.mintedTokens ?? "---"}
          icon={PlusCircle}
          subtitle="Total minted amount"
        />
        <StatCard
          title="Burned Tokens"
          value={data?.burnedTokens ?? "---"}
          icon={Flame}
          subtitle="Total burned amount"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PortfolioChart />
        <DistributionChart rows={data?.walletRows ?? []} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <KeyMetrics />

        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">Wallet Holdings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(data?.walletRows ?? []).length === 0 ? (
                <div className="rounded-md border border-border p-3 text-muted-foreground">
                  No wallet distribution data available yet.
                </div>
              ) : (
                (data?.walletRows ?? []).map((row) => (
                  <div
                    key={row.address}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div>
                      <div className="font-medium text-foreground">{row.label}</div>
                      <div className="text-xs text-muted-foreground">{row.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{row.balance} GCORE</div>
                      <div className="text-xs text-muted-foreground">
                        {row.isWhitelisted ? "Whitelisted" : "Not whitelisted"} •{" "}
                        {row.percentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-6 border-border">
            <CardHeader>
              <CardTitle className="text-base font-medium">Product Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">Underlying</div>
                <div className="mt-1 font-medium text-foreground">
                  UOB APAC Green REIT ETF (GRN.SI)
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">Structure</div>
                <div className="mt-1 font-medium text-foreground">1:1 tokenized digital twin</div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">Custody model</div>
                <div className="mt-1 font-medium text-foreground">
                  Off-chain ETF under custody / nominee
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">Reconciliation</div>
                <div className="mt-1 font-medium text-foreground">
                  Token supply vs off-chain ETF units
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!isConnected && (
        <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect MetaMask to perform live write actions. Read-only dashboard data uses the RPC
          provider.
        </div>
      )}

      {isConnected && !isCorrectNetwork && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          Connected wallet is on the wrong network. Switch to Sepolia.
        </div>
      )}
    </DashboardLayout>
  )
}