"use client"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { revisionStatus } from "@/lib/revision"
import { cn } from "@/lib/utils"
import type { LeetCodeProblem } from "@/types"

interface TopicRow {
  topic: string
  solved: number
  avgConfidence: number
  mistakes: number
  overdue: number
  score: number
}

export function WeakTopics({
  problems,
  topicCounts,
  today,
  onSelect,
}: {
  problems: LeetCodeProblem[]
  topicCounts: Record<string, number>
  today: string
  onSelect: (topic: string) => void
}) {
  const byTopic = new Map<string, LeetCodeProblem[]>()
  for (const p of problems) {
    if (!p.topic) continue
    const list = byTopic.get(p.topic) ?? []
    list.push(p)
    byTopic.set(p.topic, list)
  }

  const rows: TopicRow[] = [...byTopic.entries()].map(([topic, list]) => {
    const rated = list.filter((p) => p.confidence)
    const avgConfidence = rated.length > 0 ? rated.reduce((a, p) => a + (p.confidence ?? 0), 0) / rated.length : 0
    const mistakes = list.filter((p) => (p.mistakes?.length ?? 0) > 0).length
    const overdue = list.filter((p) => ["overdue", "due"].includes(revisionStatus(p, today))).length
    const solved = list.length
    const total = topicCounts[topic] ?? 0
    const score =
      (5 - avgConfidence) +
      Math.min(mistakes, 3) +
      (overdue > 0 ? 1 : 0) +
      (solved === 0 ? 2 : solved < 3 ? 1 : 0) +
      (total > 0 && solved / total < 0.2 ? 1 : 0)
    return { topic, solved, avgConfidence, mistakes, overdue, score }
  }).sort((a, b) => b.score - a.score)

  const weak = rows.slice(0, 5)
  const strong = [...rows].sort((a, b) => a.score - b.score).slice(0, 5)

  const Row = ({ r, strong: isStrong }: { r: TopicRow; strong?: boolean }) => (
    <button
      type="button"
      onClick={() => onSelect(r.topic)}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-left transition-colors hover:bg-accent"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{r.topic}</p>
        <p className="text-xs text-muted-foreground">
          {r.solved} solved{isStrong && r.avgConfidence > 0 ? ` · ${Math.round(r.avgConfidence * 20)}% confidence` : ""}
          {!isStrong && r.mistakes > 0 ? ` · ${r.mistakes} with mistakes` : ""}
          {!isStrong && r.overdue > 0 ? ` · ${r.overdue} overdue` : ""}
        </p>
      </div>
      <Badge variant="outline" className={cn("shrink-0", isStrong ? "text-green-400" : "text-red-400")}>
        {isStrong ? Math.round(r.avgConfidence * 20) + "%" : r.score.toFixed(1)}
      </Badge>
    </button>
  )

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <p className="font-semibold">Top 5 Weak Topics</p>
          </div>
          {weak.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Solve problems to see topic insights.</p>
          ) : (
            <div className="space-y-2">
              {weak.map((r) => <Row key={r.topic} r={r} />)}
            </div>
          )}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />Weakness score: low confidence + mistakes + overdue + few solved
          </p>
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <p className="font-semibold">Top 5 Strong Topics</p>
          </div>
          {strong.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Solve problems to see topic insights.</p>
          ) : (
            <div className="space-y-2">
              {strong.map((r) => <Row key={r.topic} r={r} strong />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
