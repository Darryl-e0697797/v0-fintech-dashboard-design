"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ShieldAlert, 
  TrendingDown, 
  Droplets, 
  Code2, 
  CheckCircle,
  AlertTriangle,
  Shield,
  Users,
  Vote,
  FileText
} from "lucide-react"

const riskMetrics = [
  { 
    label: "Market Risk", 
    level: "Medium", 
    score: 55, 
    icon: TrendingDown,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    description: "Exposure to ETF price fluctuations and market volatility"
  },
  { 
    label: "Liquidity Risk", 
    level: "Medium", 
    score: 50, 
    icon: Droplets,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    description: "Ability to buy/sell tokens without significant price impact"
  },
  { 
    label: "Smart Contract Risk", 
    level: "Low", 
    score: 25, 
    icon: Code2,
    color: "text-primary",
    bgColor: "bg-primary/20",
    description: "Security of underlying blockchain smart contracts"
  },
]

const governanceItems = [
  {
    title: "Whitelist Status",
    status: "Active",
    icon: Shield,
    description: "KYC whitelist enforcement is currently active",
    isActive: true
  },
  {
    title: "Transfer Restrictions",
    status: "Enforced",
    icon: ShieldAlert,
    description: "All transfers require both parties to be whitelisted",
    isActive: true
  },
  {
    title: "Voting Rights",
    status: "Enabled",
    icon: Vote,
    description: "Token holders can vote on governance proposals",
    isActive: true
  },
  {
    title: "Compliance Monitoring",
    status: "24/7",
    icon: FileText,
    description: "Continuous AML/CFT transaction monitoring",
    isActive: true
  },
]

export default function RiskGovernancePage() {
  return (
    <DashboardLayout 
      title="Risk & Governance" 
      description="Risk assessment and governance framework overview"
    >
      {/* Risk Metrics */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Risk Assessment</CardTitle>
              <CardDescription>Current risk levels across key categories</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {riskMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={metric.level === "Low" 
                      ? "border-primary text-primary" 
                      : "border-amber-400 text-amber-400"
                    }
                  >
                    {metric.level}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-medium text-foreground">{metric.score}/100</span>
                  </div>
                  <Progress 
                    value={metric.score} 
                    className="h-2 bg-muted"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Status */}
      <Card className="mt-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Governance Status</CardTitle>
              <CardDescription>Current governance controls and their status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {governanceItems.map((item) => (
              <div 
                key={item.title} 
                className="flex items-start gap-4 rounded-lg border border-border p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">{item.status}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Compliance */}
      <Card className="mt-6 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Transfer Compliance Rules</CardTitle>
          <CardDescription>How token transfers are governed and validated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Allowed Transfers */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-medium text-foreground">Allowed Transfers</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">Both sender and receiver are whitelisted</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">KYC verification completed for both parties</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">Accredited investor status confirmed</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">No active sanctions or restrictions</span>
                </li>
              </ul>
            </div>

            {/* Blocked Transfers */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h4 className="text-sm font-medium text-foreground">Blocked Transfers</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">Receiver wallet not whitelisted</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">KYC verification pending or failed</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">Wallet flagged by compliance review</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">&#8226;</span>
                  <span className="text-muted-foreground">Exceeds transaction limits</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Disclaimers */}
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Important Risk Disclosures</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              GCORE tokens represent fractional ownership in a tokenized security. The value of tokens may fluctuate based on market conditions and the performance of the underlying GRN.SI ETF. Past performance is not indicative of future results. Investors should carefully consider their investment objectives, risk tolerance, and financial situation before investing. This product is only available to accredited investors as defined by the Monetary Authority of Singapore.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
