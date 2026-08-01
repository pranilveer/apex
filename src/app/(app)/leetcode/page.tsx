"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  Plus, Flame, CheckCircle2, Brain, ExternalLink, Trash2, Search, Dices,
  Clock, Loader2, TrendingUp, Star,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDifficultyColor, generateId, calculateStreak, cn } from "@/lib/utils"
import {
  getTodayDateString, nextRevisionDateFor, solvedDatesOf,
  COMPANY_NAMES, COMPANY_TOPICS, BOOKMARK_DEFS,
} from "@/lib/revision"
import {
  fetchLeetCodeProblems, addLeetCodeProblem, toggleRevision, deleteLeetCodeProblem,
  fetchRandomUnsolvedLeetCodeQuestion, markLeetCodeQuestionSolved, markRevision,
  updateLeetCodeNotes, updateLeetCodeConfidence, updateLeetCodeMistakes, updateLeetCodePattern, updateLeetCodeCompanyTags,
  toggleLeetCodeBookmark, fetchLeetCodeQuestions, fetchLeetCodeTopics, fetchLeetCodeTopicCounts, fetchLeetCodePatternTotals, fetchDailyChallenge,
} from "@/actions"
import type { BookmarkKey, LeetCodeProblem, LeetCodeQuestion, RevisionMode } from "@/types"
import { Heatmap } from "@/components/leetcode/heatmap"
import { RevisionList } from "@/components/leetcode/revision-list"
import { DailyChallenge, type DailyChallengeData } from "@/components/leetcode/daily-challenge"
import { SmartSearch, applySmartSearch, DEFAULT_SMART_SEARCH, type SmartSearchState } from "@/components/leetcode/smart-search"
import { PatternTracker } from "@/components/leetcode/pattern-tracker"
import { WeakTopics } from "@/components/leetcode/weak-topics"
import { CompanyStats } from "@/components/leetcode/company-stats"
import { ConfidenceStars } from "@/components/leetcode/confidence-picker"

const QuestionDrawer = dynamic(() => import("@/components/leetcode/question-drawer").then((m) => m.QuestionDrawer), { ssr: false, loading: () => null })
const LearningAnalytics = dynamic(() => import("@/components/leetcode/learning-analytics").then((m) => m.LearningAnalytics), { ssr: false, loading: () => null })
const PrepMode = dynamic(() => import("@/components/leetcode/prep-mode").then((m) => m.PrepMode), { ssr: false, loading: () => null })
const JournalPanel = dynamic(() => import("@/components/leetcode/journal-panel").then((m) => m.JournalPanel), { ssr: false, loading: () => null })

const BANK_LIMIT = 50

