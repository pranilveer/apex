"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Github, GitCommit, GitFork, GitPullRequest, Flame,
  Tag, MessageCircle, Plus, ExternalLink, ChevronLeft, ChevronRight, type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getGitHubAccount, syncGitHubActivities, fetchGitHubDashboard } from "@/actions/github-sync"
import { GithubAccountCard } from "@/components/github/github-account"
import { GitHubStats, type GitHubCalendarData } from "@/components/github/github-stats"
import { GitHubCharts } from "@/components/github/github-charts"
import { GitHubRepos } from "@/components/github/github-repos"
import { GitHubSkeleton } from "@/components/github/github-skeleton"
import type { GitHubAccount, GitHubActivity, GitHubRepoInfo } from "@/types"

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

const PAGE_SIZE = 8

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
  const [calendar, setCalendar] = useState<GitHubCalendarData | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepoInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const refreshAll = useCallback(async () => {
    const data = await fetchGitHubDashboard().catch(() => null)
    setAccount(data?.account ?? null)
    setCalendar(data?.calendar ?? null)
    setRepositories(data?.repositories ?? [])
    setActivities(data?.activities ?? [])
    setPage(1)
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

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageActivities = activities.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
        <GitHubSkeleton />
      ) : account ? (
        <>
          <GitHubStats calendar={calendar} />

          <GitHubCharts calendar={calendar} activities={activities} repositories={repositories} />

          <GitHubRepos repositories={repositories} />

          <Card className="p-4 sm:p-6">
            <CardHeader className="mb-2">
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
              <>
                <div className="space-y-2">
                  {pageActivities.map((a, i) => {
                    const { Icon, className } = ACTIVITY_ICONS[a.type] ?? FALLBACK_ICON
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 1) }}
                      >
                        <Card className="glass-hover p-4 sm:p-6">
                          <CardContent className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 mt-4">
                    <p className="text-xs text-muted-foreground">
                      {activities.length} activities · Page {safePage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setPage(Math.max(1, safePage - 1))}
                        disabled={safePage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                        disabled={safePage >= totalPages}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-4 sm:p-6">
                <CardContent className="text-sm text-muted-foreground">
                  No activity yet. Click Sync now to import your recent GitHub activity.
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card className="p-4 sm:p-6">
          <CardContent className="text-sm text-muted-foreground">
            Connect your GitHub account above to start tracking your contribution activity, streak, and stats.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
