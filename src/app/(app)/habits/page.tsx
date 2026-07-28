"use client"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Flame, Dumbbell, Droplets, Moon, BookOpen, Code2, Github, FolderKanban, Building2, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { fetchHabits, saveHabitEntry } from "@/actions"

const habits = [
  { id: "gym", label: "Gym", icon: Dumbbell, color: "text-green-400", bgColor: "bg-green-400/10" },
  { id: "protein", label: "Protein", icon: Dumbbell, color: "text-pink-400", bgColor: "bg-pink-400/10" },
  { id: "meditation", label: "Meditation", icon: Brain, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  { id: "reading", label: "Reading", icon: BookOpen, color: "text-orange-400", bgColor: "bg-orange-400/10" },
  { id: "water", label: "Water", icon: Droplets, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  { id: "sleep", label: "Sleep before 12", icon: Moon, color: "text-indigo-400", bgColor: "bg-indigo-400/10" },
  { id: "leetcode", label: "LeetCode", icon: Code2, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  { id: "github", label: "GitHub", icon: Github, color: "text-purple-300", bgColor: "bg-purple-300/10" },
  { id: "project", label: "Project", icon: FolderKanban, color: "text-cyan-400", bgColor: "bg-cyan-400/10" },
  { id: "office", label: "Office", icon: Building2, color: "text-blue-300", bgColor: "bg-blue-300/10" },
]

const generateMonthData = () => {
  const data: Record<string, Record<string, boolean>> = {}
  return data
}

export default function HabitsPage() {
  const [habitData, setHabitData] = useState<Record<string, Record<string, boolean>>>({})
  const today = new Date().toISOString().split("T")[0]
  const todayData = habitData[today] || {}

  useEffect(() => {
    fetchHabits().then((data) => {
      const map: Record<string, Record<string, boolean>> = {}
      data.forEach((e) => { map[e.date] = e.habits })
      setHabitData(map)
    })
  }, [])

  const toggleHabit = async (habitId: string) => {
    const next = !habitData[today]?.[habitId]
    const newData = { ...habitData, [today]: { ...(habitData[today] || {}), [habitId]: next } }
    setHabitData(newData)
    await saveHabitEntry(today, newData[today])
  }

  const todayCompleted = habits.filter((h) => todayData[h.id]).length
  const todayPct = Math.round((todayCompleted / habits.length) * 100)

  const getStreak = (habitId: string) => {
    let streak = 0
    const todayDate = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      if (habitData[key]?.[habitId]) streak++
      else break
    }
    return streak
  }

  const overallStreak = useMemo(() => {
    let streak = 0
    const todayDate = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      const allDone = habits.every((h) => habitData[key]?.[h.id])
      if (allDone) streak++
      else break
    }
    return streak
  }, [habitData])

  const getHeatColor = (completed: number, total: number) => {
    const pct = completed / total
    if (pct === 0) return "bg-secondary"
    if (pct < 0.3) return "bg-green-400/20"
    if (pct < 0.6) return "bg-green-400/40"
    if (pct < 0.8) return "bg-green-400/60"
    return "bg-green-400/80"
  }

  const getMonthGrid = () => {
    const grid = []
    const todayDate = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      const dayData = habitData[key] || {}
      const completed = habits.filter((h) => dayData[h.id]).length
      grid.push({ date: key, day: d.getDate(), completed, total: habits.length })
    }
    return grid
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Habit Tracker</h2>
        <p className="text-muted-foreground text-sm">Build consistency, one day at a time</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{todayPct}%</p><p className="text-xs text-muted-foreground">Today</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-400">{todayCompleted}/{habits.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1"><Flame className="h-6 w-6" />{overallStreak}</p><p className="text-xs text-muted-foreground">Day Streak</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-400">{Math.round(Object.values(habitData).filter((d) => habits.every((h) => d[h.id])).length / 30 * 100)}%</p><p className="text-xs text-muted-foreground">Monthly Rate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Today&apos;s Habits</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {habits.map((habit, i) => {
              const done = !!todayData[habit.id]
              const streak = getStreak(habit.id)
              const Icon = habit.icon
              return (
                <motion.div key={habit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <div
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                      done ? "border-green-400/30 bg-green-400/5" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${habit.bgColor}`}>
                        <Icon className={`h-5 w-5 ${habit.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{habit.label}</p>
                        <p className="text-xs text-muted-foreground">Streak: {streak} days</p>
                      </div>
                    </div>
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Heatmap</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {getMonthGrid().map((d) => (
              <div key={d.date} className={cn("h-8 w-full rounded-md flex items-center justify-center text-[10px] text-muted-foreground heatmap-cell cursor-default", getHeatColor(d.completed, d.total))} title={`${d.date}: ${d.completed}/${d.total}`}>
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
            <span>Less</span>
            {[0, 3, 6, 10].map((n) => <div key={n} className={cn("h-3 w-3 rounded-sm", getHeatColor(n, 10))} />)}
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Habit Streaks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {habits.map((h) => {
              const streak = getStreak(h.id)
              const maxStreak = 30
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="text-sm w-24 sm:w-28 shrink-0 truncate">{h.label}</span>
                  <Progress value={(streak / maxStreak) * 100} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-16 text-right">{streak} days</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
