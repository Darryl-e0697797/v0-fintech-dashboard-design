"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { DistributionChart } from "@/components/dashboard/distribution-chart"
import { KeyMetrics } from "@/components/dashboard/key-metrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/hooks/use-wallet"
import { 
  getTotalSupply, 
  getBalanceOf, 
  getOwner, 
  isWhitelisted 
} from "@/lib/web3/contract"
import { getContractConfig, formatAddress } from "@/lib/web3/client"
import { Coins, Wallet, Shield, User, Globe, FileCode, Leaf, CheckCircle, XCircle } from "lucide-react"

interface ContractData {
  totalSupply: string
  balance: string
  isWhitelisted: boolean
  owner: string
}

export default function OverviewPage() {
  const { isConnected, address, isCorrectNetwork } = useWallet()
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get contract config safely
  let contractConfig: { address: string; networkName: string } | null = null
  try {
    contractConfig = getContractConfig()
  } catch {
    contractConfig = null
  }

  useEffect(() => {
    async function fetchContractData() {
      if (!isConnected || !address || !isCorrectNetwork) {
        setContractData(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const [totalSupply, balance, whitelisted, owner] = await Promise.all([
          getTotalSupply(),
          getBalanceOf(address),
          isWhitelisted(address),
          getOwner(),
        ])

        setContractData({
          totalSupply,
          balance,
          isWhitelisted: whitelisted,
          owner,
        })
      } catch (err) {
        console.error("Error fetching contract data:", err)
        setError("Failed to fetch contract data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContractData()
  }, [isConnected, address, isCorrectNetwork])

  const formatTokenAmount = (amount: string) => {
    const num = parseFloat(amount)
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(2)
  }

  return (
    <DashboardLayout 
      title="Overview" 
      description="Monitor your tokenized ESG investment portfolio"
    >
      {/* Connection Status */}
      {!isConnected && (
        <Card className="mb-6 border-border bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Wallet not connected</p>
              <p className="text-xs text-muted-foreground">Connect your wallet to view live contract data</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && !isCorrectNetwork && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <Globe className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Wrong network</p>
              <p className="text-xs text-muted-foreground">
                Please switch to {contractConfig?.networkName || "the correct network"} to interact with the contract
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Supply"
              value={contractData ? formatTokenAmount(contractData.totalSupply) : "---"}
              icon={Coins}
              subtitle="GCORE tokens"
            />
            <StatCard
              title="My Balance"
              value={contractData ? formatTokenAmount(contractData.balance) : "---"}
              icon={Wallet}
              subtitle="GCORE tokens"
              variant="primary"
            />
            <StatCard
              title="Whitelist Status"
              value={contractData ? (contractData.isWhitelisted ? "Approved" : "Not Listed") : "---"}
              icon={Shield}
              subtitle={contractData?.isWhitelisted ? "KYC verified" : "Verification required"}
              variant={contractData?.isWhitelisted ? "primary" : undefined}
            />
            <StatCard
              title="ESG Score"
              value="87 / 100"
              icon={Leaf}
              subtitle="Grade A"
              variant="primary"
            />
          </>
        )}
      </div>

      {/* Connected Wallet Info */}
      {isConnected && isCorrectNetwork && (
        <Card className="mt-6 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Connected Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Wallet Address</p>
                <p className="mt-1 text-sm font-mono font-medium text-foreground">
                  {formatAddress(address || "", 8)}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Network</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {contractConfig?.networkName || "Unknown"}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Contract Owner</p>
                <p className="mt-1 text-sm font-mono font-medium text-foreground">
                  {contractData ? formatAddress(contractData.owner, 8) : "---"}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Whitelist Status</p>
                <div className="mt-1">
                  {contractData ? (
                    contractData.isWhitelisted ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-destructive/30 text-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Not Listed
                      </Badge>
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">---</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Info */}
      {contractConfig && (
        <Card className="mt-6 border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Contract Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Contract Address</p>
                <p className="mt-1 text-sm font-mono font-medium text-foreground break-all">
                  {contractConfig.address}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Network</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {contractConfig.networkName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PortfolioChart />
        <DistributionChart />
      </div>

      {/* Key Metrics */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <KeyMetrics />
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-base font-medium text-foreground">Portfolio Snapshot</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your GCORE tokens represent fractional ownership in a diversified portfolio of green assets, 
              including sustainable REITs, renewable energy projects, and clean technology companies.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Asset Class</p>
                <p className="mt-1 text-sm font-medium text-foreground">Green ETF</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Holdings</p>
                <p className="mt-1 text-sm font-medium text-foreground">24 Assets</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Rebalance</p>
                <p className="mt-1 text-sm font-medium text-foreground">Quarterly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
