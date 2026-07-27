"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Clock, Brain, Code2, Dumbbell, Flame, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, PieChart, Pie, Cell } from "recharts"

const weeklyData = [
  { day: "Mon", study: 4, coding: 6, office: 8, gym: 1 },
  { day: "Tue", study: 3, coding: 5, office: 8, gym: 1 },
  { day: "Wed", study: 5, coding: 7, office: 8, gym: 1 },
  { day: "Thu", study: 2, coding: 4, office: 8, gym: 1 },
  { day: "Fri", study: 4, coding: 6, office: 8, gym: 1 },
  { day: "Sat", study: 6, coding: 8, office: 0, gym: 1.5 },
  { day: "Sun", study: 5, coding: 6, office: 0, gym: 1.5 },
]

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  studyHours: Math.floor(Math.random() * 5) + 2,
  codingHours: Math.floor(Math.random() * 6) + 3,
  gymMinutes: Math.floor(Math.random() * 40) + 20,
}))

const radarData = [
  { skill: "DSA", value: 65 },
  { skill: "React", value: 80 },
  { skill: "Node", value: 55 },
  { skill: "System Design", value: 30 },
  { skill: "JavaScript", value: 75 },
  { skill: "DBMS", value: 50 },
  { skill: "OS", value: 40 },
  { skill: "Networks", value: 35 },
]

const heatmapData = Array.from({ length: 91 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - i)
  return {
    date: d.toISOString().split("T")[0],
    count: Math.floor(Math.random() * 12),
  }
})

const productivityData = [
  { week: "W1", productivity: 72 },
  { week: "W2", productivity: 85 },
  { week: "W3", productivity: 68 },
  { week: "W4", productivity: 91 },
  { week: "W5", productivity: 78 },
  { week: "W6", productivity: 88 },
  { week: "W7", productivity: 82 },
  { week: "W8", productivity: 95 },
]

const pieData = [
  { name: "Coding", value: 35, color: "#8b5cf6" },
  { name: "Study", value: 25, color: "#06b6d4" },
  { name: "Office", value: 30, color: "#3b82f6" },
  { name: "Gym", value: 5, color: "#22c55e" },
  { name: "Reading", value: 5, color: "#eab308" },
]

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-secondary"
  if (count < 3) return "bg-primary/20"
  if (count < 6) return "bg-primary/40"
  if (count < 9) return "bg-primary/60"
  return "bg-primary/80"
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("weekly")

  const totalStudy = weeklyData.reduce((sum, d) => sum + d.study, 0)
  const totalCoding = weeklyData.reduce((sum, d) => sum + d.coding, 0)
  const totalOffice = weeklyData.reduce((sum, d) => sum + d.office, 0)
  const totalGym = weeklyData.reduce((sum, d) => sum + d.gym, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm">Insights into your productivity and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={period === "weekly" ? "default" : "outline"} size="sm" onClick={() => setPeriod("weekly")}>Weekly</Button>
          <Button variant={period === "monthly" ? "default" : "outline"} size="sm" onClick={() => setPeriod("monthly")}>Monthly</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Study Hours", value: `${totalStudy}h`, icon: Brain, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          { label: "Coding Hours", value: `${totalCoding}h`, icon: Code2, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Office Hours", value: `${totalOffice}h`, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Gym Sessions", value: `${totalGym}h`, icon: Dumbbell, color: "text-green-400", bg: "bg-green-400/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-hover">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="heatmap">Learning Heatmap</TabsTrigger>
          <TabsTrigger value="skills">Skill Radar</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Productivity</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                    <Bar dataKey="coding" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="study" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gym" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="codingHours" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="studyHours" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Time Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <div className="flex flex-wrap justify-center gap-3 pb-4">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium">{d.value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Study Hours Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="study" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                    <Line type="monotone" dataKey="coding" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" />Learning Heatmap (Last 90 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-13 gap-1">
                {heatmapData.map((d) => (
                  <div key={d.date} className={`h-4 w-full rounded-sm ${getHeatColor(d.count)} heatmap-cell`} title={`${d.date}: ${d.count} hours`} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                <span>Less</span>
                {[0, 3, 6, 9].map((n) => <div key={n} className={`h-3 w-3 rounded-sm ${getHeatColor(n)}`} />)}
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader><CardTitle className="text-base">Skill Radar</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="skill" stroke="#71717a" fontSize={12} />
                  <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Productivity Score</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="week" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="productivity" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Streak Calendar</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const active = Math.random() > 0.2
                    return (
                      <div key={i} className={`h-8 w-full rounded-md flex items-center justify-center text-xs ${active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {active && <Flame className="h-3 w-3" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
