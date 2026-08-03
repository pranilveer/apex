"use client"
import { useCallback, useMemo } from "react"
import { GitCommit, GitFork, Activity, Code2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from "recharts"
import type { GitHubActivity, GitHubRepoInfo } from "@/types"
import type { GitHubCalendarData } from "@/components/github/github-stats"

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const PALETTE = ["#8b5cf6", "#f59e0b", "#22c55e", "#06b6d4", "#ec4899", "#3b82f6", "#eab308", "#ef4444"]

const tooltipStyle = { backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }

export function GitHubCharts({
  calendar,
  activities,
  repositories,
}: {
  calendar: GitHubCalendarData | null
  activities: GitHubActivity[]
  repositories: GitHubRepoInfo[]
}) {
  const buildDaySeries = useCallback(
    (n: number, weekday: boolean) => {
      const map = new Map((calendar?.days ?? []).map((d) => [d.date, d.count]))
      const today = new Date()
      const out: { key: string; label: string; count: number }[] = []
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = localDateKey(d)
        const label = weekday
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        out.push({ key, label, count: map.get(key) ?? 0 })
      }
      return out
    },
    [calendar]
  )

  const weeklyData = useMemo(() => buildDaySeries(7, true), [buildDaySeries])
  const monthlyData = useMemo(() => buildDaySeries(30, false), [buildDaySeries])

  const repoActivity = useMemo(() => {
    const counts = new Map<string, number>()
    for (const a of activities) counts.set(a.repository, (counts.get(a.repository) ?? 0) + 1)
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [activities])

  const languageData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of repositories) {
      const lang = r.language || "No language"
      counts.set(lang, (counts.get(lang) ?? 0) + 1)
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 6).map(([name, value]) => ({ name, value }))
    const rest = sorted.slice(6).reduce((s, [, v]) => s + v, 0)
    if (rest > 0) top.push({ name: "Other", value: rest })
    return top
  }, [repositories])

  const hasCalendar = Boolean(calendar?.days.length)
  const totalRepos = repositories.length

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Charts</h3>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-green-400" />
              Weekly Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCalendar ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Contributions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Sync your account to see weekly commits.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              Monthly Commit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasCalendar ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} minTickGap={24} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="count" name="Contributions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Sync your account to see the monthly trend.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitFork className="h-4 w-4 text-blue-400" />
              Repository Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repoActivity.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={repoActivity} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={11} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Activities" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">No activity tracked yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4 text-yellow-400" />
              Language Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {languageData.length ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {languageData.map((entry, i) => (
                        <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 w-full sm:w-48">
                  {languageData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                      <span className="truncate">{entry.name}</span>
                      <span className="ml-auto text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {totalRepos ? "No language data available." : "Sync your account to see language usage."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
