"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useWallet } from "@/hooks/use-wallet"
import {
  LayoutDashboard,
  Coins,
  Leaf,
  Brain,
  ScrollText,
  Shield,
  FileCheck,
  ShieldAlert,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/token-actions", label: "Token Actions", icon: Coins, adminOnly: true },
  { href: "/product-compliance", label: "Product & Compliance", icon: FileCheck },
  { href: "/risk-governance", label: "Risk & Governance", icon: ShieldAlert },
  { href: "/esg-insights", label: "ESG Insights", icon: Leaf },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/transactions", label: "Transactions", icon: ScrollText },
  { href: "/whitelist", label: "Whitelist & KYC", icon: Shield, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentProfile } = useWallet()
  const isAdmin = currentProfile === "admin"

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">GCORE</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.adminOnly && !isAdmin

            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isDisabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.label}
                </span>

                {item.adminOnly && (
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    Admin
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Why GCORE Panel */}
        <div className="m-4 rounded-lg border border-sidebar-border bg-sidebar-accent p-4">
          <h4 className="mb-3 text-sm font-semibold text-sidebar-foreground">Why GCORE</h4>
          <ul className="space-y-2 text-xs text-sidebar-foreground/70">
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Tokenized ESG exposure
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              AI-enhanced insights
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Fractional ownership
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Whitelist-secured transfers
            </li>
          </ul>

          <div className="mt-4 rounded-md border border-border px-2 py-2 text-xs text-muted-foreground">
            Current profile:{" "}
            <span className="font-medium text-foreground">{currentProfile}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}