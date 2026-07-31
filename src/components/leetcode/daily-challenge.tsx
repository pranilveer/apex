"use client"
import { useState } from "react"
import { Dices, RefreshCw, CheckCircle2, Loader2, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LeetCodeProblem, LeetCodeQuestion } from "@/types"
import { ConfidenceStars } from "./confidence-picker"

export interface DailyChallengeData {
  easy: LeetCodeQuestion | null
  medium: LeetCodeQuestion | null
  hard: LeetCodeQuestion | null
  revision: LeetCodeProblem | null
}

export function DailyChallenge({
  challenge,
  loading,
  solvedSlugs,
  onRefresh,
  onAdd,
  onMarkRevision,
}: {
  challenge: DailyChallengeData | null
  loading: boolean
  solvedSlugs: Set<string>
  onRefresh: () => void
  onAdd: (q: LeetCodeQuestion) => void
  onMarkRevision: (id: string, confidence: number) => void
}) {
  const [reviseConfidence, setReviseConfidence] = useState(3)

  const items: { label: string; data: LeetCodeQuestion | null; color: string }[] = [
    { label: "Easy", data: challenge?.easy ?? null, color: "bg-green-400/10 text-green-400 border-green-400/30" },
    { label: "Medium", data: challenge?.medium ?? null, color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30" },
    { label: "Hard", data: challenge?.hard ?? null, color: "bg-red-400/10 text-red-400 border-red-400/30" },
  ]

  return (
    <Card className="glass-hover">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="font-semibold">Daily Challenge</p>
              <p className="text-xs text-muted-foreground">One easy, one medium, one hard + a revision</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dices className="h-4 w-4" />}Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ label, data, color }) => (
            <div key={label} className="flex flex-col justify-between gap-2 rounded-lg border border-border/50 p-3">
              <div>
                <Badge variant="outline" className={cn("text-xs", color)}>{label}</Badge>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{data?.title ?? "Loading..."}</p>
              </div>
              {data && (solvedSlugs.has(data.slug) ? (
                <Button size="sm" variant="ghost" disabled className="gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-400" />Solved</Button>
              ) : (
                <Button size="sm" onClick={() => onAdd(data)} className="gap-1.5"><CheckCircle2 className="h-4 w-4" />Solve</Button>
              ))}
            </div>
          ))}

          <div className="flex flex-col justify-between gap-2 rounded-lg border border-border/50 p-3">
            <div>
              <Badge variant="outline" className="bg-blue-400/10 text-blue-400 border-blue-400/30 text-xs">Revision</Badge>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{challenge?.revision?.name ?? "No revision due"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{challenge?.revision ? `${challenge.revision.revisionCount ?? 0} revisions done` : "Solve more to build a backlog"}</p>
            </div>
            {challenge?.revision && (
              <div className="flex flex-wrap items-center gap-2">
                <ConfidenceStars value={reviseConfidence} onChange={setReviseConfidence} size="sm" />
                <Button size="sm" onClick={() => onMarkRevision(challenge.revision!.id, reviseConfidence)} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" />Done
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
