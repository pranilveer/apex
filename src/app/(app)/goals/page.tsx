"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, Plus, Calendar, TrendingUp, ArrowUpRight, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getDaysLeft, calculatePercentage, generateId } from "@/lib/utils"
import { fetchGoals, addGoal, updateGoal, deleteGoal } from "@/actions"

interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  targetValue: number
  currentValue: number
  unit: string
  category: string
  priority: string
}

const initialGoals: Goal[] = []

const priorityColors: Record<string, string> = {
  high: "text-red-400 bg-red-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  low: "text-green-400 bg-green-400/10",
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [open, setOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: "", description: "", targetDate: "", targetValue: 0, unit: "", category: "career", priority: "medium" })

  useEffect(() => {
    fetchGoals().then(setGoals)
  }, [])

  const handleAdd = async () => {
    if (!newGoal.title) return
    const id = generateId()
    const goal = { ...newGoal, id, currentValue: 0 }
    setGoals([...goals, goal])
    setNewGoal({ title: "", description: "", targetDate: "", targetValue: 0, unit: "", category: "career", priority: "medium" })
    setOpen(false)
    await addGoal(goal)
  }

  const handleDelete = async (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
    await deleteGoal(id)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground text-sm">Track your long-term objectives</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle>New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Crack Google" /></div>
              <div><Label>Description</Label><Textarea value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} placeholder="Describe your goal..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Target Date</Label><Input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} /></div>
                <div><Label>Target Value</Label><Input type="number" value={newGoal.targetValue || ""} onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })} placeholder="500" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Unit</Label><Input value={newGoal.unit} onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })} placeholder="problems, books..." /></div>
                <div><Label>Priority</Label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" value={newGoal.priority} onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{goals.length}</p><p className="text-xs text-muted-foreground">Active Goals</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-400">{goals.filter((g) => g.currentValue >= g.targetValue).length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-400">{goals.filter((g) => g.targetDate && getDaysLeft(g.targetDate) > 0).length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
      </div>

      <div className="space-y-4">
        {goals.map((goal, i) => {
          const pct = calculatePercentage(goal.currentValue, goal.targetValue)
          const daysLeft = goal.targetDate ? getDaysLeft(goal.targetDate) : null
          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge className={priorityColors[goal.priority]}>{goal.priority}</Badge>
                          {daysLeft !== null && (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="h-3 w-3" />
                              {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
