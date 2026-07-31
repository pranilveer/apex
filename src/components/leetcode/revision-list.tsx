"use client"
import { useState } from "react"
import { RefreshCw, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDifficultyColor } from "@/lib/utils"
import { estimateTime, revisionStatus } from "@/lib/revision"
import type { LeetCodeProblem } from "@/types"
import { ConfidenceStars } from "./confidence-picker"

function RevisionRow({
  p,
  today,
  onMarkRevised,
  onOpen,
}: {
  p: LeetCodeProblem
  today: string
  onMarkRevised: (id: string, confidence: number) => void
  onOpen: (p: LeetCodeProblem) => void
}) {
  const [confidence, setConfidence] = useState(p.confidence ?? 3)
  const status = revisionStatus(p, today)
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => onOpen(p)}>
        <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
        <div className="min-w-0">
          <p className="truncate font-medium">{p.frontendId ? `${p.frontendId}. ` : ""}{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {p.topic || "Untagged"} · {p.pattern || "No pattern"} · Revised {p.revisionCount ?? 0}×
          </p>
        </div>
        {status === "overdue" && <Badge variant="destructive" className="shrink-0">Overdue</Badge>}
      </button>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ConfidenceStars value={confidence} onChange={setConfidence} size="sm" />
        <Button size="sm" onClick={() => onMarkRevised(p.id, confidence)}>
          <RefreshCw className="h-3.5 w-3.5" />Mark Revised
        </Button>
      </div>
    </div>
  )
}

export function RevisionList({
  due,
  today,
  onMarkRevised,
  onOpen,
}: {
  due: LeetCodeProblem[]
  today: string
  onMarkRevised: (id: string, confidence: number) => void
  onOpen: (p: LeetCodeProblem) => void
}) {
  const sorted = [...due].sort((a, b) => {
    const sa = revisionStatus(a, today) === "overdue" ? 0 : 1
    const sb = revisionStatus(b, today) === "overdue" ? 0 : 1
    return sa - sb
  })
  const minutes = sorted.map((p) => p.timeTaken || 15)

  return (
    <Card className="glass-hover">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-400" />
            <div>
              <p className="font-semibold">Today&apos;s Revision</p>
              <p className="text-xs text-muted-foreground">
                {due.length === 0 ? "All caught up!" : `${due.length} ${due.length === 1 ? "question" : "questions"} due · Estimated ${estimateTime(minutes)}`}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />Spaced Repetition
          </Badge>
        </div>

        {sorted.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No revisions due today. Solve new questions or check back tomorrow.
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((p) => (
              <RevisionRow key={p.id} p={p} today={today} onMarkRevised={onMarkRevised} onOpen={onOpen} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
