"use client"
import Link from "next/link"
import { useMemo } from "react"
import { Github, GitCommit, Flame, TrendingUp, ArrowUpRight, FolderGit2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { DashboardData } from "@/actions"
import type { GitHubActivity } from "@/types"

interface Props {
  github: DashboardData["github"]
}

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-secondary"
  if (count < 3) return "bg-green-400/20"
  if (count < 6) return "bg-green-400/40"
  if (count < 10) return "bg-green-400/60"
  return "bg-green-400/80"
}

function Stat({ label, value, Icon, color, bg }: { label: string; value: string; Icon: React.ComponentType<{ className?: string }>; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold truncate">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  )
}

export function GitHubWidget({ github }: Props) {
  const { account, calendar } = github

  const { heatCells, leadingBlanks } = useMemo(() => {
    if (!calendar?.days.length) return { heatCells: [], leadingBlanks: 0 }
    const today = new Date()
    const start = new Date(today)
    start.setDate(start.getDate() - 90)
    const startKey = start.toISOString().slice(0, 10)
    const map = new Map(calendar.days.filter((d) => d.date >= startKey).map((d) => [d.date, d.count]))
    const cells: { key: string; count: number }[] = []
    for (let i = 0; i < 91; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ key, count: map.get(key) ?? 0 })
    }
    return { heatCells: cells, leadingBlanks: start.getDay() }
  }, [calendar])

  const recentCommits = github.recentActivities.filter((a) => a.type === "push").slice(0, 4)

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Github className="h-4 w-4 text-purple-400" />
            GitHub Activity
          </CardTitle>
          <Link
            href="/github"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View tracker <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!account ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to track commits, streaks and repo activity.
            </p>
            <Link href="/github" className="shrink-0">
              <Badge className="gap-1 cursor-pointer">
                <Github className="h-3 w-3" /> Connect GitHub
              </Badge>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Today's Commits" value={String(github.todayCommits)} Icon={GitCommit} color="text-green-400" bg="bg-green-400/10" />
              <Stat label="Contribution Streak" value={`${calendar?.currentStreak ?? 0} days`} Icon={Flame} color="text-orange-400" bg="bg-orange-400/10" />
              <Stat label="Most Active Repo" value={github.mostActiveRepo ?? "—"} Icon={FolderGit2} color="text-blue-400" bg="bg-blue-400/10" />
              <Stat label="Contributions" value={(calendar?.totalContributions ?? 0).toLocaleString()} Icon={TrendingUp} color="text-yellow-400" bg="bg-yellow-400/10" />
            </div>

            {heatCells.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Last 90 days</p>
                <div className="grid grid-cols-7 gap-1 overflow-x-auto pb-1 min-w-[420px]">
                  {Array.from({ length: leadingBlanks }).map((_, i) => (
                    <div key={`blank-${i}`} className="h-2 w-full rounded-sm" />
                  ))}
                  {heatCells.map((d) => (
                    <div
                      key={d.key}
                      className={`h-2 w-full rounded-sm ${getHeatColor(d.count)} heatmap-cell`}
                      title={`${d.key}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Languages</p>
                {github.languages.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {github.languages.map((l) => (
                      <Badge key={l.name} variant="secondary" className="text-xs">
                        {l.name} · {l.value}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No language data yet.</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Repository Growth</p>
                {github.repoGrowth.length ? (
                  <ResponsiveContainer width="100%" height={90}>
                    <AreaChart data={github.repoGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        fontSize={10}
                        tickFormatter={(m: string) => m.slice(2).replace("-", "/")}
                      />
                      <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="created" name="Repos" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-muted-foreground">No repositories yet.</p>
                )}
              </div>
            </div>

            {recentCommits.length ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recent Commits</p>
                <div className="space-y-1.5">
                  {recentCommits.map((c: GitHubActivity) => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg -mx-1.5 px-1.5 py-1.5 hover:bg-secondary/50 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.repository} · {c.date}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
