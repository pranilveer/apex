"use client"
import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { TrendingUp, Flame, CheckCircle2, Clock, Target, PieChart as PieIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { addDays, toDateStr, solvedDatesOf } from "@/lib/revision"
import type { LeetCodeProblem, MistakeType } from "@/types"

const MISTAKE_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#94a3b8"]

function Metric({ icon: Icon, label, value, sub }: { icon: typeof Flame; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function LearningAnalytics({ problems }: { problems: LeetCodeProblem[] }) {
  const data = useMemo(() => {
    const today = new Date()
    const todayStr = toDateStr(today)

    const solvedByDate = new Map<string, number>()
    for (const p of problems) {
      for (const d of solvedDatesOf(p)) {
        solvedByDate.set(d, (solvedByDate.get(d) ?? 0) + 1)
      }
    }

    const revisionByDate = new Map<string, number>()
    let revisionsTotal = 0
    let revisionsHigh = 0
    for (const p of problems) {
      for (const a of p.attemptHistory ?? []) {
        if (a.type === "revision") {
          revisionsTotal += 1
          revisionByDate.set(a.date, (revisionByDate.get(a.date) ?? 0) + 1)
          if ((a.confidence ?? 0) >= 4) revisionsHigh += 1
        }
      }
    }

    const rated = problems.filter((p) => p.confidence)
    const avgConfidence = rated.length > 0 ? rated.reduce((a, p) => a + (p.confidence ?? 0), 0) / rated.length : 0
    const timed = problems.filter((p) => p.timeTaken > 0)
    const avgTime = timed.length > 0 ? timed.reduce((a, p) => a + p.timeTaken, 0) / timed.length : 0

    const topicCounts = new Map<string, number>()
    for (const p of problems) topicCounts.set(p.topic, (topicCounts.get(p.topic) ?? 0) + 1)
    const sortedTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1])
    const mostTopic = sortedTopics[0]?.[0] ?? "—"
    const leastTopic = sortedTopics[sortedTopics.length - 1]?.[0] ?? "—"

    const weekly = Array.from({ length: 8 }, (_, i) => {
      const end = addDays(todayStr, -7 * (7 - i))
      const start = addDays(end, -6)
      let count = 0
      for (let d = start; d <= end; d = addDays(d, 1)) count += solvedByDate.get(d) ?? 0
      return { label: start.slice(5), count }
    })

    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1)
      const key = toDateStr(d)
      const prefix = key.slice(0, 7)
      let count = 0
      solvedByDate.forEach((c, k) => {
        if (k.startsWith(prefix)) count += c
      })
      return { label: d.toLocaleDateString("en-US", { month: "short" }), count }
    })

    const yearly = Array.from({ length: today.getMonth() + 1 }, (_, i) => {
      const prefix = `${today.getFullYear()}-${String(i + 1).padStart(2, "0")}`
      let count = 0
      solvedByDate.forEach((c, k) => {
        if (k.startsWith(prefix)) count += c
      })
      return { label: new Date(today.getFullYear(), i, 1).toLocaleDateString("en-US", { month: "short" }), count }
    })

    const mistakeCounts = new Map<MistakeType, number>()
    for (const p of problems) {
      for (const m of p.mistakes ?? []) mistakeCounts.set(m, (mistakeCounts.get(m) ?? 0) + 1)
    }
    const mistakes = [...mistakeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    return {
      solvedByDate,
      revisionByDate,
      totalSolved: problems.length,
      revisionsTotal,
      revisionsHigh,
      avgConfidence,
      avgTime,
      mostTopic,
      leastTopic,
      weekly,
      monthly,
      yearly,
      mistakes,
    }
  }, [problems])

  const revisionAccuracy = data.revisionsTotal > 0 ? Math.round((data.revisionsHigh / data.revisionsTotal) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric icon={Target} label="Solved" value={String(data.totalSolved)} />
        <Metric icon={CheckCircle2} label="Revisions" value={String(data.revisionsTotal)} />
        <Metric icon={Flame} label="Avg Confidence" value={`${data.avgConfidence ? Math.round(data.avgConfidence * 20) : 0}%`} />
        <Metric icon={Clock} label="Avg Time" value={data.avgTime ? `${Math.round(data.avgTime)}m` : "—"} />
        <Metric icon={TrendingUp} label="Revision Accuracy" value={`${revisionAccuracy}%`} sub="confidence ≥ 4" />
        <Metric icon={PieIcon} label="Top Topic" value={data.mostTopic.slice(0, 6)} sub={`Least: ${data.leastTopic.slice(0, 12)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-hover">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="text-sm font-medium">Weekly Progress</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71717a" }} />
                  <YAxis allowDecimals={false} width={24} tick={{ fontSize: 10, fill: "#71717a" }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-hover">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="text-sm font-medium">Monthly Progress</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71717a" }} />
                  <YAxis allowDecimals={false} width={24} tick={{ fontSize: 10, fill: "#71717a" }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <p className="text-sm font-medium">Yearly Progress ({new Date().getFullYear()})</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.yearly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71717a" }} />
                <YAxis allowDecimals={false} width={24} tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {data.mistakes.length > 0 && (
        <Card className="glass-hover">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="text-sm font-medium">Most Common Mistakes</p>
            <div className="space-y-2">
              {data.mistakes.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MISTAKE_COLORS[i % MISTAKE_COLORS.length] }} />
                    {m.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{m.count}×</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
