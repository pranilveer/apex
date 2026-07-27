"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Github, Plus, GitCommit, Calendar, TrendingUp, Trash2, ExternalLink, Star, GitFork } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface CommitEntry {
  id: string
  date: string
  repository: string
  commitCount: number
  featureBuilt: string
  hoursSpent: number
}

const initialCommits: CommitEntry[] = [
  { id: "1", date: "2026-07-27", repository: "daily-tracker", commitCount: 5, featureBuilt: "Dashboard UI", hoursSpent: 3 },
  { id: "2", date: "2026-07-26", repository: "daily-tracker", commitCount: 8, featureBuilt: "LeetCode Tracker", hoursSpent: 4 },
  { id: "3", date: "2026-07-25", repository: "portfolio-site", commitCount: 3, featureBuilt: "Blog Section", hoursSpent: 2 },
  { id: "4", date: "2026-07-24", repository: "daily-tracker", commitCount: 12, featureBuilt: "Auth System", hoursSpent: 5 },
  { id: "5", date: "2026-07-23", repository: "algo-practice", commitCount: 6, featureBuilt: "DP Solutions", hoursSpent: 3 },
  { id: "6", date: "2026-07-22", repository: "portfolio-site", commitCount: 4, featureBuilt: "Responsive Design", hoursSpent: 2 },
  { id: "7", date: "2026-07-21", repository: "daily-tracker", commitCount: 9, featureBuilt: "Database Schema", hoursSpent: 4 },
]

const generateHeatmapData = () => {
  const data = []
  for (let i = 0; i < 84; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 15),
    })
  }
  return data
}

export default function GitHubPage() {
  const [commits, setCommits] = useState<CommitEntry[]>(initialCommits)
  const [open, setOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({ repository: "", commitCount: 0, featureBuilt: "", hoursSpent: 0 })
  const heatmapData = generateHeatmapData()

  const totalCommits = commits.reduce((sum, c) => sum + c.commitCount, 0)
  const totalHours = commits.reduce((sum, c) => sum + c.hoursSpent, 0)
  const uniqueRepos = new Set(commits.map((c) => c.repository)).size

  const thisWeek = commits.filter((c) => {
    const d = new Date(c.date)
    const now = new Date()
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7
  })
  const weekCommits = thisWeek.reduce((sum, c) => sum + c.commitCount, 0)

  const handleAdd = () => {
    if (!newEntry.repository) return
    setCommits([{ id: Date.now().toString(), date: new Date().toISOString().split("T")[0], ...newEntry }, ...commits])
    setOpen(false)
    setNewEntry({ repository: "", commitCount: 0, featureBuilt: "", hoursSpent: 0 })
  }

  const handleDelete = (id: string) => setCommits(commits.filter((c) => c.id !== id))

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-secondary"
    if (count < 3) return "bg-green-400/20"
    if (count < 6) return "bg-green-400/40"
    if (count < 10) return "bg-green-400/60"
    return "bg-green-400/80"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GitHub Tracker</h2>
          <p className="text-muted-foreground text-sm">Track your contribution activity</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Log Activity</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>Log GitHub Activity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Repository</Label><Input value={newEntry.repository} onChange={(e) => setNewEntry({ ...newEntry, repository: e.target.value })} placeholder="my-project" /></div>
              <div><Label>Commit Count</Label><Input type="number" value={newEntry.commitCount || ""} onChange={(e) => setNewEntry({ ...newEntry, commitCount: Number(e.target.value) })} /></div>
              <div><Label>Feature Built</Label><Input value={newEntry.featureBuilt} onChange={(e) => setNewEntry({ ...newEntry, featureBuilt: e.target.value })} placeholder="Authentication system" /></div>
              <div><Label>Hours Spent</Label><Input type="number" value={newEntry.hoursSpent || ""} onChange={(e) => setNewEntry({ ...newEntry, hoursSpent: Number(e.target.value) })} /></div>
              <Button onClick={handleAdd} className="w-full">Log Activity</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-hover"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-400/10 flex items-center justify-center"><GitCommit className="h-5 w-5 text-purple-400" /></div><div><p className="text-2xl font-bold">{totalCommits}</p><p className="text-xs text-muted-foreground">Total Commits</p></div></div></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-green-400/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-green-400" /></div><div><p className="text-2xl font-bold">{weekCommits}</p><p className="text-xs text-muted-foreground">This Week</p></div></div></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center"><Github className="h-5 w-5 text-blue-400" /></div><div><p className="text-2xl font-bold">{uniqueRepos}</p><p className="text-xs text-muted-foreground">Repositories</p></div></div></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-yellow-400" /></div><div><p className="text-2xl font-bold">{totalHours}h</p><p className="text-xs text-muted-foreground">Total Hours</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Contribution Graph</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-1">
            {heatmapData.map((d) => (
              <div key={d.date} className={`h-3 w-full rounded-sm ${getHeatColor(d.count)} heatmap-cell`} title={`${d.date}: ${d.count} commits`} />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 3, 6, 10].map((n) => <div key={n} className={`h-3 w-3 rounded-sm ${getHeatColor(n)}`} />)}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {commits.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <GitCommit className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{c.featureBuilt || "Commits"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Github className="h-3 w-3" /><span>{c.repository}</span><span>·</span><span>{c.date}</span><span>·</span><span>{c.hoursSpent}h</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{c.commitCount} commits</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
