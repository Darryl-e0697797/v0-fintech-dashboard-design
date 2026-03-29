"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const metrics = [
  { label: "Underlying ETF", value: "GRN.SI" },
  { label: "Last Price", value: "$12.45" },
  { label: "Yield (Simulated)", value: "5.2%", highlight: true },
  { label: "Carbon Score", value: "A", badge: true },
]

export function KeyMetrics() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            {metric.badge ? (
              <Badge variant="outline" className="border-primary bg-primary/10 text-primary">
                {metric.value}
              </Badge>
            ) : (
              <span className={`text-sm font-medium ${metric.highlight ? "text-primary" : "text-foreground"}`}>
                {metric.value}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
