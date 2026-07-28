"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Code2, Plus, Flame, CheckCircle2, AlertTriangle, Brain, ExternalLink, Trash2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getDifficultyColor } from "@/lib/utils"

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
}

const initialProblems: Problem[] = []

const topicStats: { topic: string; solved: number; total: number }[] = []

export default function LeetcodePage() {
  const [problems, setProblems] = useState<Problem[]>(initialProblems)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [newProblem, setNewProblem] = useState({ name: "", difficulty: "Easy" as "Easy" | "Medium" | "Hard", topic: "", pattern: "", timeTaken: 0, needsRevision: false, companyTags: "", notes: "" })

  const easy = problems.filter((p) => p.difficulty === "Easy").length
  const medium = problems.filter((p) => p.difficulty === "Medium").length
  const hard = problems.filter((p) => p.difficulty === "Hard").length
  const revision = problems.filter((p) => p.needsRevision).length

  const filtered = problems.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = () => {
    if (!newProblem.name) return
    setProblems([...problems, {
      id: Date.now().toString(),
      name: newProblem.name,
      difficulty: newProblem.difficulty,
      topic: newProblem.topic,
      pattern: newProblem.pattern,
      solvedDate: new Date().toISOString().split("T")[0],
      timeTaken: newProblem.timeTaken,
      needsRevision: newProblem.needsRevision,
      companyTags: newProblem.companyTags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: newProblem.notes,
    }])
    setOpen(false)
    setNewProblem({ name: "", difficulty: "Easy", topic: "", pattern: "", timeTaken: 0, needsRevision: false, companyTags: "", notes: "" })
  }

  const toggleRevision = (id: string) => {
    setProblems(problems.map((p) => p.id === id ? { ...p, needsRevision: !p.needsRevision } : p))
  }

  const deleteProblem = (id: string) => setProblems(problems.filter((p) => p.id !== id))

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
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-400">{revision}</p><p className="text-xs text-muted-foreground">Need Revision</p></CardContent></Card>
      </div>

      <Tabs defaultValue="problems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="revision">Revision List</TabsTrigger>
          <TabsTrigger value="topics">Weak Topics</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

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
                      <div className="flex items-center gap-2">
                        {p.companyTags.map((tag) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRevision(p.id)}>
                          <Brain className={`h-4 w-4 ${p.needsRevision ? "text-orange-400" : "text-muted-foreground"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProblem(p.id)}>
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
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.topic} · {p.difficulty}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleRevision(p.id)}>Mark Reviewed</Button>
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
    </div>
  )
}
