"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, Flame, CheckCircle2, AlertTriangle, Brain, ExternalLink, Trash2, Search, Dices, Clock, Loader2, TrendingUp, ChevronLeft, ChevronRight, CalendarDays, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDifficultyColor, generateId, calculateStreak } from "@/lib/utils"
import {
  fetchLeetCodeProblems, addLeetCodeProblem, toggleRevision, deleteLeetCodeProblem,
  fetchRandomUnsolvedLeetCodeQuestion, markLeetCodeQuestionSolved,
  fetchLeetCodeQuestions, fetchLeetCodeTopics,
} from "@/actions"
import type { LeetCodeQuestion } from "@/types"

interface Problem {
  id: string
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  pattern: string
  solvedDate: string
  timeTaken: number
  needsRevision: boolean
  companyTags: string[]
  notes: string
  slug?: string
  frontendId?: number
}

const BANK_LIMIT = 50

const topicStats: { topic: string; solved: number; total: number }[] = []

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function heatColor(count: number): string {
  if (count >= 5) return "bg-green-500"
  if (count >= 3) return "bg-green-600"
  if (count >= 2) return "bg-green-800"
  if (count >= 1) return "bg-green-900/70"
  return "bg-secondary/50"
}

export default function LeetcodePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [newProblem, setNewProblem] = useState({ name: "", difficulty: "Easy" as "Easy" | "Medium" | "Hard", topic: "", pattern: "", timeTaken: 0, needsRevision: false, companyTags: "", notes: "" })

  const [suggestion, setSuggestion] = useState<LeetCodeQuestion | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addSearch, setAddSearch] = useState("")
  const [addResults, setAddResults] = useState<LeetCodeQuestion[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [actionError, setActionError] = useState("")

  const [bankSearch, setBankSearch] = useState("")
  const [bankDifficulty, setBankDifficulty] = useState("All")
  const [bankTopic, setBankTopic] = useState("All")
  const [topics, setTopics] = useState<string[]>([])
  const [bankQuestions, setBankQuestions] = useState<LeetCodeQuestion[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [bankLoading, setBankLoading] = useState(false)
  const bankSkipRef = useRef(0)

  const todayStr = new Date().toISOString().split("T")[0]

  const easy = problems.filter((p) => p.difficulty === "Easy").length
  const medium = problems.filter((p) => p.difficulty === "Medium").length
  const hard = problems.filter((p) => p.difficulty === "Hard").length
  const revision = problems.filter((p) => p.needsRevision).length

  const filtered = problems.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase()))

  const solvedDates = problems.map((p) => p.solvedDate)
  const streak = calculateStreak(solvedDates).current
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const solvedThisWeek = problems.filter((p) => new Date(p.solvedDate) >= weekAgo).length

  const todaySolved = problems.filter((p) => p.solvedDate === todayStr)
  const todaySolvedSlugs = new Set(todaySolved.map((p) => p.slug))

  const solvedByDate = problems.reduce((map, p) => {
    map.set(p.solvedDate, (map.get(p.solvedDate) || 0) + 1)
    return map
  }, new Map<string, number>())

  const monthYear = viewMonth.getFullYear()
  const monthIndex = viewMonth.getMonth()
  const firstWeekday = new Date(monthYear, monthIndex, 1).getDay()
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate()

  const loadProblems = async () => {
    setProblems(await fetchLeetCodeProblems())
  }

  useEffect(() => {
    fetchLeetCodeProblems().then(setProblems)
    fetchLeetCodeTopics().then(setTopics)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      bankSkipRef.current = 0
      setBankLoading(true)
      fetchLeetCodeQuestions({ search: bankSearch, difficulty: bankDifficulty, topic: bankTopic, limit: BANK_LIMIT, skip: 0 })
        .then(({ questions, total }) => {
          setBankQuestions(questions)
          setBankTotal(total)
          setBankLoading(false)
        })
    }, bankSearch ? 300 : 0)
    return () => clearTimeout(timer)
  }, [bankSearch, bankDifficulty, bankTopic])

  useEffect(() => {
    if (!addOpen) return
    const timer = setTimeout(() => {
      setAddLoading(true)
      fetchLeetCodeQuestions({ search: addSearch, limit: 20, skip: 0 })
        .then(({ questions }) => {
          setAddResults(questions)
          setAddLoading(false)
        })
    }, addSearch ? 300 : 0)
    return () => clearTimeout(timer)
  }, [addOpen, addSearch])

  const handleAdd = async () => {
    if (!newProblem.name) return
    const id = generateId()
    const problem: Problem = {
      id,
      name: newProblem.name,
      difficulty: newProblem.difficulty,
      topic: newProblem.topic,
      pattern: newProblem.pattern,
      solvedDate: todayStr,
      timeTaken: newProblem.timeTaken,
      needsRevision: newProblem.needsRevision,
      companyTags: newProblem.companyTags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: newProblem.notes,
    }
    setProblems([...problems, problem])
    setOpen(false)
    setNewProblem({ name: "", difficulty: "Easy", topic: "", pattern: "", timeTaken: 0, needsRevision: false, companyTags: "", notes: "" })
    await addLeetCodeProblem(problem)
  }

  const handleToggleRevision = async (id: string) => {
    const problem = problems.find((p) => p.id === id)
    if (!problem) return
    const next = !problem.needsRevision
    setProblems(problems.map((p) => p.id === id ? { ...p, needsRevision: next } : p))
    await toggleRevision(id, next)
  }

  const handleDeleteProblem = async (id: string) => {
    setProblems(problems.filter((p) => p.id !== id))
    await deleteLeetCodeProblem(id)
  }

  const handleSurprise = async () => {
    setSuggestLoading(true)
    setActionError("")
    try {
      const q = await fetchRandomUnsolvedLeetCodeQuestion()
      setSuggestion(q)
      if (!q) setActionError("You've solved every question in the bank!")
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to pick a question")
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleAddSuggestion = async () => {
    if (!suggestion) return
    setActionError("")
    try {
      await markLeetCodeQuestionSolved(suggestion.id)
      setSuggestion(null)
      await loadProblems()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add question")
    }
  }

  const handleBankMarkSolved = async (q: LeetCodeQuestion) => {
    setActionError("")
    try {
      await markLeetCodeQuestionSolved(q.id)
      await loadProblems()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark as solved")
    }
  }

  const handleDialogAdd = async (q: LeetCodeQuestion) => {
    setActionError("")
    try {
      await markLeetCodeQuestionSolved(q.id)
      setAddSearch("")
      await loadProblems()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add question")
    }
  }

  const handleLoadMore = async () => {
    bankSkipRef.current += BANK_LIMIT
    setBankLoading(true)
    try {
      const { questions } = await fetchLeetCodeQuestions({ search: bankSearch, difficulty: bankDifficulty, topic: bankTopic, limit: BANK_LIMIT, skip: bankSkipRef.current })
      setBankQuestions((prev) => [...prev, ...questions])
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to load more questions")
    } finally {
      setBankLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">LeetCode Tracker</h2>
          <p className="text-muted-foreground text-sm">Track your problem solving journey</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Problem</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>Add Problem</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Problem Name</Label><Input value={newProblem.name} onChange={(e) => setNewProblem({ ...newProblem, name: e.target.value })} placeholder="Two Sum" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Difficulty</Label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" value={newProblem.difficulty} onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}>
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
                <div><Label>Topic</Label><Input value={newProblem.topic} onChange={(e) => setNewProblem({ ...newProblem, topic: e.target.value })} placeholder="Arrays" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Pattern</Label><Input value={newProblem.pattern} onChange={(e) => setNewProblem({ ...newProblem, pattern: e.target.value })} placeholder="Two Pointer" /></div>
                <div><Label>Time (min)</Label><Input type="number" value={newProblem.timeTaken || ""} onChange={(e) => setNewProblem({ ...newProblem, timeTaken: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Company Tags (comma separated)</Label><Input value={newProblem.companyTags} onChange={(e) => setNewProblem({ ...newProblem, companyTags: e.target.value })} placeholder="Google, Amazon" /></div>
              <div><Label>Notes</Label><Textarea value={newProblem.notes} onChange={(e) => setNewProblem({ ...newProblem, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add Problem</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{problems.length}</p><p className="text-xs text-muted-foreground">Total Solved</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-400">{easy}</p><p className="text-xs text-muted-foreground">Easy</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-400">{medium}</p><p className="text-xs text-muted-foreground">Medium</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-400">{hard}</p><p className="text-xs text-muted-foreground">Hard</p></CardContent></Card>
        <Card className="glass-hover col-span-2 sm:col-span-1"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-400">{revision}</p><p className="text-xs text-muted-foreground">Need Revision</p></CardContent></Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="bank">Question Bank</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="revision">Revision List</TabsTrigger>
          <TabsTrigger value="topics">Weak Topics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {actionError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            <span>{actionError}</span>
            <button className="text-red-400/70 hover:text-red-400" onClick={() => setActionError("")}>&times;</button>
          </div>
        )}

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="glass-hover"><CardContent className="p-4 flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-400" />
              <div><p className="text-2xl font-bold">{streak}</p><p className="text-xs text-muted-foreground">Day Streak</p></div>
            </CardContent></Card>
            <Card className="glass-hover"><CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <div><p className="text-2xl font-bold">{todaySolved.length}</p><p className="text-xs text-muted-foreground">Solved Today</p></div>
            </CardContent></Card>
            <Card className="glass-hover"><CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div><p className="text-2xl font-bold">{solvedThisWeek}</p><p className="text-xs text-muted-foreground">Solved This Week</p></div>
            </CardContent></Card>
          </div>

          <Card className="glass-hover">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-yellow-400" />
                  <p className="font-semibold">Monthly Streak Tracker</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMonth(new Date(monthYear, monthIndex - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="text-sm font-medium w-28 sm:w-36 text-center">{MONTH_NAMES[monthIndex]} {monthYear}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMonth(new Date(monthYear, monthIndex + 1, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => <div key={d} className="text-center text-[10px] text-muted-foreground uppercase">{d}</div>)}
                {Array.from({ length: firstWeekday }).map((_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateKey = `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const count = solvedByDate.get(dateKey) || 0
                  const isToday = dateKey === todayStr
                  return (
                    <div
                      key={day}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs ${heatColor(count)} ${count > 0 ? "text-zinc-100" : "text-muted-foreground"} ${isToday ? "ring-2 ring-yellow-400" : ""}`}
                      title={`${count} solved on ${dateKey}`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Less
                <span className={`h-3 w-3 rounded-sm ${heatColor(0)}`} />
                <span className={`h-3 w-3 rounded-sm ${heatColor(1)}`} />
                <span className={`h-3 w-3 rounded-sm ${heatColor(2)}`} />
                <span className={`h-3 w-3 rounded-sm ${heatColor(3)}`} />
                <span className={`h-3 w-3 rounded-sm ${heatColor(5)}`} />
                More
              </div>
            </CardContent>
          </Card>

          <Card className="glass-hover">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">Today&apos;s Questions</p>
                  <p className="text-xs text-muted-foreground">You solved {todaySolved.length} {todaySolved.length === 1 ? "question" : "questions"} today</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={handleSurprise} disabled={suggestLoading} className="gap-1.5 flex-1 sm:flex-none">
                    <Dices className={`h-4 w-4 ${suggestLoading ? "animate-pulse" : ""}`} />Surprise Me
                  </Button>
                  <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5 flex-1 sm:flex-none"><Plus className="h-4 w-4" />Add</Button>
                </div>
              </div>

              {suggestion && (
                <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Dices className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{suggestion.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={getDifficultyColor(suggestion.difficulty)}>{suggestion.difficulty}</Badge>
                        {suggestion.topics.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <Button size="sm" onClick={handleAddSuggestion} className="gap-1.5 w-full sm:w-auto"><CheckCircle2 className="h-4 w-4" />Add to Today</Button>
                    <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 w-full sm:w-auto"><RefreshCw className="h-4 w-4" />Another</Button>
                  </div>
                </div>
              )}

              {todaySolved.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Nothing solved yet today. Add questions from the bank or hit &quot;Surprise Me&quot;.</p>
              ) : (
                <div className="space-y-2">
                  {todaySolved.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.topic || "Untagged"}{p.timeTaken > 0 ? ` · ${p.timeTaken}m` : ""}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteProblem(p.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card className="glass-hover">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">LeetCode Question Bank</p>
                  <p className="text-xs text-muted-foreground">All {bankTotal.toLocaleString()} free questions migrated to the backend. Mark the ones you solved today.</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="relative col-span-2 sm:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Search questions..." value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                </div>
                <Select value={bankDifficulty} onValueChange={setBankDifficulty}>
                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bankTopic} onValueChange={setBankTopic}>
                  <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Topics</SelectItem>
                    {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {bankLoading && bankQuestions.length === 0 ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" />Loading questions...</div>
            ) : bankQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No questions match your filters.</p>
            ) : (
              bankQuestions.map((q, i) => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                  <Card className="glass-hover">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-muted-foreground font-mono mt-0.5 w-8 text-right">{q.frontendId}</span>
                          <div>
                            <p className="font-medium">{q.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                              {q.topics.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                              {q.topics.length > 3 && <span className="text-xs text-muted-foreground">+{q.topics.length - 3} more</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" asChild className="gap-1.5 flex-1 sm:flex-none">
                            <a href={q.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Open</a>
                          </Button>
                          {todaySolvedSlugs.has(q.slug) ? (
                            <Button size="sm" variant="ghost" disabled className="gap-1.5 flex-1 sm:flex-none"><CheckCircle2 className="h-4 w-4 text-green-400" />Solved Today</Button>
                          ) : (
                            <Button size="sm" onClick={() => handleBankMarkSolved(q)} className="gap-1.5 flex-1 sm:flex-none"><CheckCircle2 className="h-4 w-4" />Mark Solved</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {bankQuestions.length < bankTotal && (
            <div className="text-center">
              <Button variant="outline" onClick={handleLoadMore} disabled={bankLoading} className="gap-2">
                {bankLoading && <Loader2 className="h-4 w-4 animate-spin" />}Load More ({bankQuestions.length}/{bankTotal})
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-hover">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{p.topic}</span><span>·</span><span>{p.pattern}</span><span>·</span><span>{p.timeTaken}m</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {p.companyTags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleRevision(p.id)}>
                          <Brain className={`h-4 w-4 ${p.needsRevision ? "text-orange-400" : "text-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteProblem(p.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revision" className="space-y-3">
          {problems.filter((p) => p.needsRevision).map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover border-orange-400/20">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.topic} · {p.difficulty}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0" onClick={() => handleToggleRevision(p.id)}>Mark Reviewed</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {problems.filter((p) => p.needsRevision).length === 0 && <p className="text-center text-muted-foreground py-8">No problems need revision!</p>}
        </TabsContent>

        <TabsContent value="topics" className="space-y-3">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {topicStats.map((t) => (
              <Card key={t.topic} className="glass-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{t.topic}</p>
                    <span className="text-sm text-muted-foreground">{t.solved}/{t.total}</span>
                  </div>
                  <Progress value={(t.solved / t.total) * 100} className="h-2" />
                  {(t.solved / t.total) < 0.4 && <p className="text-xs text-red-400 mt-2">Weak topic - practice more!</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardContent className="p-6 flex items-center justify-center h-64">
              <p className="text-muted-foreground">Charts coming soon - integrate Recharts for visual analytics</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass border-border/50">
          <DialogHeader><DialogTitle>Add Questions to Today</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search the question bank..." value={addSearch} onChange={(e) => setAddSearch(e.target.value)} autoFocus />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {addLoading ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-6"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
              ) : addResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No questions found.</p>
              ) : (
                addResults.map((q) => (
                  <div key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{q.frontendId}. {q.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                        {q.topics.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                    {todaySolvedSlugs.has(q.slug) ? (
                      <Badge className="text-green-400 bg-green-400/10 border-green-400/30 shrink-0"><CheckCircle2 className="h-3 w-3" />Added</Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleDialogAdd(q)} className="gap-1.5 shrink-0"><CheckCircle2 className="h-4 w-4" />Add</Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
