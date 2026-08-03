"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Github, GitCommit, GitFork, GitPullRequest, Star, Flame, TrendingUp,
  Tag, MessageCircle, Plus, ExternalLink, Loader2, type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchGitHubActivities } from "@/actions"
import {
  getGitHubAccount,
  syncGitHubActivities,
  fetchContributionCalendar,
} from "@/actions/github-sync"
import { GithubAccountCard } from "@/components/github/github-account"
import type { GitHubAccount, GitHubActivity } from "@/types"

interface CalendarData {
  days: { date: string; count: number }[]
  currentStreak: number
  longestStreak: number
  totalContributions: number
}

const ACTIVITY_ICONS: Record<string, { Icon: LucideIcon; className: string }> = {
  push: { Icon: GitCommit, className: "text-green-400 bg-green-400/10" },
  pull_request: { Icon: GitPullRequest, className: "text-purple-400 bg-purple-400/10" },
  issue: { Icon: MessageCircle, className: "text-red-400 bg-red-400/10" },
  release: { Icon: Tag, className: "text-blue-400 bg-blue-400/10" },
  fork: { Icon: GitFork, className: "text-yellow-400 bg-yellow-400/10" },
  create: { Icon: Plus, className: "text-cyan-400 bg-cyan-400/10" },
}
const FALLBACK_ICON: { Icon: LucideIcon; className: string } = {
  Icon: Github,
  className: "text-muted-foreground bg-secondary",
}

const getHeatColor = (count: number) => {
  if (count === 0) return "bg-secondary"
  if (count < 3) return "bg-green-400/20"
  if (count < 6) return "bg-green-400/40"
  if (count < 10) return "bg-green-400/60"
  return "bg-green-400/80"
}

export default function GitHubPage() {
  const [activities, setActivities] = useState<GitHubActivity[]>([])
  const [account, setAccount] = useState<GitHubAccount | null>(null)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshAll = useCallback(async () => {
    const [acc, cal, acts] = await Promise.all([
      getGitHubAccount().catch(() => null),
      fetchContributionCalendar().catch(() => null),
      fetchGitHubActivities().catch(() => []),
    ])
    setAccount(acc)
    setCalendar(cal)
    setActivities(acts)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const acc = await getGitHubAccount()
        if (!cancelled && acc) {
          const last = acc.lastSyncAt ? new Date(acc.lastSyncAt).getTime() : 0
          if (Date.now() - last >= 10 * 60 * 1000) {
            await syncGitHubActivities().catch(() => {})
          }
        }
      } catch {
        // no account connected
      }
      if (!cancelled) await refreshAll()
    }
    init()
    return () => {
      cancelled = true
    }
  }, [refreshAll])

  const totalActivities = activities.length
  const thisWeek = activities.filter((a) => {
    const d = new Date(a.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7
  }).length
  const uniqueRepos = new Set(activities.map((a) => a.repository)).size
  const totalStars = account?.stars ?? 0

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

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">GitHub Tracker</h2>
        <p className="text-muted-foreground text-sm">Track your contribution activity</p>
      </div>

      <GithubAccountCard onSynced={refreshAll} />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : account ? (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                    <GitCommit className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalActivities}</p>
                    <p className="text-xs text-muted-foreground">Total Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{thisWeek}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <Github className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{uniqueRepos}</p>
                    <p className="text-xs text-muted-foreground">Repositories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalStars}</p>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contribution Graph</CardTitle>
            </CardHeader>
            <CardContent>
              {heatCells.length ? (
                <>
                  <div className="grid grid-cols-7 gap-1 overflow-x-auto pb-1 min-w-[420px]">
                    {Array.from({ length: leadingBlanks }).map((_, i) => (
                      <div key={`blank-${i}`} className="h-3 w-full rounded-sm" />
                    ))}
                    {heatCells.map((d) => (
                      <div
                        key={d.key}
                        className={`h-3 w-full rounded-sm ${getHeatColor(d.count)} heatmap-cell`}
                        title={`${d.key}: ${d.count} contribution${d.count === 1 ? "" : "s"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Less</span>
                    {[0, 3, 6, 10].map((n) => <div key={n} className={`h-3 w-3 rounded-sm ${getHeatColor(n)}`} />)}
                    <span>More</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" />{calendar?.currentStreak ?? 0} day streak</span>
                    <span>Longest: {calendar?.longestStreak ?? 0} days</span>
                    <span>Total: {calendar?.totalContributions ?? 0} contributions</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sync your account to see your contribution graph.
                </p>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            {activities.length ? (
              <div className="space-y-2">
                {activities.map((a, i) => {
                  const { Icon, className } = ACTIVITY_ICONS[a.type] ?? FALLBACK_ICON
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 1) }}
                    >
                      <Card className="glass-hover">
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${className}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{a.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                                <Github className="h-3 w-3" />
                                <span className="truncate">{a.repository}</span>
                                <span>·</span>
                                <span>{a.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="secondary" className="hidden sm:inline-flex">{a.type}</Badge>
                            <a
                              href={a.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Open on GitHub"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No activity yet. Click Sync now to import your recent GitHub activity.
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Connect your GitHub account above to start tracking your contribution activity, streak, and stats.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
