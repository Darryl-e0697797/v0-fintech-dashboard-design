"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileCheck, 
  Building2, 
  Globe, 
  Users, 
  TrendingUp, 
  Store,
  Banknote,
  BarChart3
} from "lucide-react"

export default function ProductCompliancePage() {
  return (
    <DashboardLayout 
      title="Product & Compliance" 
      description="Token specifications and regulatory compliance information"
    >
      {/* Product Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Token Specification</CardTitle>
                <CardDescription>GCORE token product details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Underlying Asset</span>
                </div>
                <span className="text-sm font-medium text-foreground">GRN.SI</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Token Type</span>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Security Token
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Jurisdiction</span>
                </div>
                <span className="text-sm font-medium text-foreground">Singapore (MAS)</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Investor Type</span>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                  Accredited Only
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Regulatory Framework</CardTitle>
                <CardDescription>Compliance and licensing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">MAS Licensed Operator</h4>
                <p className="text-xs text-muted-foreground">
                  GCORE operates under the Monetary Authority of Singapore regulatory framework for digital payment token services.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Custody</p>
                  <p className="text-sm font-medium text-foreground">Qualified Custodian</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Audit</p>
                  <p className="text-sm font-medium text-foreground">Big 4 Audited</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">AML/KYC</p>
                  <p className="text-sm font-medium text-primary">Mandatory</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reporting</p>
                  <p className="text-sm font-medium text-foreground">Quarterly</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Structure */}
      <Card className="mt-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Market Structure</CardTitle>
              <CardDescription>Primary and secondary market details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Primary Market</span>
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">Mint via Subscription</p>
              <p className="text-xs text-muted-foreground">
                New tokens issued through regulated subscription process
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Secondary Market</span>
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">P2P (Whitelisted)</p>
              <p className="text-xs text-muted-foreground">
                Peer-to-peer transfers between KYC-verified wallets only
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Pricing</span>
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">ETF-Linked</p>
              <p className="text-xs text-muted-foreground">
                Token price tracks underlying GRN.SI ETF NAV
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Liquidity</span>
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">Market Maker</p>
              <p className="text-xs text-muted-foreground">
                Designated market maker provides continuous liquidity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card className="mt-6 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Compliance Requirements</CardTitle>
          <CardDescription>Investor eligibility and transfer requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Identity Verification</p>
                <p className="text-xs text-muted-foreground mt-1">Full KYC documentation required</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Accreditation Check</p>
                <p className="text-xs text-muted-foreground mt-1">Proof of accredited investor status</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Wallet Whitelisting</p>
                <p className="text-xs text-muted-foreground mt-1">Only approved wallets can hold tokens</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">AML Screening</p>
                <p className="text-xs text-muted-foreground mt-1">Continuous monitoring for compliance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
