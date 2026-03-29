"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "primary"
}

export function StatCard({ title, value, icon: Icon, subtitle, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn(
      "border-border",
      variant === "primary" && "border-primary/30 bg-primary/5"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-primary" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            variant === "primary" ? "bg-primary/20" : "bg-muted"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === "primary" ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
