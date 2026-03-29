"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", price: 0.95 },
  { month: "Feb", price: 0.97 },
  { month: "Mar", price: 0.96 },
  { month: "Apr", price: 0.99 },
  { month: "May", price: 1.01 },
  { month: "Jun", price: 1.02 },
]

export function PortfolioChart() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-foreground">Token Price History</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                domain={[0.9, 1.1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                activeDot={{ fill: "#22c55e", strokeWidth: 0, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
