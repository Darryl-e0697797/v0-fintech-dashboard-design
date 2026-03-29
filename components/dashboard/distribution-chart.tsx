"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

const data = [
  { name: "Green REITs", value: 45, color: "#22c55e" },
  { name: "Solar Energy", value: 25, color: "#3b82f6" },
  { name: "Wind Power", value: 20, color: "#a855f7" },
  { name: "Clean Tech", value: 10, color: "#f59e0b" },
]

export function DistributionChart() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Token Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`${value}%`, "Allocation"]}
              />
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
