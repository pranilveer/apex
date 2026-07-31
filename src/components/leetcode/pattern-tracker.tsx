"use client"
import { Layers, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PATTERN_NAMES, problemPatterns, revisionStatus } from "@/lib/revision"
import type { LeetCodeProblem } from "@/types"

export function PatternTracker({
  problems,
  patternTotals,
  today,
}: {
  problems: LeetCodeProblem[]
  patternTotals: Record<string, number>
  today: string
}) {
  const rows = PATTERN_NAMES.map((pattern) => {
    const solvedList = problems.filter((p) => problemPatterns(p).includes(pattern))
    const solved = solvedList.length
    const total = patternTotals[pattern] ?? 0
    const remaining = Math.max(0, total - solved)
    const completion = total > 0 ? solved / total : 0
    const rated = solvedList.filter((p) => p.confidence)
    const avgConfidence = rated.length > 0 ? rated.reduce((a, p) => a + (p.confidence ?? 0), 0) / rated.length : 0
    const revisionPending = solvedList.filter((p) => ["overdue", "due"].includes(revisionStatus(p, today))).length
    return { pattern, solved, total, remaining, completion, avgConfidence, revisionPending }
  })
    .filter((r) => r.total > 0 || r.solved > 0)
    .sort((a, b) => b.solved - a.solved || b.completion - a.completion)

  const totalSolved = rows.reduce((a, r) => a + r.solved, 0)

  return (
    <Card className="glass-hover">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            <p className="font-semibold">Pattern Tracking</p>
          </div>
          <Badge variant="outline" className="text-xs">{totalSolved} solves across patterns</Badge>
        </div>

        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No solved questions yet. Patterns appear once you solve problems.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.pattern} className="rounded-lg border border-border/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{r.pattern}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{r.solved} solved</span>
                    <span>· {r.remaining} remaining</span>
                    {r.avgConfidence > 0 && <span>· <span className="text-yellow-400">{Math.round(r.avgConfidence * 20)}%</span> confidence</span>}
                    {r.revisionPending > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="h-3 w-3" />{r.revisionPending} due
                      </span>
                    )}
                  </div>
                </div>
                <Progress value={r.completion * 100} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
