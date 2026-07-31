"use client"
import { useEffect, useMemo, useState } from "react"
import { Target, CheckCircle2, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDifficultyColor, cn } from "@/lib/utils"
import { COMPANY_NAMES, COMPANY_TOPICS, PATTERN_NAMES, PATTERN_TOPICS, problemPatterns, revisionStatus } from "@/lib/revision"
import type { LeetCodeProblem, LeetCodeQuestion } from "@/types"
import { fetchQuestionsByTopics } from "@/actions"
import { ConfidenceStars } from "./confidence-picker"

export function PrepMode({
  problems,
  today,
  onAddQuestion,
  onOpenProblem,
}: {
  problems: LeetCodeProblem[]
  today: string
  onAddQuestion: (q: LeetCodeQuestion) => void
  onOpenProblem: (p: LeetCodeProblem) => void
}) {
  const [company, setCompany] = useState(COMPANY_NAMES[0])
  const [recommended, setRecommended] = useState<LeetCodeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [prevTopics, setPrevTopics] = useState<string[]>([])

  const presetTopics = useMemo(() => COMPANY_TOPICS[company] ?? [], [company])

  if (presetTopics !== prevTopics) {
    setPrevTopics(presetTopics)
    setLoading(true)
  }

  useEffect(() => {
    let active = true
    fetchQuestionsByTopics({ topics: presetTopics, excludeSolved: true, limit: 6 })
      .then(({ questions }) => {
        if (active) setRecommended(questions)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [presetTopics])

  const focusPatterns = useMemo(() => {
    const weak = new Map<string, { solved: number; pending: number }>()
    for (const p of problems) {
      for (const pattern of problemPatterns(p)) {
        const topics = PATTERN_TOPICS[pattern] ?? []
        if (topics.some((t) => presetTopics.includes(t))) {
          const entry = weak.get(pattern) ?? { solved: 0, pending: 0 }
          entry.solved += 1
          if (["overdue", "due"].includes(revisionStatus(p, today))) entry.pending += 1
          weak.set(pattern, entry)
        }
      }
    }
    return PATTERN_NAMES.filter((p) => (PATTERN_TOPICS[p] ?? []).some((t) => presetTopics.includes(t)))
      .map((pattern) => ({ pattern, ...(weak.get(pattern) ?? { solved: 0, pending: 0 }) }))
      .sort((a, b) => b.pending - a.pending || b.solved - a.solved)
  }, [problems, presetTopics, today])

  const revisionPriority = useMemo(() => {
    return problems
      .filter((p) => {
        const inTopic = presetTopics.includes(p.topic)
        const inCompany = (p.companyTags ?? []).some((c) => c.toLowerCase() === company.toLowerCase())
        return inTopic || inCompany
      })
      .sort((a, b) => {
        const ao = revisionStatus(a, today) === "overdue" ? 0 : 1
        const bo = revisionStatus(b, today) === "overdue" ? 0 : 1
        if (ao !== bo) return ao - bo
        return (a.confidence ?? 5) - (b.confidence ?? 5)
      })
      .slice(0, 6)
  }, [problems, presetTopics, company, today])

  return (
    <div className="space-y-4">
      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <div>
              <p className="font-semibold">Preparation Mode</p>
              <p className="text-xs text-muted-foreground">Pick a target company for curated recommendations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMPANY_NAMES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCompany(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  c === company
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Focus Patterns</p>
            <div className="flex flex-wrap gap-1.5">
              {focusPatterns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patterns tagged yet for {company}.</p>
              ) : (
                focusPatterns.slice(0, 8).map((f) => (
                  <Badge key={f.pattern} variant="outline" className="gap-1 text-xs">
                    {f.pattern}
                    {f.pending > 0 && (
                      <span className="flex items-center gap-0.5 text-red-400">
                        <AlertTriangle className="h-3 w-3" />{f.pending}
                      </span>
                    )}
                    <span className="text-muted-foreground">({f.solved})</span>
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-hover">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="text-sm font-medium">Revision Priority</p>
            {revisionPriority.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No {company}-relevant solved questions yet.
              </p>
            ) : (
              <div className="space-y-2">
                {revisionPriority.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onOpenProblem(p)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.pattern || p.topic || "Untagged"}
                          {revisionStatus(p, today) === "overdue" && " · overdue"}
                        </p>
                      </div>
                    </div>
                    <ConfidenceStars value={p.confidence ?? 0} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-hover">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <p className="text-sm font-medium">Recommended Questions for {company}</p>
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Loading recommendations...</p>
            ) : recommended.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No unsolved questions match this company&apos;s focus topics.</p>
            ) : (
              <div className="space-y-2">
                {recommended.map((q) => (
                  <div key={q.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{q.frontendId}. {q.title}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                        {q.topics.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0" onClick={() => onAddQuestion(q)}>
                      <CheckCircle2 className="h-4 w-4" />Solve
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
