"use client"
import { useMemo } from "react"
import { GitCommit, Calendar, TrendingUp, BarChart3, Flame, Trophy, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface GitHubCalendarData {
  days: { date: string; count: number }[]
  currentStreak: number
  longestStreak: number
  totalContributions: number
}

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const sumFrom = (days: { date: string; count: number }[], startKey: string) =>
  days.filter((d) => d.date >= startKey).reduce((s, d) => s + d.count, 0)

interface StatItem {
  label: string
  value: string | number
  Icon: LucideIcon
  color: string
  bg: string
}

export function GitHubStats({ calendar }: { calendar: GitHubCalendarData | null }) {
  const stats = useMemo<StatItem[]>(() => {
    if (!calendar || !calendar.days.length) return []
    const map = new Map(calendar.days.map((d) => [d.date, d.count]))
    const today = new Date()
    const todayKey = localDateKey(today)

    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - 6)
    const monthStart = new Date(today)
    monthStart.setDate(monthStart.getDate() - 29)
    const yearStart = `${today.getFullYear()}-01-01`

    return [
      { label: "Today", value: map.get(todayKey) ?? 0, Icon: GitCommit, color: "text-green-400", bg: "bg-green-400/10" },
      { label: "This Week", value: sumFrom(calendar.days, localDateKey(weekStart)), Icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
      { label: "This Month", value: sumFrom(calendar.days, localDateKey(monthStart)), Icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
      { label: "This Year", value: sumFrom(calendar.days, yearStart), Icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-400/10" },
      { label: "Current Streak", value: `${calendar.currentStreak}d`, Icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
      { label: "Longest Streak", value: `${calendar.longestStreak}d`, Icon: Trophy, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    ]
  }, [calendar])

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Contribution Statistics</h3>
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {stats.length ? (
          stats.map((s) => (
            <Card key={s.label} className="glass-hover p-4 sm:p-6">
              <CardContent>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-tight">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-4 sm:p-6 col-span-full">
            <CardContent className="text-sm text-muted-foreground">
              Sync your account to see contribution statistics.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
