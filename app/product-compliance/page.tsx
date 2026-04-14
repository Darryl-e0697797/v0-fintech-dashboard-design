"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/hooks/use-wallet"
import { getRoleStatuses, getTokenName, getTokenSymbol } from "@/lib/web3/contract"
import { getContractConfig, formatAddress, getExplorerAddressUrl } from "@/lib/web3/client"
import type { RoleStatus } from "@/types/ethereum"
import {
  FileCheck,
  Wallet,
  Globe,
  ExternalLink,
  CheckCircle,
  XCircle,
  Shield,
  FileCode,
} from "lucide-react"

interface ProductComplianceData {
  tokenName: string
  tokenSymbol: string
  adminWallet: string
  adminRoles: RoleStatus | null
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

export default function ProductCompliancePage() {
  const { isConnected, address, isCorrectNetwork, chainId } = useWallet()
  const [data, setData] = useState<ProductComplianceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  let contractConfig: { address: string; networkName: string; chainId: number; explorerUrl: string } | null =
    null

  try {
    contractConfig = getContractConfig()
  } catch {
    contractConfig = null
  }

  useEffect(() => {
    async function load() {
      setIsLoading(true)

      try {
        const adminWallet = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || ""

        const [tokenName, tokenSymbol, adminRoles] = await Promise.all([
          getTokenName().catch(() => "GCORE Token"),
          getTokenSymbol().catch(() => "GCORE"),
          adminWallet ? getRoleStatuses(adminWallet).catch(() => null) : Promise.resolve(null),
        ])

        setData({
          tokenName,
          tokenSymbol,
          adminWallet,
          adminRoles,
        })
      } catch (err) {
        console.error("Failed to load product/compliance data:", err)
        setData({
          tokenName: "GCORE Token",
          tokenSymbol: "GCORE",
          adminWallet: process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "",
          adminRoles: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return (
    <DashboardLayout
      title="Product & Compliance"
      description="Minimal product specification and compliance model overview"
    >
      <Card className="mb-6 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Live Contract Status</CardTitle>
          <CardDescription>
            Lightweight view of the deployed token and current configuration
          </CardDescription>
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
                <FileCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Contract</span>
              </div>
              {contractConfig ? (
                <a
                  href={`${contractConfig.explorerUrl}/address/${contractConfig.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-mono text-primary hover:underline"
                >
                  {formatAddress(contractConfig.address, 8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">Not configured</span>
              )}
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Product Summary</CardTitle>
            <CardDescription>Minimal token and structure overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Token Name</span>
              {isLoading ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="text-sm font-medium text-foreground">
                  {data?.tokenName || "GCORE Token"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Token Symbol</span>
              {isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge variant="outline" className="border-primary text-primary">
                  {data?.tokenSymbol || "GCORE"}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Underlying Asset</span>
              <span className="text-sm font-medium text-foreground">UOB APAC Green REIT ETF (GRN.SI)</span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Token Standard</span>
              <span className="text-sm font-medium text-foreground">ERC20-compatible</span>
            </div>

            <div className="flex items-center justify-between border-b border-border py-3">
              <span className="text-sm text-muted-foreground">Structure</span>
              <span className="text-sm font-medium text-foreground">1:1 digital twin wrapper</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">Investor Frame</span>
              <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">
                Eligible / accredited
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Compliance Model</CardTitle>
            <CardDescription>Matches the current smart-contract design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">Access Model</div>
              <p className="text-xs text-muted-foreground">
                GCORE uses wallet-based identity and AccessControl roles rather than a simple owner-only model.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">Transfer Control</div>
              <p className="text-xs text-muted-foreground">
                Transfers are intended to be restricted to approved wallets through whitelist enforcement and blocked-transfer logic.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">Lifecycle Controls</div>
              <p className="text-xs text-muted-foreground">
                Minting and burning are controlled functions intended to mirror off-chain subscription and redemption activity.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 text-sm font-medium text-foreground">Administrative Roles</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleBadge label="DEFAULT_ADMIN_ROLE" active={!!data?.adminRoles?.defaultAdmin} />
                <RoleBadge label="OPERATOR_ROLE" active={!!data?.adminRoles?.operator} />
                <RoleBadge label="COMPLIANCE_ROLE" active={!!data?.adminRoles?.compliance} />
                <RoleBadge label="ORACLE_ROLE" active={!!data?.adminRoles?.oracle} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-border">
        <CardHeader>
          <CardTitle className="text-base">What This Page Covers</CardTitle>
          <CardDescription>Kept intentionally lightweight for demo stability</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border p-4">
            <FileCheck className="mb-3 h-5 w-5 text-primary" />
            <div className="mb-1 text-sm font-medium text-foreground">Product Identity</div>
            <p className="text-xs text-muted-foreground">
              Token name, symbol, structure, and underlying asset.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <Shield className="mb-3 h-5 w-5 text-primary" />
            <div className="mb-1 text-sm font-medium text-foreground">Compliance Logic</div>
            <p className="text-xs text-muted-foreground">
              Role-based admin model plus whitelist-based transfer restrictions.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <Wallet className="mb-3 h-5 w-5 text-primary" />
            <div className="mb-1 text-sm font-medium text-foreground">Wallet-Native Access</div>
            <p className="text-xs text-muted-foreground">
              Connected wallet determines access instead of password-based profiles.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <Globe className="mb-3 h-5 w-5 text-primary" />
            <div className="mb-1 text-sm font-medium text-foreground">Demo Context</div>
            <p className="text-xs text-muted-foreground">
              Suitable for the project dashboard without adding heavy runtime dependencies.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}