export default function LeetcodePage() {
  const todayStr = getTodayDateString()
  const [problems, setProblems] = useState<LeetCodeProblem[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({})
  const [patternTotals, setPatternTotals] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("today")
  const [actionError, setActionError] = useState("")

  const [open, setOpen] = useState(false)
  const [newProblem, setNewProblem] = useState({ name: "", difficulty: "Easy" as "Easy" | "Medium" | "Hard", topic: "", pattern: "", timeTaken: 0, needsRevision: false, companyTags: "", notes: "" })

  const [suggestion, setSuggestion] = useState<LeetCodeQuestion | null>(null)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addSearch, setAddSearch] = useState("")
  const [addResults, setAddResults] = useState<LeetCodeQuestion[]>([])
  const [addLoading, setAddLoading] = useState(false)

  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [heatMode, setHeatMode] = useState<RevisionMode>("solved")

  const [bankSearch, setBankSearch] = useState("")
  const [bankDifficulty, setBankDifficulty] = useState("All")
  const [bankTopic, setBankTopic] = useState("All")
  const [bankCompany, setBankCompany] = useState("")
  const [bankQuestions, setBankQuestions] = useState<LeetCodeQuestion[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [bankLoading, setBankLoading] = useState(false)
  const bankSkipRef = useRef(0)

  const [smartSearch, setSmartSearch] = useState<SmartSearchState>(DEFAULT_SMART_SEARCH)
  const [challenge, setChallenge] = useState<DailyChallengeData | null>(null)
  const [challengeLoading, setChallengeLoading] = useState(false)
  const [drawer, setDrawer] = useState<{ problem: LeetCodeProblem | null; question: LeetCodeQuestion | null } | null>(null)

  const loadProblems = async () => {
    setProblems(await fetchLeetCodeProblems())
  }

  useEffect(() => {
    fetchLeetCodeProblems().then(setProblems)
    fetchLeetCodeTopics().then(setTopics)
    fetchLeetCodeTopicCounts().then((rows) => {
      const m: Record<string, number> = {}
      for (const r of rows) m[r.topic] = r.count
      setTopicCounts(m)
    })
    fetchLeetCodePatternTotals().then(setPatternTotals)
    fetchDailyChallenge().then(setChallenge)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      bankSkipRef.current = 0
      setBankLoading(true)
      const topicsQuery = bankCompany ? COMPANY_TOPICS[bankCompany] : undefined
      fetchLeetCodeQuestions({ search: bankSearch, difficulty: bankDifficulty, topic: bankTopic, topics: topicsQuery, limit: BANK_LIMIT, skip: 0 })
        .then(({ questions, total }) => {
          setBankQuestions(questions)
          setBankTotal(total)
          setBankLoading(false)
        })
        .catch(() => setBankLoading(false))
    }, bankSearch ? 300 : 0)
    return () => clearTimeout(timer)
  }, [bankSearch, bankDifficulty, bankTopic, bankCompany])

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

  const easy = problems.filter((p) => p.difficulty === "Easy").length
  const medium = problems.filter((p) => p.difficulty === "Medium").length
  const hard = problems.filter((p) => p.difficulty === "Hard").length
  const revision = problems.filter((p) => p.needsRevision).length

  const filteredProblems = useMemo(() => applySmartSearch(problems, smartSearch), [problems, smartSearch])

  const allSolvedDates = useMemo(() => {
    const set = new Set<string>()
    for (const p of problems) for (const d of solvedDatesOf(p)) set.add(d)
    return [...set]
  }, [problems])
  const streak = calculateStreak(allSolvedDates).current

  const weekAgo = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }, [])
  const solvedThisWeek = allSolvedDates.filter((d) => d >= weekAgo).length

  const todaySolved = useMemo(
    () => problems.filter((p) => p.solvedDate === todayStr || (p.attemptHistory ?? []).some((a) => a.type === "solved" && a.date === todayStr)),
    [problems, todayStr]
  )
  const todaySolvedSlugs = useMemo(() => new Set(todaySolved.flatMap((p) => p.slug ? [p.slug] : [])), [todaySolved])

  const solvedByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of problems) {
      for (const d of solvedDatesOf(p)) map.set(d, (map.get(d) ?? 0) + 1)
    }
    return map
  }, [problems])

  const revisionByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of problems) {
      for (const a of p.attemptHistory ?? []) {
        if (a.type === "revision") map.set(a.date, (map.get(a.date) ?? 0) + 1)
      }
      if (p.lastRevisionDate && !(p.attemptHistory ?? []).some((a) => a.type === "revision")) {
        map.set(p.lastRevisionDate, (map.get(p.lastRevisionDate) ?? 0) + 1)
      }
    }
    return map
  }, [problems])

  const dueRevision = useMemo(
    () => problems.filter((p) => p.nextRevisionDate && p.nextRevisionDate <= todayStr && p.lastRevisionDate !== todayStr),
    [problems, todayStr]
  )
  const upcomingRevision = useMemo(
    () => problems.filter((p) => p.nextRevisionDate && p.nextRevisionDate > todayStr).sort((a, b) => (a.nextRevisionDate ?? "").localeCompare(b.nextRevisionDate ?? "")),
    [problems, todayStr]
  )
  const doneToday = useMemo(() => problems.filter((p) => p.lastRevisionDate === todayStr), [problems, todayStr])

  const handleAdd = async () => {
    if (!newProblem.name) return
    const problem: LeetCodeProblem = {
      id: generateId(),
      name: newProblem.name,
      difficulty: newProblem.difficulty,
      topic: newProblem.topic,
      pattern: newProblem.pattern,
      solvedDate: todayStr,
      timeTaken: newProblem.timeTaken,
      needsRevision: newProblem.needsRevision,
      companyTags: newProblem.companyTags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: newProblem.notes,
      revisionCount: 0,
      lastRevisionDate: todayStr,
      confidence: 3,
      attemptHistory: [{ type: "solved", date: todayStr, confidence: 3 }],
      nextRevisionDate: nextRevisionDateFor(todayStr, 0, 3),
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
    if (drawer?.problem?.id === id) setDrawer(null)
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

  const markSolvedAndReload = async (q: LeetCodeQuestion, confidence?: number) => {
    await markLeetCodeQuestionSolved(q.id, { confidence })
    await loadProblems()
  }

  const handleAddSuggestion = async () => {
    if (!suggestion) return
    setActionError("")
    try {
      await markSolvedAndReload(suggestion)
      setSuggestion(null)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add question")
    }
  }

  const handleBankMarkSolved = async (q: LeetCodeQuestion) => {
    setActionError("")
    try {
      await markSolvedAndReload(q)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark as solved")
    }
  }

  const handleDialogAdd = async (q: LeetCodeQuestion) => {
    setActionError("")
    try {
      await markSolvedAndReload(q)
      setAddSearch("")
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to add question")
    }
  }

  const handleDrawerMarkSolved = async (q: LeetCodeQuestion, confidence?: number) => {
    setActionError("")
    try {
      await markLeetCodeQuestionSolved(q.id, { confidence })
      const list = await fetchLeetCodeProblems()
      setProblems(list)
      setDrawer({ problem: list.find((p) => p.slug === q.slug) ?? null, question: q })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark as solved")
    }
  }

  const handleMarkRevised = async (id: string, confidence: number) => {
    setProblems((prev) => prev.map((p) => {
      if (p.id !== id) return p
      const revisionCount = (p.revisionCount ?? 0) + 1
      return {
        ...p,
        revisionCount,
        lastRevisionDate: todayStr,
        confidence,
        nextRevisionDate: nextRevisionDateFor(todayStr, revisionCount, confidence),
        attemptHistory: [...(p.attemptHistory ?? []), { type: "revision", date: todayStr, confidence }],
        needsRevision: false,
      }
    }))
    if (drawer?.problem?.id === id) {
      const p = problems.find((x) => x.id === id)!
      const revisionCount = (p.revisionCount ?? 0) + 1
      setDrawer({
        ...drawer,
        problem: {
          ...drawer.problem,
          revisionCount,
          lastRevisionDate: todayStr,
          confidence,
          nextRevisionDate: nextRevisionDateFor(todayStr, revisionCount, confidence),
          attemptHistory: [...(drawer.problem.attemptHistory ?? []), { type: "revision", date: todayStr, confidence }],
          needsRevision: false,
        },
      })
    }
    setActionError("")
    try {
      await markRevision(id, confidence)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark revision")
    }
  }

  const handleUpdateProblem = async (id: string, patch: Partial<LeetCodeProblem>) => {
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    if (drawer?.problem?.id === id) setDrawer({ ...drawer, problem: { ...drawer.problem, ...patch } })
    try {
      if (patch.notes !== undefined) await updateLeetCodeNotes(id, patch.notes)
      if (patch.confidence !== undefined) await updateLeetCodeConfidence(id, patch.confidence)
      if (patch.mistakes !== undefined) await updateLeetCodeMistakes(id, patch.mistakes)
      if (patch.pattern !== undefined) await updateLeetCodePattern(id, patch.pattern)
      if (patch.companyTags !== undefined) await updateLeetCodeCompanyTags(id, patch.companyTags)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to save")
    }
  }

  const handleToggleBookmark = async (id: string, key: BookmarkKey) => {
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)))
    if (drawer?.problem?.id === id) setDrawer({ ...drawer, problem: { ...drawer.problem, [key]: !drawer.problem[key] } })
    try {
      await toggleLeetCodeBookmark(id, key)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to update bookmark")
    }
  }

  const handleLoadMore = async () => {
    bankSkipRef.current += BANK_LIMIT
    setBankLoading(true)
    try {
      const topicsQuery = bankCompany ? COMPANY_TOPICS[bankCompany] : undefined
      const { questions } = await fetchLeetCodeQuestions({ search: bankSearch, difficulty: bankDifficulty, topic: bankTopic, topics: topicsQuery, limit: BANK_LIMIT, skip: bankSkipRef.current })
      setBankQuestions((prev) => [...prev, ...questions])
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to load more questions")
    } finally {
      setBankLoading(false)
    }
  }

  const loadChallenge = async () => {
    setChallengeLoading(true)
    setActionError("")
    try {
      setChallenge(await fetchDailyChallenge())
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to load challenge")
    } finally {
      setChallengeLoading(false)
    }
  }

  const openDrawer = (problem: LeetCodeProblem | null, question: LeetCodeQuestion | null) => setDrawer({ problem, question })

  const bankProblemFor = (q: LeetCodeQuestion) => problems.find((p) => p.slug === q.slug) ?? null

  const goToBank = (opts: { topic?: string; company?: string }) => {
    setBankTopic(opts.topic ?? "All")
    setBankCompany(opts.company ?? "")
    setActiveTab("bank")
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold">LeetCode Tracker</h2>
          <p className="text-muted-foreground text-sm">Track your problem solving journey</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-9 w-9 shrink-0 md:hidden" aria-label="Add Problem">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button className="hidden md:inline-flex gap-2"><Plus className="h-4 w-4" />Add Problem</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50 p-4 sm:p-6">
            <DialogHeader><DialogTitle className="text-base sm:text-lg">Add Problem</DialogTitle></DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div><Label className="text-xs sm:text-sm">Problem Name</Label><Input className="h-9 sm:h-10" value={newProblem.name} onChange={(e) => setNewProblem({ ...newProblem, name: e.target.value })} placeholder="Two Sum" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div><Label className="text-xs sm:text-sm">Difficulty</Label>
                  <select className="flex h-9 sm:h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" value={newProblem.difficulty} onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value as "Easy" | "Medium" | "Hard" })}>
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
                <div><Label className="text-xs sm:text-sm">Topic</Label><Input className="h-9 sm:h-10" value={newProblem.topic} onChange={(e) => setNewProblem({ ...newProblem, topic: e.target.value })} placeholder="Arrays" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div><Label className="text-xs sm:text-sm">Pattern</Label><Input className="h-9 sm:h-10" value={newProblem.pattern} onChange={(e) => setNewProblem({ ...newProblem, pattern: e.target.value })} placeholder="Two Pointer" /></div>
                <div><Label className="text-xs sm:text-sm">Time (min)</Label><Input className="h-9 sm:h-10" type="number" value={newProblem.timeTaken || ""} onChange={(e) => setNewProblem({ ...newProblem, timeTaken: Number(e.target.value) })} /></div>
              </div>
              <div><Label className="text-xs sm:text-sm">Company Tags (comma separated)</Label><Input className="h-9 sm:h-10" value={newProblem.companyTags} onChange={(e) => setNewProblem({ ...newProblem, companyTags: e.target.value })} placeholder="Google, Amazon" /></div>
              <div><Label className="text-xs sm:text-sm">Notes</Label><Textarea className="min-h-[64px] sm:min-h-[80px]" value={newProblem.notes} onChange={(e) => setNewProblem({ ...newProblem, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add Problem</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card className="glass-hover p-0"><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{problems.length}</p><p className="text-xs text-muted-foreground">Total Solved</p></CardContent></Card>
        <Card className="glass-hover p-0"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-400">{easy}</p><p className="text-xs text-muted-foreground">Easy</p></CardContent></Card>
        <Card className="glass-hover p-0"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-400">{medium}</p><p className="text-xs text-muted-foreground">Medium</p></CardContent></Card>
        <Card className="glass-hover p-0"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-red-400">{hard}</p><p className="text-xs text-muted-foreground">Hard</p></CardContent></Card>
        <Card className="glass-hover p-0 col-span-2 sm:col-span-1"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-400">{revision}</p><p className="text-xs text-muted-foreground">Need Revision</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="bank">Question Bank</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
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

          <RevisionList due={dueRevision} today={todayStr} onMarkRevised={handleMarkRevised} onOpen={(p) => openDrawer(p, null)} />

          <DailyChallenge
            challenge={challenge}
            loading={challengeLoading}
            solvedSlugs={todaySolvedSlugs}
            onRefresh={loadChallenge}
            onAdd={async (q) => { await handleBankMarkSolved(q); await loadChallenge() }}
            onMarkRevision={handleMarkRevised}
          />

          <Heatmap
            mode={heatMode}
            onModeChange={setHeatMode}
            solvedByDate={solvedByDate}
            revisionByDate={revisionByDate}
            month={viewMonth}
            onMonthChange={setViewMonth}
            todayStr={todayStr}
          />

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
                    <Button size="sm" variant="ghost" onClick={handleSurprise} className="gap-1.5 w-full sm:w-auto"><Dices className="h-4 w-4" />Another</Button>
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
                        <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => openDrawer(p, null)}>
                          <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.topic || "Untagged"}{p.timeTaken > 0 ? ` · ${p.timeTaken}m` : ""}</p>
                          </div>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <ConfidenceStars value={p.confidence ?? 0} size="sm" />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteProblem(p.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <Card className="glass-hover p-0">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">LeetCode Question Bank</p>
                  <p className="text-xs text-muted-foreground">All {bankTotal.toLocaleString()} free questions migrated to the backend. Mark the ones you solved today.</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                <Select value={bankTopic} onValueChange={(v) => { setBankTopic(v); setBankCompany("") }}>
                  <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Topics</SelectItem>
                    {topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={bankCompany} onValueChange={(v) => { setBankCompany(v); setBankTopic("All") }}>
                  <SelectTrigger><SelectValue placeholder="Company" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Companies</SelectItem>
                    {COMPANY_NAMES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              bankQuestions.map((q, i) => {
                const solved = bankProblemFor(q)
                return (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                    <Card className="glass-hover p-0">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <button type="button" className="flex items-start gap-3 text-left" onClick={() => openDrawer(solved, q)}>
                            <span className="text-sm text-muted-foreground font-mono mt-0.5 w-8 text-right">{q.frontendId}</span>
                            <div>
                              <p className="font-medium">{q.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                                {q.topics.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                                {q.topics.length > 3 && <span className="text-xs text-muted-foreground">+{q.topics.length - 3} more</span>}
                              </div>
                            </div>
                          </button>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline" asChild className="gap-1.5 flex-1 sm:flex-none">
                              <a href={q.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Open</a>
                            </Button>
                            {solved ? (
                              <Button size="sm" variant="ghost" disabled className="gap-1.5 flex-1 sm:flex-none"><CheckCircle2 className="h-4 w-4 text-green-400" />Solved Today</Button>
                            ) : (
                              <Button size="sm" onClick={() => handleBankMarkSolved(q)} className="gap-1.5 flex-1 sm:flex-none"><CheckCircle2 className="h-4 w-4" />Mark Solved</Button>
                            )}
                            {solved && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleToggleBookmark(solved.id, "isFavorite")}>
                                <Star className={cn("h-4 w-4", solved.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
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

        <TabsContent value="revision" className="space-y-4">
          <RevisionList due={dueRevision} today={todayStr} onMarkRevised={handleMarkRevised} onOpen={(p) => openDrawer(p, null)} />

          {doneToday.length > 0 && (
            <Card className="glass-hover">
              <CardContent className="p-4 sm:p-6 space-y-2">
                <p className="text-sm font-medium">Completed Today</p>
                {doneToday.map((p) => (
                  <button key={p.id} type="button" onClick={() => openDrawer(p, null)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5 text-left transition-colors hover:bg-accent">
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                      <p className="truncate text-sm">{p.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">Next: {p.nextRevisionDate ?? "—"}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="glass-hover">
            <CardContent className="p-4 sm:p-6 space-y-2">
              <p className="text-sm font-medium">Upcoming ({upcomingRevision.length})</p>
              {upcomingRevision.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">No upcoming revisions scheduled.</p>
              ) : (
                <div className="space-y-1.5">
                  {upcomingRevision.map((p) => (
                    <button key={p.id} type="button" onClick={() => openDrawer(p, null)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5 text-left transition-colors hover:bg-accent">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                        <p className="truncate text-sm">{p.name}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{p.nextRevisionDate}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <PatternTracker problems={problems} patternTotals={patternTotals} today={todayStr} />
          <WeakTopics problems={problems} topicCounts={topicCounts} today={todayStr} onSelect={(t) => goToBank({ topic: t })} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <LearningAnalytics problems={problems} />
          <CompanyStats problems={problems} onSelect={(c) => goToBank({ company: c })} />
        </TabsContent>

        <TabsContent value="prep">
          <PrepMode problems={problems} today={todayStr} onAddQuestion={async (q) => { await handleBankMarkSolved(q); }} onOpenProblem={(p) => openDrawer(p, null)} />
        </TabsContent>

        <TabsContent value="journal">
          <JournalPanel />
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <Card className="glass-hover">
            <CardContent className="p-4">
              <SmartSearch state={smartSearch} onChange={setSmartSearch} resultCount={filteredProblems.length} />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {filteredProblems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No problems match your search.</p>
            ) : (
              filteredProblems.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className="glass-hover">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="button" className="flex min-w-0 items-center gap-4 text-left" onClick={() => openDrawer(p, null)}>
                          <Badge className={getDifficultyColor(p.difficulty)}>{p.difficulty}</Badge>
                          <div className="min-w-0">
                            <p className="font-medium">{p.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                              <span>{p.topic || "Untagged"}</span>
                              <span>·</span>
                              <span>{p.pattern || "No pattern"}</span>
                              <span>·</span>
                              <span>{p.timeTaken}m</span>
                              {p.nextRevisionDate && (
                                <>
                                  <span>·</span>
                                  <span className={cn(p.nextRevisionDate <= todayStr ? "text-red-400" : "")}>Revision {p.nextRevisionDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                        <div className="flex flex-wrap items-center gap-2">
                          <ConfidenceStars value={p.confidence ?? 0} size="sm" />
                          {BOOKMARK_DEFS.slice(0, 1).map(({ key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleToggleBookmark(p.id, key)}
                              className={cn("flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors", p[key] ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" : "border-border text-muted-foreground hover:bg-accent")}
                              title={label}
                            >
                              <Star className={cn("h-3 w-3", p[key] && "fill-yellow-400")} />
                            </button>
                          ))}
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
              ))
            )}
          </div>
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

      <QuestionDrawer
        open={drawer !== null}
        problem={drawer?.problem ?? null}
        question={drawer?.question ?? null}
        onClose={() => setDrawer(null)}
        onMarkSolved={handleDrawerMarkSolved}
        onMarkRevision={handleMarkRevised}
        onUpdateProblem={handleUpdateProblem}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  )
}
