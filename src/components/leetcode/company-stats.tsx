"use client"
import { Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { LeetCodeProblem } from "@/types"

export function CompanyStats({
  problems,
  onSelect,
}: {
  problems: LeetCodeProblem[]
  onSelect: (company: string) => void
}) {
  const map = new Map<string, { solved: number; confidence: number }>()
  for (const p of problems) {
    for (const c of p.companyTags ?? []) {
      const entry = map.get(c) ?? { solved: 0, confidence: 0 }
      entry.solved += 1
      entry.confidence += p.confidence ?? 0
      map.set(c, entry)
    }
  }
  const rows = [...map.entries()]
    .map(([company, v]) => ({ company, ...v, avgConfidence: v.confidence / v.solved }))
    .sort((a, b) => b.solved - a.solved)

  const max = Math.max(1, ...rows.map((r) => r.solved))

  return (
    <Card className="glass-hover">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-400" />
          <p className="font-semibold">Interview Companies</p>
        </div>

        {rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Tag companies on your solved questions from the question drawer.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <button
                key={r.company}
                type="button"
                onClick={() => onSelect(r.company)}
                className="block w-full rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <p className="text-sm font-medium">{r.company}</p>
                    <Badge variant="outline" className="text-xs text-muted-foreground">{r.solved} solved</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(r.avgConfidence * 20)}% confidence</span>
                </div>
                <Progress value={(r.solved / max) * 100} className="mt-2 h-1.5" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
