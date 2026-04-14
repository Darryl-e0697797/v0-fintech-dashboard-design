"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Coins,
  ScrollText,
  Shield,
  KeyRound,
  FileCheck,
  ShieldAlert,
  Leaf,
  Brain,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/token-actions", label: "Token Actions", icon: Coins },
  { href: "/transactions", label: "Transactions", icon: ScrollText },
  { href: "/whitelist", label: "Whitelist", icon: Shield },
  { href: "/role-management", label: "Role Management", icon: KeyRound },

  { href: "/product-compliance", label: "Product & Compliance", icon: FileCheck },
  { href: "/risk-governance", label: "Risk & Governance", icon: ShieldAlert },

  { href: "/esg-insights", label: "ESG Insights", icon: Leaf },
  { href: "/ai-insights", label: "AI Insights", icon: Brain },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-sidebar-foreground">GCORE</span>
        </div> */}

        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/90 shadow-[0_0_24px_rgba(34,197,94,0.18)]">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-sidebar-foreground">GCORE</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-sidebar-foreground/50">
                Operator
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="m-4 rounded-lg border border-sidebar-border bg-sidebar-accent p-4">
          <h4 className="mb-3 text-sm font-semibold text-sidebar-foreground">Why GCORE</h4>
          <ul className="space-y-2 text-xs text-sidebar-foreground/70">
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Tokenized ESG exposure
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Role-based admin controls
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              Whitelist-secured transfers
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span>
              On-chain transaction visibility
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}