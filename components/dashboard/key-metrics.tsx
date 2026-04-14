"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getLatestNAVValue } from "@/lib/web3/contract"

export function KeyMetrics() {
  const [latestPrice, setLatestPrice] = useState<string>("Loading...")

  useEffect(() => {
    async function load() {
      try {
        const value = await getLatestNAVValue()
        setLatestPrice(value)
      } catch (error) {
        console.error(error)
        setLatestPrice("Unavailable")
      }
    }

    load()
  }, [])

  const metrics = [
    { label: "Underlying", value: "UOB APAC Green REIT ETF" },
    { label: "Ticker", value: "GRN.SI" },
    { label: "Structure", value: "1:1 Digital Twin" },
    { label: "Network", value: "Sepolia" },
    { label: "Settlement Interface", value: "Fiat / Approved Stablecoin" },
    { label: "Latest Reference Price", value: latestPrice },
    { label: "ESG Analytics", value: "AI-Enhanced", badge: true },
  ]

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">
          Key Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            {metric.badge ? (
              <Badge variant="outline" className="border-primary bg-primary/10 text-primary">
                {metric.value}
              </Badge>
            ) : (
              <span className="text-right text-sm font-medium text-foreground">
                {metric.value}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}