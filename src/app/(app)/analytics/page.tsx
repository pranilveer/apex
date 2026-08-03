"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Brain, Code2, Dumbbell, Flame, GitCommit, FolderGit2, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import { fetchAnalytics, type AnalyticsData } from "@/actions"

const COLORS: Record<string, string> = {
  Gym: "#22c55e", Office: "#3b82f6", LeetCode: "#eab308",
  Reading: "#f97316", Journal: "#ec4899", Project: "#06b6d4",
}

const GITHUB_LANG_COLORS = ["#8b5cf6", "#f59e0b", "#22c55e", "#06b6d4", "#ec4899", "#3b82f6", "#eab308", "#ef4444"]

const defaultData: AnalyticsData = {
  weeklyData: [],
  monthlyData: [],
  radarData: [],
  heatmapData: [],
  productivityData: [],
  pieData: [],
  githubData: {
    commits: 0,
    repos: 0,
    stars: 0,
    forks: 0,
    codingHours: 0,
    weeklyContributions: [],
    contributionTrend: [],
    languageData: [],
    repoGrowth: [],
  },
}

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-secondary"
  if (count < 3) return "bg-primary/20"
  if (count < 6) return "bg-primary/40"
  if (count < 9) return "bg-primary/60"
  return "bg-primary/80"
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("weekly")
  const [data, setData] = useState<AnalyticsData>(defaultData)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchAnalytics().then((d) => { setData(d); setLoaded(true) })
  }, [])

  const totalStudy = data.weeklyData.reduce((sum, d) => sum + d.study, 0)
  const totalCoding = data.weeklyData.reduce((sum, d) => sum + d.coding, 0)
  const totalOffice = data.weeklyData.reduce((sum, d) => sum + d.office, 0)
  const totalGym = data.weeklyData.reduce((sum, d) => sum + d.gym, 0)

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground text-sm">Insights into your productivity and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={period === "weekly" ? "default" : "outline"} size="sm" onClick={() => setPeriod("weekly")}>Weekly</Button>
          <Button variant={period === "monthly" ? "default" : "outline"} size="sm" onClick={() => setPeriod("monthly")}>Monthly</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Study Hours", value: `${totalStudy}h`, icon: Brain, color: "text-cyan-400", bg: "bg-cyan-400/10" },
          { label: "Coding Hours", value: `${totalCoding}h`, icon: Code2, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Office Hours", value: `${totalOffice}h`, icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Gym Sessions", value: `${totalGym}h`, icon: Dumbbell, color: "text-green-400", bg: "bg-green-400/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-hover h-full">
              <CardContent className="p-4 flex items-center gap-3 h-full">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold truncate">{loaded ? stat.value : "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full flex-wrap h-auto min-h-10 gap-1">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="github" className="flex-1 sm:flex-none text-xs sm:text-sm">GitHub</TabsTrigger>
          <TabsTrigger value="heatmap" className="flex-1 sm:flex-none text-xs sm:text-sm">Heatmap</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 sm:flex-none text-xs sm:text-sm">Skills</TabsTrigger>
          <TabsTrigger value="streaks" className="flex-1 sm:flex-none text-xs sm:text-sm">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Productivity</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.weeklyData}>
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
                  <AreaChart data={data.monthlyData}>
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

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Time Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {data.pieData.filter((d) => d.value > 0).map((entry) => <Cell key={entry.name} fill={COLORS[entry.name] || "#8b5cf6"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              {data.pieData.some((d) => d.value > 0) && (
                <div className="flex flex-wrap justify-center gap-3 pb-4">
                  {data.pieData.filter((d) => d.value > 0).map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[d.name] || "#8b5cf6" }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-medium">{d.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Study Hours Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.weeklyData}>
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

        <TabsContent value="github" className="space-y-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { label: "Commits", value: data.githubData.commits.toLocaleString(), icon: GitCommit, color: "text-green-400", bg: "bg-green-400/10" },
              { label: "Repositories", value: data.githubData.repos.toLocaleString(), icon: FolderGit2, color: "text-blue-400", bg: "bg-blue-400/10" },
              { label: "Stars", value: data.githubData.stars.toLocaleString(), icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
              { label: "Coding Hrs (est.)", value: `${data.githubData.codingHours.toLocaleString()}h`, icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-hover h-full">
                  <CardContent className="p-4 flex items-center gap-3 h-full">
                    <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold truncate">{loaded ? stat.value : "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Contributions</CardTitle></CardHeader>
              <CardContent>
                {data.githubData.weeklyContributions.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.githubData.weeklyContributions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                      <Bar dataKey="count" name="Contributions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">Connect your GitHub account to see weekly contributions.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Contribution Trend (30d)</CardTitle></CardHeader>
              <CardContent>
                {data.githubData.contributionTrend.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data.githubData.contributionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={11} minTickGap={24} tickFormatter={(d: string) => d.slice(5)} />
                      <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="count" name="Contributions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">Connect your GitHub account to see the contribution trend.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Language Distribution</CardTitle></CardHeader>
              <CardContent>
                {data.githubData.languageData.length ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={data.githubData.languageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                          {data.githubData.languageData.map((entry, i) => (
                            <Cell key={entry.name} fill={GITHUB_LANG_COLORS[i % GITHUB_LANG_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1.5 w-full sm:w-44">
                      {data.githubData.languageData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: GITHUB_LANG_COLORS[i % GITHUB_LANG_COLORS.length] }} />
                          <span className="truncate">{entry.name}</span>
                          <span className="ml-auto text-muted-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No language data yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Repository Growth</CardTitle></CardHeader>
              <CardContent>
                {data.githubData.repoGrowth.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={data.githubData.repoGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickFormatter={(m: string) => m.slice(2).replace("-", "/")} />
                      <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="created" name="Repos" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12 text-center">No repository growth data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" />Learning Heatmap (Last 90 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-13 gap-1">
                {data.heatmapData.map((d) => (
                  <div key={d.date} className={`h-4 w-full rounded-sm ${getHeatColor(d.count)} heatmap-cell`} title={`${d.date}: ${d.count} tasks`} />
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
                <RadarChart data={data.radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="skill" stroke="#71717a" fontSize={12} />
                  <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Productivity Score</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.productivityData}>
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
                    const date = new Date()
                    date.setDate(date.getDate() - 27 + i)
                    const dateStr = date.toISOString().split("T")[0]
                    const entry = data.heatmapData.find((h) => h.date === dateStr)
                    const active = entry ? entry.count > 0 : false
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