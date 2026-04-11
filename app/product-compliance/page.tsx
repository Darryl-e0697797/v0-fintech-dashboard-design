"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/hooks/use-wallet"
import { getRoleStatuses } from "@/lib/web3/contract"
import { getContractConfig, formatAddress, getExplorerAddressUrl } from "@/lib/web3/client"
import type { RoleStatus } from "@/types/ethereum"
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  FileSearch,
  Database,
  RefreshCw,
  Wallet,
  Globe,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
  GitBranch,
  Building2,
} from "lucide-react"

interface GovernanceData {
  adminWallet: string
  adminRoles: RoleStatus | null
  connectedRoles: RoleStatus | null
}

function RoleBadge({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={
        active
          ? "bg-primary/15 text-primary border-primary/30"
          : "border-border text-muted-foreground"
      }
    >
      {label}
    </Badge>
  )
}

function RiskCard({
  icon: Icon,
  title,
  description,
  mitigations,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  mitigations: string[]
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mitigations
          </div>
          <div className="space-y-2">
            {mitigations.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 rounded-md border border-border p-3 text-sm"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RiskGovernancePage() {
  const { isConnected, address, isCorrectNetwork, chainId } = useWallet()
  const [data, setData] = useState<GovernanceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  let contractConfig: { address: string; networkName: string; chainId: number; explorerUrl: string } | null =
    null
  try {
    contractConfig = getContractConfig()
  } catch {
    contractConfig = null
  }

  useEffect(() => {
    async function loadGovernanceData() {
      setIsLoading(true)
      try {
        const adminWallet = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || ""

        const [adminRoles, connectedRoles] = await Promise.all([
          adminWallet ? getRoleStatuses(adminWallet).catch(() => null) : Promise.resolve(null),
          address && isConnected && isCorrectNetwork
            ? getRoleStatuses(address).catch(() => null)
            : Promise.resolve(null),
        ])

        setData({
          adminWallet,
          adminRoles,
          connectedRoles,
        })
      } catch (err) {
        console.error("Error loading governance data:", err)
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadGovernanceData()
  }, [address, isConnected, isCorrectNetwork])

  return (
    <DashboardLayout
      title="Risk & Governance"
      description="Operational controls, compliance logic, and governance structure for GCORE"
    >
      <Card className="mb-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Governance Status</CardTitle>
              <CardDescription>Live wallet, network, and role-based control status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Wallet</span>
              </div>
              {isConnected ? (
                <Badge className="bg-primary/15 text-primary border-primary/30">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                  <XCircle className="mr-1 h-3 w-3" />
                  Disconnected
                </Badge>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                {address ? formatAddress(address, 8) : "No wallet connected"}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Network</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {contractConfig?.networkName || "Not configured"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {chainId ? `Connected Chain ID: ${chainId}` : "No active chain"}
              </div>
              <div className="mt-2">
                {isConnected ? (
                  isCorrectNetwork ? (
                    <Badge className="bg-primary/15 text-primary border-primary/30">Correct Network</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                      Wrong Network
                    </Badge>
                  )
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Admin Wallet</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-5 w-28" />
              ) : data?.adminWallet ? (
                <a
                  href={getExplorerAddressUrl(data.adminWallet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-mono text-primary hover:underline"
                >
                  {formatAddress(data.adminWallet, 8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">Not configured</span>
              )}
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Contract Model</span>
              </div>
              <div className="text-sm font-medium text-foreground">AccessControl Roles</div>
              <div className="mt-1 text-xs text-muted-foreground">
                DEFAULT_ADMIN_ROLE, OPERATOR_ROLE, COMPLIANCE_ROLE, ORACLE_ROLE
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 text-sm font-medium text-foreground">Configured Admin Roles</div>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <Skeleton className="h-6 w-40" />
                ) : (
                  <>
                    <RoleBadge label="DEFAULT_ADMIN_ROLE" active={!!data?.adminRoles?.defaultAdmin} />
                    <RoleBadge label="OPERATOR_ROLE" active={!!data?.adminRoles?.operator} />
                    <RoleBadge label="COMPLIANCE_ROLE" active={!!data?.adminRoles?.compliance} />
                    <RoleBadge label="ORACLE_ROLE" active={!!data?.adminRoles?.oracle} />
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 text-sm font-medium text-foreground">Connected Wallet Roles</div>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <Skeleton className="h-6 w-40" />
                ) : (
                  <>
                    <RoleBadge label="DEFAULT_ADMIN_ROLE" active={!!data?.connectedRoles?.defaultAdmin} />
                    <RoleBadge label="OPERATOR_ROLE" active={!!data?.connectedRoles?.operator} />
                    <RoleBadge label="COMPLIANCE_ROLE" active={!!data?.connectedRoles?.compliance} />
                    <RoleBadge label="ORACLE_ROLE" active={!!data?.connectedRoles?.oracle} />
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RiskCard
          icon={TrendingUp}
          title="Market Risk"
          description="GCORE token value is economically linked to the underlying ETF exposure. Price movements in the ETF, sector volatility, or broader real estate market weakness can affect token holder outcomes."
          mitigations={[
            "Use an ETF wrapper rather than direct physical property exposure for more transparent reference pricing.",
            "Provide clear investor disclosure that token performance reflects underlying ETF economics, not a separate standalone crypto asset.",
            "Support periodic NAV/reference updates and transparent product factsheet disclosure.",
          ]}
        />

        <RiskCard
          icon={Building2}
          title="Custody and Structure Risk"
          description="GCORE uses a digital twin model in which ETF units are held off-chain while tokens are issued on-chain. Any mismatch between custody records and token supply creates operational and investor risk."
          mitigations={[
            "Maintain reconciliation between off-chain ETF units, token supply, and investor records.",
            "Use controlled custody / nominee arrangements with designated operating procedures.",
            "Restrict minting and burning to authorized roles only.",
          ]}
        />

        <RiskCard
          icon={FileSearch}
          title="Compliance and Eligibility Risk"
          description="Because GCORE is framed as a security-style tokenized capital markets product, wallet eligibility and transfers must remain controlled. Unauthorized holding or transfer would weaken the compliance model."
          mitigations={[
            "Whitelist wallets only after onboarding and eligibility checks.",
            "Enforce transfer restrictions at the smart-contract level.",
            "Use role-based permissions for compliance administration.",
          ]}
        />

        <RiskCard
          icon={AlertTriangle}
          title="Smart Contract and Operational Risk"
          description="Implementation bugs, role misconfiguration, or process failures could affect mint, burn, transfer restriction, or administrative actions."
          mitigations={[
            "Keep the contract design simple and aligned with required demo functions only.",
            "Separate admin, operator, compliance, and oracle functions into distinct roles.",
            "Use blocked transaction logging and on-chain event visibility for monitoring and review.",
          ]}
        />

        <RiskCard
          icon={RefreshCw}
          title="Reconciliation and Process Risk"
          description="Tokenized products require coordination between blockchain actions and off-chain actions such as subscription, redemption, custody updates, and investor servicing."
          mitigations={[
            "Define explicit subscription, redemption, and secondary transfer workflows.",
            "Treat reconciliation as a control function, not a back-office afterthought.",
            "Use dashboard visibility for token supply, whitelist status, and transaction monitoring.",
          ]}
        />

        <RiskCard
          icon={Globe}
          title="Regulatory and Jurisdiction Risk"
          description="Tokenization does not remove securities regulation. The product remains subject to the legal and compliance framing of the chosen jurisdiction and investor base."
          mitigations={[
            "Frame the product within a Singapore-focused regulatory context.",
            "Limit target investors to eligible / accredited participants in the demo design.",
            "Keep the structure as a practical digital twin rather than a legally ambiguous direct-title token.",
          ]}
        />
      </div>

      <Card className="mt-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Governance Framework</CardTitle>
              <CardDescription>How responsibilities are separated across the token lifecycle</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">DEFAULT_ADMIN_ROLE</div>
              <p className="text-xs text-muted-foreground">
                Governs high-level permissions and can manage other roles. Best treated as the super-admin authority.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">OPERATOR_ROLE</div>
              <p className="text-xs text-muted-foreground">
                Handles operational token actions such as minting, burning, and controlled transfer attempts where applicable.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">COMPLIANCE_ROLE</div>
              <p className="text-xs text-muted-foreground">
                Manages whitelist controls and supports the compliance-by-design model for eligible wallet access.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">ORACLE_ROLE</div>
              <p className="text-xs text-muted-foreground">
                Supports controlled update functions such as NAV-related values or reference data where implemented.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Control Principles</CardTitle>
              <CardDescription>Core governance ideas reflected in the product design</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
              <div className="mb-1 text-sm font-medium text-foreground">Compliance by Design</div>
              <p className="text-xs text-muted-foreground">
                Transfer restrictions and wallet eligibility are embedded into token operations.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <Database className="mb-3 h-5 w-5 text-primary" />
              <div className="mb-1 text-sm font-medium text-foreground">Reconciliation Discipline</div>
              <p className="text-xs text-muted-foreground">
                Token supply should remain aligned with off-chain holdings and servicing records.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <Scale className="mb-3 h-5 w-5 text-primary" />
              <div className="mb-1 text-sm font-medium text-foreground">Role Separation</div>
              <p className="text-xs text-muted-foreground">
                Governance is stronger when admin, operations, compliance, and data update rights are separated.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <Lock className="mb-3 h-5 w-5 text-primary" />
              <div className="mb-1 text-sm font-medium text-foreground">Controlled Transparency</div>
              <p className="text-xs text-muted-foreground">
                Events and dashboards improve visibility without removing the need for off-chain controls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isConnected && (
        <div className="mt-6 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Connect MetaMask to see the connected wallet’s live role profile. Read-only governance information remains available.
        </div>
      )}

      {isConnected && !isCorrectNetwork && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          Connected wallet is on the wrong network. Switch to Sepolia to view the correct live role status.
        </div>
      )}
    </DashboardLayout>
  )
}