"use client"

import { Sidebar } from "./sidebar"
import { MobileSidebar } from "./mobile-sidebar"
import { WalletButton } from "./wallet-button"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <MobileSidebar />
      </div>

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <WalletButton />
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  )
}
