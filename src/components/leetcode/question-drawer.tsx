"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ExternalLink, CheckCircle2, RefreshCw, Clock, CalendarDays, Layers,
  BookOpen, AlertTriangle, Bookmark, Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getDifficultyColor, cn } from "@/lib/utils"
import { confidenceLabel } from "@/lib/revision"
import type { BookmarkKey, LeetCodeProblem, LeetCodeQuestion, MistakeType } from "@/types"
import { ConfidenceStars } from "./confidence-picker"
import { MistakePicker } from "./mistake-picker"
import { NotesEditor } from "./notes-editor"

const BOOKMARKS: { key: BookmarkKey; label: string; icon: typeof Star }[] = [
  { key: "isFavorite", label: "Favorite", icon: Star },
  { key: "isMustRevise", label: "Must Revise", icon: AlertTriangle },
  { key: "isInterviewFavorite", label: "Interview", icon: BookOpen },
  { key: "isCompanyFavorite", label: "Company", icon: Bookmark },
]

function fmtDate(d?: string): string {
  if (!d) return "—"
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

export function QuestionDrawer({
  open,
  problem,
  question,
  onClose,
  onMarkSolved,
  onMarkRevision,
  onUpdateProblem,
  onToggleBookmark,
}: {
  open: boolean
  problem: LeetCodeProblem | null
  question: LeetCodeQuestion | null
  onClose: () => void
  onMarkSolved: (q: LeetCodeQuestion, confidence?: number) => void
  onMarkRevision: (id: string, confidence: number) => void
  onUpdateProblem: (id: string, patch: Partial<LeetCodeProblem>) => Promise<void>
  onToggleBookmark: (id: string, key: BookmarkKey) => void
}) {
  const [companyInput, setCompanyInput] = useState("")
  const [reviseConfidence, setReviseConfidence] = useState(3)
  const [solveConfidence, setSolveConfidence] = useState(3)
  const [prevProblemId, setPrevProblemId] = useState(problem?.id)

  const url = question?.url || (problem?.slug ? `https://leetcode.com/problems/${problem.slug}/` : "")

  if (problem?.id !== prevProblemId) {
    setPrevProblemId(problem?.id)
    setCompanyInput(problem?.companyTags?.join(", ") ?? "")
  }

  const history = problem?.attemptHistory ? [...problem.attemptHistory].reverse() : []

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {problem?.frontendId ?? question?.frontendId ?? ""}
                  </span>
                  <Badge className={getDifficultyColor(problem?.difficulty ?? question?.difficulty ?? "Medium")}>
                    {problem?.difficulty ?? question?.difficulty ?? ""}
                  </Badge>
                </div>
                <h3 className="mt-1 font-semibold leading-snug">{problem?.name ?? question?.title}</h3>
                {problem?.pattern && (
                  <Badge variant="outline" className="mt-2 text-xs">{problem.pattern}</Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {url && (
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild title="Open on LeetCode">
                    <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              {!problem ? (
                <div className="space-y-4 rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4">
                  <p className="text-sm">Not solved yet. Rate your confidence when you mark it solved.</p>
                  <div className="flex items-center gap-2">
                    <ConfidenceStars value={solveConfidence} onChange={setSolveConfidence} />
                    <span className="text-xs text-muted-foreground">{confidenceLabel(solveConfidence)}</span>
                  </div>
                  <Button className="w-full" onClick={() => onMarkSolved(question!, solveConfidence)}>
                    <CheckCircle2 className="h-4 w-4" />Mark Solved
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat icon={CalendarDays} label="First Solved" value={fmtDate(problem.solvedDate)} />
                    <Stat icon={CalendarDays} label="Last Revised" value={fmtDate(problem.lastRevisionDate)} />
                    <Stat icon={RefreshCw} label="Revisions" value={String(problem.revisionCount ?? 0)} />
                    <Stat icon={Clock} label="Next Revision" value={fmtDate(problem.nextRevisionDate)} />
                    <Stat icon={Clock} label="Time Taken" value={problem.timeTaken > 0 ? `${problem.timeTaken}m` : "—"} />
                    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Star className="h-3.5 w-3.5" />
                        Confidence
                      </div>
                      <p className="mt-1 text-sm font-medium">{confidenceLabel(problem.confidence)}</p>
                    </div>
                  </div>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Confidence</p>
                      <ConfidenceStars value={problem.confidence ?? 0} onChange={(v) => onUpdateProblem(problem.id, { confidence: v })} />
                      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                        {BOOKMARKS.map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => onToggleBookmark(problem.id, key)}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                              problem[key]
                                ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
                                : "border-border text-muted-foreground hover:bg-accent"
                            )}
                          >
                            <Icon className="h-3 w-3" />{label}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm font-medium">Mark Revision Completed</p>
                      <p className="text-xs text-muted-foreground">
                        Higher confidence pushes the next revision further out. Low confidence reschedules to 3 days.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <ConfidenceStars value={reviseConfidence} onChange={setReviseConfidence} />
                        <Button size="sm" onClick={() => onMarkRevision(problem.id, reviseConfidence)}>
                          <RefreshCw className="h-4 w-4" />Mark Revised
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Pattern</p>
                      <Input
                        value={problem.pattern}
                        onChange={(e) => onUpdateProblem(problem.id, { pattern: e.target.value })}
                        placeholder="e.g. Binary Search, Sliding Window"
                      />
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Mistakes</p>
                      <MistakePicker
                        value={(problem.mistakes ?? []) as MistakeType[]}
                        onChange={(v) => onUpdateProblem(problem.id, { mistakes: v })}
                      />
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Companies</p>
                      <Input
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        onBlur={() => onUpdateProblem(problem.id, { companyTags: companyInput.split(",").map((t) => t.trim()).filter(Boolean) })}
                        placeholder="Google, Amazon, Microsoft"
                      />
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Notes</p>
                      </div>
                      <NotesEditor value={problem.notes} onSave={(v) => onUpdateProblem(problem.id, { notes: v })} />
                    </CardContent>
                  </Card>

                  <Card className="glass-hover">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Attempt History</p>
                      {history.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No history yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {history.map((a, i) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                {a.type === "solved" ? (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-400/10">
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  </span>
                                ) : (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-400/10">
                                    <RefreshCw className="h-4 w-4 text-blue-400" />
                                  </span>
                                )}
                                <div>
                                  <p className="text-sm font-medium capitalize">{a.type === "solved" ? "Solved" : "Revision"}</p>
                                  <p className="text-xs text-muted-foreground">{fmtDate(a.date)}</p>
                                </div>
                              </div>
                              {a.confidence ? <ConfidenceStars value={a.confidence} size="sm" /> : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
