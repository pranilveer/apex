"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase, Plus, ExternalLink, Phone, Mail, Trash2, CheckCircle2, XCircle, Clock, FileText, DollarSign,
  Search, Filter, Copy, Archive, Calendar, BarChart3, Target, TrendingUp, Flame, Download,
  ChevronLeft, ChevronRight, MapPin, Globe, Building2, User, Link, BookOpen, Gift, Star,
  AlertCircle, MessageSquare, ListTodo, Eye, EyeOff, Upload, Settings, GitBranch, Linkedin,
  ChevronDown, MoreHorizontal, Play, Award, Zap, Layers, PieChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getStatusColor, getWorkModeColor, getPriorityColor, formatCurrency, generateId, getRelativeDayLabel, formatDate, calculateStreak, cn
} from "@/lib/utils"
import {
  fetchJobs, addJob, updateJob, updateJobStatus, deleteJob,
  addStatusHistory, addInterview, updateInterview, deleteInterview,
  addFollowUp, updateFollowUp,
  fetchWishlist, addWishlist, updateWishlist, deleteWishlist,
  fetchJobGoals, addJobGoal, updateJobGoal, deleteJobGoal,
  fetchInterviewLearnings, addInterviewLearning, deleteInterviewLearning,
  duplicateJob, archiveJob, exportJobsCSV, exportJobsJSON
} from "@/actions"

type Job = import("@/types").JobApplication
type WishlistItem = import("@/types").WishlistCompany
type JobGoalType = import("@/types").JobGoal
type Interview = import("@/types").Interview
type FollowUp = import("@/types").FollowUp
type StatusHistoryEntry = import("@/types").StatusHistoryEntry
type InterviewLearning = import("@/types").InterviewLearning

