"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArrowDown, ArrowUp, Leaf, Users, Building2 } from "lucide-react"

const carbonData = [
  { month: "Jan", carbon: 85 },
  { month: "Feb", carbon: 82 },
  { month: "Mar", carbon: 78 },
  { month: "Apr", carbon: 75 },
  { month: "May", carbon: 72 },
  { month: "Jun", carbon: 68 },
]

const energyData = [
  { category: "Solar", usage: 45 },
  { category: "Wind", usage: 30 },
  { category: "Hydro", usage: 15 },
  { category: "Other", usage: 10 },
]

const esgScores = {
  environmental: 85,
  social: 78,
  governance: 82,
  total: 82,
}

export default function ESGInsightsPage() {
  return (
    <DashboardLayout 
      title="ESG Insights" 
      description="Environmental, Social, and Governance metrics"
    >
      {/* ESG Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Environmental</p>
                <p className="text-2xl font-semibold text-foreground">{esgScores.environmental}</p>
              </div>
            </div>
            <Progress value={esgScores.environmental} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/20">
                <Users className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Social</p>
                <p className="text-2xl font-semibold text-foreground">{esgScores.social}</p>
              </div>
            </div>
            <Progress value={esgScores.social} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/20">
                <Building2 className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Governance</p>
                <p className="text-2xl font-semibold text-foreground">{esgScores.governance}</p>
              </div>
            </div>
            <Progress value={esgScores.governance} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ESG Score</p>
                <p className="text-3xl font-bold text-primary">{esgScores.total}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">Grade A</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Top 15% of tokenized green assets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Carbon Intensity</p>
              <p className="text-lg font-semibold text-foreground">68 tCO2e</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <ArrowDown className="h-4 w-4" />
              <span className="text-sm font-medium">12%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Energy Efficiency</p>
              <p className="text-lg font-semibold text-foreground">92%</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm font-medium">8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Green Rating</p>
              <p className="text-lg font-semibold text-foreground">A</p>
            </div>
            <Badge variant="outline" className="border-primary bg-primary/10 text-primary">
              Certified
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Carbon Trend Chart */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-foreground">
              Carbon Intensity Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={carbonData}>
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
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                    formatter={(value: number) => [`${value} tCO2e`, "Carbon"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="carbon"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Energy Usage Chart */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-foreground">
              Renewable Energy Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                    formatter={(value: number) => [`${value}%`, "Usage"]}
                  />
                  <Bar 
                    dataKey="usage" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESG Explanation */}
      <Card className="mt-6 border-border">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-foreground">Understanding ESG Scores</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our ESG scoring methodology evaluates the underlying green assets across three key dimensions. 
            Environmental metrics track carbon emissions, energy efficiency, and renewable resource utilization. 
            Social factors assess community impact, labor practices, and stakeholder engagement. 
            Governance evaluates transparency, board diversity, and ethical business conduct.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-primary">Environmental</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Carbon footprint, water usage, waste management, biodiversity impact
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-chart-2">Social</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Employee welfare, community relations, health and safety standards
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-chart-3">Governance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Board structure, executive compensation, shareholder rights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
