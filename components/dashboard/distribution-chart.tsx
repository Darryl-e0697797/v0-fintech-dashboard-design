"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WalletDistributionRow } from "@/types/ethereum"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b"]

export function DistributionChart({ rows }: { rows: WalletDistributionRow[] }) {
  const data = rows
    .filter((row) => Number(row.balance) > 0)
    .map((row, index) => ({
      name: row.label,
      value: Number(row.balance),
      color: COLORS[index % COLORS.length],
    }))

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Wallet Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={4}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}