const statusFlow = ["applied", "oa", "interview", "hr", "offer", "rejected"]
const sources = ["LinkedIn", "Indeed", "Naukri", "Wellfound", "Referral", "Company Career Page", "Twitter", "Other"]
const workModes = ["remote", "hybrid", "onsite"]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [goals, setGoals] = useState<JobGoalType[]>([])
  const [learnings, setLearnings] = useState<InterviewLearning[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [detailJob, setDetailJob] = useState<Job | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSource, setFilterSource] = useState("all")
  const [filterWorkMode, setFilterWorkMode] = useState("all")
  const [showArchived, setShowArchived] = useState(false)

  const [newJob, setNewJob] = useState({
    company: "", role: "", notes: "", expectedSalary: 0, location: "", workMode: "" as Job["workMode"],
    source: "", jobUrl: "", recruiterName: "", recruiterEmail: "", recruiterLinkedIn: "",
    resumeVersion: "", coverLetter: "", portfolioUrl: "", githubUrl: "", linkedInUrl: ""
  })

  useEffect(() => {
    Promise.all([fetchJobs(), fetchWishlist(), fetchJobGoals(), fetchInterviewLearnings()]).then(([j, w, g, l]) => {
      setJobs(j); setWishlist(w); setGoals(g); setLearnings(l); setLoading(false)
    })
  }, [])

  const filteredJobs = useMemo(() => jobs.filter((j) => {
    if (!showArchived && j.archived) return false
    if (search) {
      const q = search.toLowerCase()
      if (!j.company.toLowerCase().includes(q) && !j.role.toLowerCase().includes(q) && !j.notes.toLowerCase().includes(q)) return false
    }
    if (filterStatus !== "all" && j.status !== filterStatus) return false
    if (filterSource !== "all" && j.source !== filterSource) return false
    if (filterWorkMode !== "all" && j.workMode !== filterWorkMode) return false
    return true
  }), [search, filterStatus, filterSource, filterWorkMode, showArchived, jobs])

  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]

  const stats = useMemo(() => ({
    today: jobs.filter((j) => j.appliedDate === today).length,
    yesterday: jobs.filter((j) => j.appliedDate === yesterday).length,
    week: jobs.filter((j) => j.appliedDate >= weekAgo).length,
    month: jobs.filter((j) => j.appliedDate >= monthAgo).length,
    total: jobs.length,
  }), [jobs, today, yesterday, weekAgo, monthAgo])

  const streak = useMemo(() => calculateStreak(jobs.map((j) => j.appliedDate)), [jobs])

  const upcomingInterviews = useMemo(() => {
    const all: { job: Job; interview: Interview }[] = []
    for (const job of jobs) {
      for (const iv of (job.interviews || [])) {
        if (iv.date >= today) all.push({ job, interview: iv })
      }
    }
    return all.sort((a, b) => a.interview.date.localeCompare(b.interview.date))
  }, [jobs, today])

  const pendingFollowUps = useMemo(() => {
    const all: { job: Job; fu: FollowUp }[] = []
    for (const job of jobs) {
      for (const fu of (job.followUps || [])) {
        if (!fu.completed) all.push({ job, fu })
      }
    }
    return all
  }, [jobs])

  const dailyGoal = goals.find((g) => g.type === "daily")
  const weeklyGoal = goals.find((g) => g.type === "weekly")
  const monthlyGoal = goals.find((g) => g.type === "monthly")

  const responseRate = jobs.length > 0
    ? Math.round(jobs.filter((j) => j.status !== "applied").length / jobs.length * 100)
    : 0
  const interviewConversion = jobs.filter((j) => ["interview", "hr", "offer"].includes(j.status)).length > 0
    ? Math.round(jobs.filter((j) => ["interview", "hr", "offer"].includes(j.status)).length / jobs.filter((j) => j.status !== "applied").length * 100)
    : 0
  const offerConversion = jobs.filter((j) => j.status === "offer").length > 0
    ? Math.round(jobs.filter((j) => j.status === "offer").length / jobs.filter((j) => ["interview", "hr", "offer"].includes(j.status)).length * 100)
    : 0

  const sourceStats = useMemo(() => {
    const map = new Map<string, { total: number; responded: number }>()
    for (const j of jobs) {
      const src = j.source || "Unknown"
      const existing = map.get(src) || { total: 0, responded: 0 }
      existing.total++
      if (j.status !== "applied") existing.responded++
      map.set(src, existing)
    }
    return Array.from(map.entries()).map(([source, data]) => ({
      source, total: data.total, responded: data.responded,
      rate: data.total > 0 ? Math.round(data.responded / data.total * 100) : 0
    }))
  }, [jobs])

  const weeklyApps = useMemo(() => {
    const map = new Map<string, number>()
    for (const j of jobs) {
      const d = new Date(j.appliedDate)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split("T")[0]
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  }, [jobs])

  const monthlyApps = useMemo(() => {
    const map = new Map<string, number>()
    for (const j of jobs) {
      const key = j.appliedDate.slice(0, 7)
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  }, [jobs])

  const avgExpected = jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.expectedSalary, 0) / jobs.length) : 0
  const avgOffered = jobs.filter((j) => j.salaryOffered > 0).length > 0
    ? Math.round(jobs.filter((j) => j.salaryOffered > 0).reduce((s, j) => s + j.salaryOffered, 0) / jobs.filter((j) => j.salaryOffered > 0).length)
    : 0
  const bestOffer = jobs.filter((j) => j.salaryOffered > 0).sort((a, b) => b.salaryOffered - a.salaryOffered)[0]

  const handleAdd = async () => {
    if (!newJob.company) return
    const job: Job = {
      id: generateId(), company: newJob.company, role: newJob.role,
      status: "applied", appliedDate: today,
      referralStatus: "", salaryOffered: 0, expectedSalary: newJob.expectedSalary,
      notes: newJob.notes, location: newJob.location, workMode: newJob.workMode,
      source: newJob.source, jobUrl: newJob.jobUrl,
      recruiterName: newJob.recruiterName, recruiterEmail: newJob.recruiterEmail,
      recruiterLinkedIn: newJob.recruiterLinkedIn,
      resumeVersion: newJob.resumeVersion, coverLetter: newJob.coverLetter,
      portfolioUrl: newJob.portfolioUrl, githubUrl: newJob.githubUrl,
      linkedInUrl: newJob.linkedInUrl,
      interviewNotes: "", archived: false, statusHistory: [{ status: "applied", date: today }],
      interviews: [], followUps: []
    }
    setJobs([job, ...jobs])
    setAddOpen(false)
    setNewJob({ company: "", role: "", notes: "", expectedSalary: 0, location: "", workMode: "", source: "", jobUrl: "", recruiterName: "", recruiterEmail: "", recruiterLinkedIn: "", resumeVersion: "", coverLetter: "", portfolioUrl: "", githubUrl: "", linkedInUrl: "" })
    await addJob(job)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    const entry: StatusHistoryEntry = { status, date: today }
    setJobs(jobs.map((j) => j.id === id ? { ...j, status, statusHistory: [...(j.statusHistory || []), entry] } : j))
    await updateJobStatus(id, status)
    await addStatusHistory(id, entry)
  }

  const handleDelete = async (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id))
    await deleteJob(id)
    if (detailJob?.id === id) { setDetailOpen(false); setDetailJob(null) }
  }

  const handleArchive = async (id: string) => {
    setJobs(jobs.map((j) => j.id === id ? { ...j, archived: !j.archived } : j))
    await archiveJob(id)
  }

  const handleDuplicate = async (id: string) => {
    await duplicateJob(id)
    const updated = await fetchJobs()
    setJobs(updated)
  }

  const handleCopyLink = (url: string) => {
    if (url) navigator.clipboard.writeText(url)
  }

  const counts = {
    applied: jobs.filter((j) => j.status === "applied").length,
    oa: jobs.filter((j) => j.status === "oa").length,
    interview: jobs.filter((j) => j.status === "interview").length,
    hr: jobs.filter((j) => j.status === "hr").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
    offer: jobs.filter((j) => j.status === "offer").length,
  }

  const countsArray = [
    { label: "Applied", count: counts.applied, icon: FileText, color: "text-blue-400" },
    { label: "OA", count: counts.oa, icon: Clock, color: "text-yellow-400" },
    { label: "Interview", count: counts.interview, icon: Phone, color: "text-purple-400" },
    { label: "HR", count: counts.hr, icon: Mail, color: "text-cyan-400" },
    { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-red-400" },
    { label: "Offers", count: counts.offer, icon: CheckCircle2, color: "text-green-400" },
  ]

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-8 w-64 skeleton rounded-lg" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Job Hunt Management</h2>
          <p className="text-muted-foreground text-sm">Track applications, interviews, and offers</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Add Application</Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Application</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Company *</Label><Input value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} placeholder="Google" /></div>
                  <div><Label>Role</Label><Input value={newJob.role} onChange={(e) => setNewJob({ ...newJob, role: e.target.value })} placeholder="SDE-2" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Location</Label><Input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} placeholder="Bangalore" /></div>
                  <div><Label>Work Mode</Label><Select value={newJob.workMode} onValueChange={(v: Job["workMode"]) => setNewJob({ ...newJob, workMode: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{workModes.map((m) => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Source</Label><Select value={newJob.source} onValueChange={(v) => setNewJob({ ...newJob, source: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Expected Salary (CTC)</Label><Input type="number" value={newJob.expectedSalary || ""} onChange={(e) => setNewJob({ ...newJob, expectedSalary: Number(e.target.value) })} placeholder="2000000" /></div>
                </div>
                <div><Label>Job URL</Label><Input value={newJob.jobUrl} onChange={(e) => setNewJob({ ...newJob, jobUrl: e.target.value })} placeholder="https://..." /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Recruiter Name</Label><Input value={newJob.recruiterName} onChange={(e) => setNewJob({ ...newJob, recruiterName: e.target.value })} /></div>
                  <div><Label>Recruiter Email</Label><Input type="email" value={newJob.recruiterEmail} onChange={(e) => setNewJob({ ...newJob, recruiterEmail: e.target.value })} /></div>
                </div>
                <div><Label>Recruiter LinkedIn</Label><Input value={newJob.recruiterLinkedIn} onChange={(e) => setNewJob({ ...newJob, recruiterLinkedIn: e.target.value })} /></div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Resume Version</Label><Input value={newJob.resumeVersion} onChange={(e) => setNewJob({ ...newJob, resumeVersion: e.target.value })} placeholder="v2.1" /></div>
                  <div><Label>Cover Letter</Label><Input value={newJob.coverLetter} onChange={(e) => setNewJob({ ...newJob, coverLetter: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label>Portfolio URL</Label><Input value={newJob.portfolioUrl} onChange={(e) => setNewJob({ ...newJob, portfolioUrl: e.target.value })} /></div>
                  <div><Label>GitHub URL</Label><Input value={newJob.githubUrl} onChange={(e) => setNewJob({ ...newJob, githubUrl: e.target.value })} /></div>
                </div>
                <div><Label>LinkedIn URL</Label><Input value={newJob.linkedInUrl} onChange={(e) => setNewJob({ ...newJob, linkedInUrl: e.target.value })} /></div>
                <div><Label>Notes</Label><Textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} /></div>
                <Button onClick={handleAdd} className="w-full">Add Application</Button>
              </div>
            </DialogContent>
          </Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={async () => {
                  const csv = await exportJobsCSV()
                  const blob = new Blob([csv], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a"); a.href = url; a.download = "jobs.csv"; a.click()
                  URL.revokeObjectURL(url)
                }}><Download className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Export CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 grid-cols-1 lg:grid-cols-4">
        <Card className="glass-hover lg:col-span-1">
          <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" />Today's Goal
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Applications Today</span><span className="font-semibold">{stats.today}{dailyGoal ? ` / ${dailyGoal.target}` : ""}</span></div>
              {dailyGoal && <Progress value={dailyGoal.target > 0 ? (stats.today / dailyGoal.target) * 100 : 0} className="h-1.5" />}
              <div className="flex justify-between text-sm"><span>Applications Left</span><span className="font-semibold">{dailyGoal ? Math.max(0, dailyGoal.target - stats.today) : 0}</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span>Upcoming Interviews</span><span className="font-semibold text-purple-400">{upcomingInterviews.length}</span></div>
              {upcomingInterviews.slice(0, 3).map(({ job, interview }) => (
                <div key={interview.id} className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />{job.company} - {formatDate(interview.date)}
                </div>
              ))}
              <div className="flex justify-between text-sm"><span>Pending Follow-ups</span><span className="font-semibold text-yellow-400">{pendingFollowUps.length}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2 sm:gap-3 grid-cols-5 lg:col-span-2">
          {[
            { label: "Today", count: stats.today, color: "text-violet-400", icon: Zap },
            { label: "Yesterday", count: stats.yesterday, color: "text-blue-400", icon: Clock },
            { label: "This Week", count: stats.week, color: "text-cyan-400", icon: Calendar },
            { label: "This Month", count: stats.month, color: "text-green-400", icon: TrendingUp },
            { label: "Total", count: stats.total, color: "text-primary", icon: Briefcase },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="glass-hover h-full">
                <CardContent className="p-2 sm:p-3 text-center">
                  <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-0.5 sm:mb-1 ${s.color}`} />
                  <p className="text-base sm:text-xl font-bold">{s.count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-hover lg:col-span-1">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-400" />Streak
            </div>
            <div className="flex items-center justify-around text-center">
              <div><p className="text-2xl font-bold text-orange-400">{streak.current}</p><p className="text-xs text-muted-foreground">Current</p></div>
              <div><p className="text-2xl font-bold text-yellow-400">{streak.longest}</p><p className="text-xs text-muted-foreground">Longest</p></div>
              <div><p className="text-2xl font-bold text-red-400">{streak.missedDays}</p><p className="text-xs text-muted-foreground">Missed</p></div>
            </div>
            <div className="flex gap-px sm:gap-0.5 justify-center overflow-x-auto">
              {Array.from({ length: 30 }).map((_, i) => {
                const d = new Date(Date.now() - (29 - i) * 86400000)
                const ds = d.toISOString().split("T")[0]
                const hasApp = jobs.some((j) => j.appliedDate === ds)
                return <div key={i} className={cn("h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm shrink-0", hasApp ? "bg-primary" : "bg-secondary")} />
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:flex gap-2">
        <div className="relative col-span-2 sm:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search company, role..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusFlow.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterWorkMode} onValueChange={setFilterWorkMode}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Work Mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            {workModes.map((m) => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="justify-self-end" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="flex-nowrap overflow-x-auto scrollbar-none w-full sm:flex-wrap sm:overflow-visible">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-3">
          {filteredJobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-hover cursor-pointer" onClick={() => { setDetailJob(job); setDetailOpen(true) }}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-base sm:text-lg font-bold text-primary shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{job.company}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{job.role}</p>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                          <Badge className={cn(getStatusColor(job.status), "text-[10px] sm:text-xs h-5")}>{job.status}</Badge>
                          {job.source && <Badge variant="outline" className="text-[10px] sm:text-xs">{job.source}</Badge>}
                          {job.workMode && <Badge variant="outline" className={cn(getWorkModeColor(job.workMode), "text-[10px] sm:text-xs")}>{job.workMode}</Badge>}
                          <span className="text-[10px] sm:text-xs text-muted-foreground">{job.appliedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 flex-wrap sm:flex-nowrap" onClick={(e) => e.stopPropagation()}>
                      {job.jobUrl && (
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => window.open(job.jobUrl, "_blank")}>
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger><TooltipContent>Open</TooltipContent></Tooltip></TooltipProvider>
                      )}
                      {job.jobUrl && (
                        <TooltipProvider><Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleCopyLink(job.jobUrl)}>
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger><TooltipContent>Copy Link</TooltipContent></Tooltip></TooltipProvider>
                      )}
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDuplicate(job.id)}>
                          <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip></TooltipProvider>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleArchive(job.id)}>
                          <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>{job.archived ? "Unarchive" : "Archive"}</TooltipContent></Tooltip></TooltipProvider>
                      <select className="h-7 sm:h-8 rounded-md border border-border bg-secondary px-1 sm:px-2 text-[10px] sm:text-xs" value={job.status} onChange={(e) => handleUpdateStatus(job.id, e.target.value)}>
                        {statusFlow.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <TooltipProvider><Tooltip><TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => handleDelete(job.id)}>
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip></TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No applications found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {(() => {
            const grouped = new Map<string, Job[]>()
            for (const j of filteredJobs) {
              const existing = grouped.get(j.appliedDate) || []
              existing.push(j)
              grouped.set(j.appliedDate, existing)
            }
            const sorted = Array.from(grouped.entries()).sort(([a], [b]) => b.localeCompare(a))
            return sorted.map(([date, apps]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{getRelativeDayLabel(date)}</h3>
                  <span className="text-xs text-muted-foreground">({apps.length})</span>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-2 ml-11">
                  {apps.map((job) => (
                    <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      <Card className="glass-hover cursor-pointer" onClick={() => { setDetailJob(job); setDetailOpen(true) }}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {job.company.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{job.company}</p>
                              <p className="text-xs text-muted-foreground">{job.role}</p>
                              <div className="flex gap-1 mt-1">
                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                {job.source && <Badge variant="outline" className="text-xs">{job.source}</Badge>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          })()}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView jobs={filteredJobs} onSelectJob={(job) => { setDetailJob(job); setDetailOpen(true) }} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-hover sm:col-span-2 lg:col-span-2">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Weekly Applications</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
                  {weeklyApps.map(([week, count]) => {
                    const max = Math.max(...weeklyApps.map(([, c]) => c), 1)
                    return (
                      <div key={week} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{count}</span>
                        <div className="w-full rounded-t-md bg-primary/20" style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 0 }} />
                        <span className="text-[10px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">{week.slice(5)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="h-4 w-4" />Response Rate</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{responseRate}%</p>
                  <p className="text-xs text-muted-foreground">Overall Response</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Interview Conversion</span><span className="font-semibold text-purple-400">{interviewConversion}%</span></div>
                  <div className="flex justify-between text-sm"><span>Offer Conversion</span><span className="font-semibold text-green-400">{offerConversion}%</span></div>
                  <div className="flex justify-between text-sm"><span>Rejected</span><span className="font-semibold text-red-400">{jobs.length > 0 ? Math.round(counts.rejected / jobs.length * 100) : 0}%</span></div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Monthly Applications</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32">
                  {monthlyApps.map(([month, count]) => {
                    const max = Math.max(...monthlyApps.map(([, c]) => c), 1)
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full rounded-t-md bg-primary/20" style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? 4 : 0 }} />
                        <span className="text-[10px] text-muted-foreground">{month.slice(5)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Salary Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span>Avg Expected</span><span className="font-semibold">{formatCurrency(avgExpected)}</span></div>
                <div className="flex justify-between text-sm"><span>Avg Offered</span><span className="font-semibold text-green-400">{formatCurrency(avgOffered)}</span></div>
                {bestOffer && <div className="flex justify-between text-sm"><span>Best Offer</span><span className="font-semibold text-green-400">{bestOffer.company} - {formatCurrency(bestOffer.salaryOffered)}</span></div>}
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4" />By Source</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {sourceStats.map((s) => (
                  <div key={s.source} className="flex items-center justify-between">
                    <span className="text-sm">{s.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{s.total}</span>
                      <span className={cn("text-xs font-medium", s.rate > 50 ? "text-green-400" : "text-yellow-400")}>{s.rate}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4" />Activity</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span>Most Active Day</span><span className="font-semibold">{(() => {
                  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
                  for (const j of jobs) {
                    const day = new Date(j.appliedDate).getDay()
                    dayCounts[day]++
                  }
                  const max = Math.max(...dayCounts)
                  const idx = dayCounts.indexOf(max)
                  return idx >= 0 ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][idx] : "-"
                })()}</span></div>
                <div className="flex justify-between text-sm"><span>Most Active Week</span><span className="font-semibold">{weeklyApps.length > 0 ? weeklyApps.sort(([, a], [, b]) => b - a)[0]?.[0]?.slice(5) || "-" : "-"}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistTab wishlist={wishlist} jobs={jobs} onUpdate={setWishlist} />
        </TabsContent>

        <TabsContent value="salary">
          <div className="grid gap-4 grid-cols-1">
            <Card className="glass-hover">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Salary Calculator</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Current CTC</Label><Input type="number" placeholder="800000" /></div>
                <div><Label>Target CTC</Label><Input type="number" placeholder="2000000" /></div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Expected CTC (avg from applications)</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(avgExpected)}</p>
                </div>
                {bestOffer && (
                  <div className="p-4 rounded-lg bg-green-400/5 border border-green-400/20">
                    <p className="text-sm text-muted-foreground">Best Offer</p>
                    <p className="text-2xl font-bold text-green-400">{bestOffer.company} - {formatCurrency(bestOffer.salaryOffered)}</p>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
                  <p className="text-sm text-muted-foreground">Average Offered Salary</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(avgOffered)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab goals={goals} stats={stats} onUpdate={setGoals} />
        </TabsContent>
      </Tabs>

      <DetailDrawer
        job={detailJob}
        open={detailOpen}
        onOpenChange={(open) => { setDetailOpen(open); if (!open) setTimeout(() => setDetailJob(null), 300) }}
        onUpdate={(updated) => setJobs(jobs.map((j) => j.id === updated.id ? { ...j, ...updated } : j))}
        onStatusChange={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </div>
  )
}

function CalendarView({ jobs, onSelectJob }: { jobs: Job[]; onSelectJob: (job: Job) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  const appsByDate = useMemo(() => {
    const map = new Map<string, Job[]>()
    for (const j of jobs) {
      const existing = map.get(j.appliedDate) || []
      existing.push(j)
      map.set(j.appliedDate, existing)
    }
    return map
  }, [jobs])

  const selectedApps = selectedDate ? appsByDate.get(selectedDate) || [] : []

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else setCurrentMonth(currentMonth - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else setCurrentMonth(currentMonth + 1) }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="glass-hover lg:col-span-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="font-semibold">{MONTHS[currentMonth]} {currentYear}</span>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map((d) => <div key={d} className="text-xs text-muted-foreground py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const apps = appsByDate.get(dateStr) || []
              const isToday = dateStr === new Date().toISOString().split("T")[0]
              const isSelected = dateStr === selectedDate
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm transition-all hover:bg-accent min-h-[32px] sm:min-h-[40px]",
                    isToday && "border border-primary",
                    isSelected && "bg-primary/20 border border-primary",
                    apps.length > 0 && "font-medium"
                  )}
                >
                  <span>{day}</span>
                  {apps.length > 0 && (
                    <span className={cn("text-[8px] sm:text-[10px] leading-none mt-0.5", isSelected ? "text-primary" : "text-primary")}>
                      {apps.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-hover">
        <CardHeader><CardTitle className="text-sm">
          {selectedDate ? formatDate(selectedDate) : "Select a date"}
        </CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {selectedApps.length === 0 && selectedDate && (
            <p className="text-sm text-muted-foreground">No applications on this date</p>
          )}
          {selectedApps.map((job) => (
            <div key={job.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer" onClick={() => onSelectJob(job)}>
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{job.company}</p>
                <p className="text-xs text-muted-foreground truncate">{job.role}</p>
                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function WishlistTab({ wishlist, jobs, onUpdate }: { wishlist: WishlistItem[]; jobs: Job[]; onUpdate: (w: WishlistItem[]) => void }) {
  const [open, setOpen] = useState(false)
  const [newItem, setNewItem] = useState({ company: "", role: "", priority: "medium" as WishlistItem["priority"], notes: "", applicationDeadline: "", jobLink: "" })

  const handleAdd = async () => {
    if (!newItem.company) return
    const item: WishlistItem = {
      id: generateId(), company: newItem.company, role: newItem.role,
      priority: newItem.priority, notes: newItem.notes,
      applicationDeadline: newItem.applicationDeadline, applied: false, jobLink: newItem.jobLink
    }
    onUpdate([...wishlist, item])
    setOpen(false)
    setNewItem({ company: "", role: "", priority: "medium", notes: "", applicationDeadline: "", jobLink: "" })
    await addWishlist(item)
  }

  const handleDelete = async (id: string) => {
    onUpdate(wishlist.filter((w) => w.id !== id))
    await deleteWishlist(id)
  }

  const handleToggleApplied = async (id: string) => {
    const item = wishlist.find((w) => w.id === id)
    if (!item) return
    const updated = { ...item, applied: !item.applied }
    onUpdate(wishlist.map((w) => w.id === id ? updated : w))
    await updateWishlist(id, { applied: !item.applied } as Partial<WishlistItem>)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{wishlist.length} companies</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="sm"><Plus className="h-4 w-4" />Add Company</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>Add to Wishlist</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Company *</Label><Input value={newItem.company} onChange={(e) => setNewItem({ ...newItem, company: e.target.value })} /></div>
              <div><Label>Target Role</Label><Input value={newItem.role} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })} /></div>
              <div><Label>Priority</Label><Select value={newItem.priority} onValueChange={(v: WishlistItem["priority"]) => setNewItem({ ...newItem, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="dream">Dream Company</SelectItem></SelectContent></Select></div>
              <div><Label>Application Deadline</Label><Input type="date" value={newItem.applicationDeadline} onChange={(e) => setNewItem({ ...newItem, applicationDeadline: e.target.value })} /></div>
              <div><Label>Job Link</Label><Input value={newItem.jobLink} onChange={(e) => setNewItem({ ...newItem, jobLink: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={newItem.notes} onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add to Wishlist</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => {
          const applied = jobs.some((j) => j.company.toLowerCase() === item.company.toLowerCase())
          return (
            <Card key={item.id} className={cn("glass-hover", item.priority === "dream" && "animated-border")}>
              <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {item.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{item.company}</p>
                        {item.role && <p className="text-xs text-muted-foreground truncate">{item.role}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge className={cn(getPriorityColor(item.priority), "text-[10px] sm:text-xs")}>{item.priority}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="ghost" size="sm" className={cn("h-7 text-xs gap-1", item.applied || applied ? "text-green-400" : "")} onClick={() => handleToggleApplied(item.id)}>
                    <CheckCircle2 className="h-3 w-3" />{item.applied || applied ? "Applied" : "Mark Applied"}
                  </Button>
                  {item.jobLink && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(item.jobLink, "_blank")}>
                      <ExternalLink className="h-3 w-3" />Open
                    </Button>
                  )}
                </div>
                {item.notes && <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>}
                {item.applicationDeadline && (
                  <p className="text-xs text-muted-foreground mt-1">Deadline: {formatDate(item.applicationDeadline)}</p>
                )}
              </CardContent>
            </Card>
          )
        })}
        {wishlist.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No wishlist companies yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalsTab({ goals, stats, onUpdate }: { goals: JobGoalType[]; stats: { today: number; week: number; month: number; total: number }; onUpdate: (g: JobGoalType[]) => void }) {
  const [open, setOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ type: "daily" as JobGoalType["type"], target: 10 })

  const handleAdd = async () => {
    const goal: JobGoalType = { id: generateId(), type: newGoal.type, target: newGoal.target, current: 0 }
    onUpdate([...goals, goal])
    setOpen(false)
    setNewGoal({ type: "daily", target: 10 })
    await addJobGoal(goal)
  }

  const handleDelete = async (id: string) => {
    onUpdate(goals.filter((g) => g.id !== id))
    await deleteJobGoal(id)
  }

  const getCurrent = (type: string) => {
    switch (type) {
      case "daily": return stats.today
      case "weekly": return stats.week
      case "monthly": return stats.month
      default: return 0
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case "daily": return "Daily Goal"
      case "weekly": return "Weekly Goal"
      case "monthly": return "Monthly Goal"
      default: return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Set application targets</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="sm"><Plus className="h-4 w-4" />Set Goal</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Type</Label><Select value={newGoal.type} onValueChange={(v: JobGoalType["type"]) => setNewGoal({ ...newGoal, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
              <div><Label>Target</Label><Input type="number" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })} /></div>
              <Button onClick={handleAdd} className="w-full">Set Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {(["daily", "weekly", "monthly"] as const).map((type) => {
          const goal = goals.find((g) => g.type === type)
          const current = getCurrent(type)
          const target = goal?.target || 0
          const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0
          return (
            <Card key={type} className="glass-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{getLabel(type)}</p>
                  {goal && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {goal ? (
                  <>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold">{current}</span>
                      <span className="text-muted-foreground">/ {target}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% completed</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No goal set. <button className="text-primary underline" onClick={() => { setNewGoal({ type, target: 10 }); setOpen(true) }}>Set one</button></p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function DetailDrawer({
  job, open, onOpenChange, onUpdate, onStatusChange, onDelete
}: {
  job: Job | null; open: boolean; onOpenChange: (open: boolean) => void
  onUpdate: (job: Job) => void; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void
}) {
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [learningOpen, setLearningOpen] = useState(false)
  const [editNotes, setEditNotes] = useState("")
  const [editInterviewNotes, setEditInterviewNotes] = useState("")

  const [newInterview, setNewInterview] = useState({
    date: "", time: "", type: "", mode: "online" as Interview["mode"],
    meetingLink: "", roundNumber: 1, interviewerName: "", reminder: false, notes: ""
  })
  const [newFollowUp, setNewFollowUp] = useState({ date: "", notes: "" })
  const [newLearning, setNewLearning] = useState({
    questionsAsked: "", mistakes: "", topicsToRevise: "", difficulty: "medium" as InterviewLearning["difficulty"], confidenceRating: 5
  })

  useEffect(() => {
    if (job) { setEditNotes(job.notes || ""); setEditInterviewNotes(job.interviewNotes || "") }
  }, [job])

  if (!job) return null

  const handleSaveNotes = async () => {
    await updateJob(job.id, { notes: editNotes, interviewNotes: editInterviewNotes } as Partial<Job>)
    onUpdate({ ...job, notes: editNotes, interviewNotes: editInterviewNotes })
  }

  const handleAddInterview = async () => {
    if (!newInterview.date) return
    const iv: Interview = { id: generateId(), ...newInterview }
    setInterviewOpen(false)
    setNewInterview({ date: "", time: "", type: "", mode: "online", meetingLink: "", roundNumber: 1, interviewerName: "", reminder: false, notes: "" })
    await addInterview(job.id, iv)
    onUpdate({ ...job, interviews: [...(job.interviews || []), iv] })
  }

  const handleDeleteInterview = async (ivId: string) => {
    await deleteInterview(job.id, ivId)
    onUpdate({ ...job, interviews: (job.interviews || []).filter((iv) => iv.id !== ivId) })
  }

  const handleAddFollowUp = async () => {
    if (!newFollowUp.date) return
    const fu: FollowUp = { id: generateId(), date: newFollowUp.date, notes: newFollowUp.notes, completed: false }
    setFollowUpOpen(false)
    setNewFollowUp({ date: "", notes: "" })
    await addFollowUp(job.id, fu)
    onUpdate({ ...job, followUps: [...(job.followUps || []), fu] })
  }

  const handleToggleFollowUp = async (fuId: string) => {
    const fu = (job.followUps || []).find((f) => f.id === fuId)
    if (!fu) return
    await updateFollowUp(job.id, fuId, { completed: !fu.completed } as Partial<FollowUp>)
    onUpdate({ ...job, followUps: (job.followUps || []).map((f) => f.id === fuId ? { ...f, completed: !f.completed } : f) })
  }

  const handleAddLearning = async () => {
    const learning: InterviewLearning = {
      id: generateId(), jobId: job.id, date: new Date().toISOString().split("T")[0],
      ...newLearning
    }
    setLearningOpen(false)
    setNewLearning({ questionsAsked: "", mistakes: "", topicsToRevise: "", difficulty: "medium", confidenceRating: 5 })
    await addInterviewLearning(learning)
  }

  const statusHistory: StatusHistoryEntry[] = job.statusHistory || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto sm:mx-auto mx-0">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <DialogTitle className="text-xl">{job.company}</DialogTitle>
              <p className="text-sm text-muted-foreground">{job.role || "No role specified"}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                {job.source && <Badge variant="outline" className="text-xs">{job.source}</Badge>}
                {job.workMode && <Badge variant="outline" className={getWorkModeColor(job.workMode)}>{job.workMode}</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Applied</p><p className="text-sm font-medium">{formatDate(job.appliedDate)}</p></div>
            {job.location && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</p></div>}
            {job.expectedSalary > 0 && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Expected</p><p className="text-sm font-medium">{formatCurrency(job.expectedSalary)}</p></div>}
            {job.salaryOffered > 0 && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Offered</p><p className="text-sm font-medium text-green-400">{formatCurrency(job.salaryOffered)}</p></div>}
            {job.recruiterName && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Recruiter</p><p className="text-sm font-medium">{job.recruiterName}</p></div>}
            {job.recruiterEmail && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Recruiter Email</p><p className="text-sm font-medium truncate">{job.recruiterEmail}</p></div>}
          </div>

          {(job.jobUrl || job.recruiterLinkedIn || job.portfolioUrl || job.githubUrl || job.linkedInUrl) && (
            <div className="flex flex-wrap gap-2">
              {job.jobUrl && <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(job.jobUrl, "_blank")}><ExternalLink className="h-3 w-3" />Job Posting</Button>}
              {job.recruiterLinkedIn && <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(job.recruiterLinkedIn, "_blank")}><User className="h-3 w-3" />Recruiter LinkedIn</Button>}
              {job.portfolioUrl && <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(job.portfolioUrl, "_blank")}><Link className="h-3 w-3" />Portfolio</Button>}
              {job.githubUrl && <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(job.githubUrl, "_blank")}><GitBranch className="h-3 w-3" />GitHub</Button>}
              {job.linkedInUrl && <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(job.linkedInUrl, "_blank")}><Linkedin className="h-3 w-3" />LinkedIn</Button>}
            </div>
          )}

          {(job.resumeVersion || job.coverLetter) && (
            <div className="grid grid-cols-2 gap-3">
              {job.resumeVersion && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Resume Version</p><p className="text-sm font-medium">{job.resumeVersion}</p></div>}
              {job.coverLetter && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-xs text-muted-foreground">Cover Letter</p><p className="text-sm font-medium">{job.coverLetter}</p></div>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} onBlur={handleSaveNotes} rows={3} />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Status Timeline</h4>
              <div className="flex items-center gap-2">
                <select className="h-8 rounded-md border border-border bg-secondary px-2 text-xs" value={job.status} onChange={(e) => onStatusChange(job.id, e.target.value)}>
                  {statusFlow.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="relative space-y-0">
              {statusHistory.length === 0 && <p className="text-sm text-muted-foreground">No history yet</p>}
              {statusHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={cn("h-3 w-3 rounded-full border-2 mt-1", idx === statusHistory.length - 1 ? "bg-primary border-primary" : "bg-secondary border-border")} />
                    {idx < statusHistory.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{entry.status}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.date)}{entry.notes ? ` - ${entry.notes}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><Phone className="h-4 w-4" />Interviews</h4>
              <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Add</Button></DialogTrigger>
                <DialogContent className="glass border-border/50">
                  <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Date *</Label><Input type="date" value={newInterview.date} onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })} /></div>
                      <div><Label>Time</Label><Input type="time" value={newInterview.time} onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Type</Label><Input value={newInterview.type} onChange={(e) => setNewInterview({ ...newInterview, type: e.target.value })} placeholder="Technical" /></div>
                      <div><Label>Mode</Label><Select value={newInterview.mode} onValueChange={(v: Interview["mode"]) => setNewInterview({ ...newInterview, mode: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent></Select></div>
                    </div>
                    <div><Label>Meeting Link</Label><Input value={newInterview.meetingLink} onChange={(e) => setNewInterview({ ...newInterview, meetingLink: e.target.value })} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Round Number</Label><Input type="number" value={newInterview.roundNumber} onChange={(e) => setNewInterview({ ...newInterview, roundNumber: Number(e.target.value) })} /></div>
                      <div><Label>Interviewer</Label><Input value={newInterview.interviewerName} onChange={(e) => setNewInterview({ ...newInterview, interviewerName: e.target.value })} /></div>
                    </div>
                    <div className="flex items-center gap-2"><Switch checked={newInterview.reminder} onCheckedChange={(v) => setNewInterview({ ...newInterview, reminder: v })} /><Label>Set Reminder</Label></div>
                    <div><Label>Notes</Label><Textarea value={newInterview.notes} onChange={(e) => setNewInterview({ ...newInterview, notes: e.target.value })} /></div>
                    <Button onClick={handleAddInterview} className="w-full">Schedule Interview</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {(job.interviews || []).length === 0 && <p className="text-sm text-muted-foreground">No interviews scheduled</p>}
              {(job.interviews || []).map((iv) => (
                <Card key={iv.id} className="bg-secondary/30">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">Round {iv.roundNumber}{iv.type ? ` - ${iv.type}` : ""}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(iv.date)}{iv.time ? ` at ${iv.time}` : ""} {iv.mode === "online" ? "(Online)" : "(Offline)"}</p>
                        {iv.interviewerName && <p className="text-xs text-muted-foreground">with {iv.interviewerName}</p>}
                        {iv.meetingLink && <a href={iv.meetingLink} target="_blank" className="text-xs text-primary underline">Join link</a>}
                        {iv.notes && <p className="text-xs text-muted-foreground mt-1">{iv.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteInterview(iv.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" />Follow-ups</h4>
              <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Add</Button></DialogTrigger>
                <DialogContent className="glass border-border/50">
                  <DialogHeader><DialogTitle>Add Follow-up Reminder</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Date *</Label><Input type="date" value={newFollowUp.date} onChange={(e) => setNewFollowUp({ ...newFollowUp, date: e.target.value })} /></div>
                    <div><Label>Notes</Label><Textarea value={newFollowUp.notes} onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })} placeholder="Follow up about status" /></div>
                    <Button onClick={handleAddFollowUp} className="w-full">Add Reminder</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {(job.followUps || []).length === 0 && <p className="text-sm text-muted-foreground">No follow-ups planned</p>}
              {(job.followUps || []).map((fu) => (
                <div key={fu.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                  <Switch checked={fu.completed} onCheckedChange={() => handleToggleFollowUp(fu.id)} />
                  <div className="flex-1">
                    <p className={cn("text-sm", fu.completed && "line-through text-muted-foreground")}>{formatDate(fu.date)}</p>
                    {fu.notes && <p className="text-xs text-muted-foreground">{fu.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" />Interview Learnings</h4>
              <Dialog open={learningOpen} onOpenChange={setLearningOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Add</Button></DialogTrigger>
                <DialogContent className="glass border-border/50">
                  <DialogHeader><DialogTitle>Save Interview Learnings</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Questions Asked</Label><Textarea value={newLearning.questionsAsked} onChange={(e) => setNewLearning({ ...newLearning, questionsAsked: e.target.value })} /></div>
                    <div><Label>Mistakes</Label><Textarea value={newLearning.mistakes} onChange={(e) => setNewLearning({ ...newLearning, mistakes: e.target.value })} /></div>
                    <div><Label>Topics to Revise</Label><Textarea value={newLearning.topicsToRevise} onChange={(e) => setNewLearning({ ...newLearning, topicsToRevise: e.target.value })} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label>Difficulty</Label><Select value={newLearning.difficulty} onValueChange={(v: InterviewLearning["difficulty"]) => setNewLearning({ ...newLearning, difficulty: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                      <div><Label>Confidence (1-10)</Label><Input type="number" min={1} max={10} value={newLearning.confidenceRating} onChange={(e) => setNewLearning({ ...newLearning, confidenceRating: Number(e.target.value) })} /></div>
                    </div>
                    <Button onClick={handleAddLearning} className="w-full">Save Learning</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interview Notes</Label>
            <Textarea value={editInterviewNotes} onChange={(e) => setEditInterviewNotes(e.target.value)} onBlur={handleSaveNotes} rows={3} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button variant="destructive" size="sm" className="gap-1 text-xs sm:text-sm" onClick={() => onDelete(job.id)}>
              <Trash2 className="h-3 w-3" />Delete
            </Button>
            {job.jobUrl && (
              <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm" onClick={() => handleCopyLink(job.jobUrl)}>
                <Copy className="h-3 w-3" />Copy Link
              </Button>
            )}
            {job.jobUrl && (
              <Button variant="outline" size="sm" className="gap-1 text-xs sm:text-sm" onClick={() => window.open(job.jobUrl, "_blank")}>
                <ExternalLink className="h-3 w-3" />Open
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function handleCopyLink(url: string) {
  if (url) navigator.clipboard.writeText(url)
}
