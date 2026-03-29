"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { DistributionChart } from "@/components/dashboard/distribution-chart"
import { KeyMetrics } from "@/components/dashboard/key-metrics"
import { useDashboardStore } from "@/lib/store"
import { Coins, Wallet, TrendingUp, Leaf } from "lucide-react"

export default function OverviewPage() {
  const { totalSupply, myBalance, navPerToken, esgScore } = useDashboardStore()

  return (
    <DashboardLayout 
      title="Overview" 
      description="Monitor your tokenized ESG investment portfolio"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Supply"
          value={totalSupply.toLocaleString()}
          icon={Coins}
          subtitle="GCORE tokens"
        />
        <StatCard
          title="My Balance"
          value={myBalance.toLocaleString()}
          icon={Wallet}
          subtitle="GCORE tokens"
          variant="primary"
        />
        <StatCard
          title="NAV / Token"
          value={`$${navPerToken.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="ESG Score"
          value={`${esgScore} / 100`}
          icon={Leaf}
          subtitle="Grade A"
          variant="primary"
        />
      </div>

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
