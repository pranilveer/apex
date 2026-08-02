"use client"
import { Trophy, Calendar, Timer, ListChecks, Code2, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatTime, getRelativeDayLabel } from "@/lib/utils"
import type { WeeklyStats } from "@/lib/gamification"

export function WeeklyStatsCard({ stats }: { stats: WeeklyStats }) {
  const rows = [
    { icon: TrendingUp, label: "XP Earned This Week", value: `${stats.xpThisWeek} XP`, color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Calendar, label: "Best Day", value: stats.bestDay ? getRelativeDayLabel(stats.bestDay) : "—", color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { icon: Timer, label: "Longest Session", value: stats.longestSession > 0 ? formatTime(stats.longestSession) : "—", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: ListChecks, label: "Tasks Completed", value: `${stats.tasksCompleted}`, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { icon: Code2, label: "LeetCode Solved", value: `${stats.leetcodeSolved}`, color: "text-purple-400", bg: "bg-purple-400/10" },
  ]

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          Weekly Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${r.bg}`}>
              <r.icon className={`h-4 w-4 ${r.color}`} />
            </div>
            <span className="text-sm flex-1 text-muted-foreground">{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-2.5">
          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm flex-1 text-muted-foreground">Current Rank</span>
          <span className="text-xs text-muted-foreground">Coming Soon</span>
        </div>
      </CardContent>
    </Card>
  )
}
