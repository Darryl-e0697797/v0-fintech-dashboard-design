"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Brain, TrendingUp, Shield, Zap, Target, Lightbulb } from "lucide-react"

const radarData = [
  { factor: "Efficiency", value: 87, fullMark: 100 },
  { factor: "Risk", value: 92, fullMark: 100 },
  { factor: "Growth", value: 78, fullMark: 100 },
  { factor: "Stability", value: 85, fullMark: 100 },
  { factor: "ESG", value: 82, fullMark: 100 },
]

const predictionData = [
  { month: "Jul", actual: 82, predicted: 84 },
  { month: "Aug", actual: null, predicted: 86 },
  { month: "Sep", actual: null, predicted: 87 },
  { month: "Oct", actual: null, predicted: 89 },
  { month: "Nov", actual: null, predicted: 91 },
  { month: "Dec", actual: null, predicted: 93 },
]

const aiInsights = [
  {
    title: "Energy Efficiency Improvement",
    description: "AI model identifies improving energy efficiency trends across underlying REIT assets, indicating potential sustainability-adjusted yield improvement of +2.3% over the next quarter.",
    confidence: 94,
    category: "Opportunity",
  },
  {
    title: "Carbon Credit Optimization",
    description: "Machine learning analysis suggests optimal carbon credit allocation strategy that could reduce portfolio carbon intensity by 15% while maintaining returns.",
    confidence: 89,
    category: "Optimization",
  },
  {
    title: "Risk Assessment Update",
    description: "Neural network risk models indicate low probability of ESG-related regulatory impact for current portfolio composition. Compliance confidence remains high.",
    confidence: 96,
    category: "Risk",
  },
]

export default function AIInsightsPage() {
  return (
    <DashboardLayout 
      title="AI Insights" 
      description="AI-powered analytics and predictions"
    >
      {/* AI Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Optimization Score</p>
                <p className="text-2xl font-semibold text-primary">87</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted Efficiency Gain</p>
                <p className="text-2xl font-semibold text-foreground">+6%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/20">
                <Shield className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-semibold text-foreground">Low</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20">
                <Zap className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model Confidence</p>
                <p className="text-2xl font-semibold text-foreground">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-foreground">
              AI Factor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="factor" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Chart */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-foreground">
              ESG Score Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
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
                    domain={[75, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Cards */}
      <div className="mt-6">
        <h3 className="mb-4 text-base font-medium text-foreground">AI-Generated Insights</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {aiInsights.map((insight, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    {insight.category === "Opportunity" && <Target className="h-4 w-4 text-primary" />}
                    {insight.category === "Optimization" && <Lightbulb className="h-4 w-4 text-primary" />}
                    {insight.category === "Risk" && <Shield className="h-4 w-4 text-primary" />}
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-xs text-muted-foreground">
                    {insight.category}
                  </Badge>
                </div>
                <h4 className="mb-2 text-sm font-medium text-foreground">{insight.title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">{insight.description}</p>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-foreground">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Explanation Panel */}
      <Card className="mt-6 border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">AI Model Explanation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Our AI model analyzes multiple data streams including real-time energy consumption metrics, 
                carbon emission reports, and market sentiment indicators. The model identifies improving 
                energy efficiency trends across underlying REIT assets, indicating potential 
                sustainability-adjusted yield improvement. Current analysis shows strong correlation 
                between ESG performance improvements and long-term asset value appreciation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">Machine Learning</Badge>
                <Badge variant="secondary">Real-time Analysis</Badge>
                <Badge variant="secondary">Predictive Modeling</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
