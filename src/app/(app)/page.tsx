"use client"
import { motion } from "framer-motion"
import {
  Dumbbell, Building2, Code2, Github, FolderKanban, Atom, Server,
  Network, BookOpen, PenLine, Droplets, Moon, CheckCircle2, Clock,
  TrendingUp, Flame, Target, Zap, ArrowUpRight, Braces
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useDailyStore } from "@/stores/daily-store"
import Link from "next/link"

const taskIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  gym: Dumbbell,
  office: Building2,
  leetcode: Code2,
  github: Github,
  project: FolderKanban,
  javascript: Braces,
  react: Atom,
  nodejs: Server,
  "system-design": Network,
  reading: BookOpen,
  journal: PenLine,
  water: Droplets,
  sleep: Moon,
}

const taskColors: Record<string, string> = {
  gym: "text-green-400",
  office: "text-blue-400",
  leetcode: "text-yellow-400",
  github: "text-purple-400",
  project: "text-cyan-400",
  javascript: "text-yellow-300",
  react: "text-cyan-300",
  nodejs: "text-green-300",
  "system-design": "text-indigo-400",
  reading: "text-orange-400",
  journal: "text-pink-400",
  water: "text-blue-300",
  sleep: "text-indigo-300",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { tasks, toggleTask, getCompletionPercentage } = useDailyStore()
  const completionPct = getCompletionPercentage()
  const completedCount = tasks.filter((t) => t.completed).length
  const totalTime = tasks.reduce((sum, t) => sum + t.timeSpent, 0)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold">Today&apos;s Progress</h2>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Badge variant="success" className="text-sm gap-1 px-3 py-1">
          <Flame className="h-3 w-3" />
          {completionPct}% Complete
        </Badge>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                  <p className="text-2xl font-bold">{completedCount}/{tasks.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{Math.floor(totalTime / 60)}h {totalTime % 60}m</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">LeetCode Streak</p>
                  <p className="text-2xl font-bold">12 Days</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">Lv. 8</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daily Progress</CardTitle>
            <span className="text-sm text-muted-foreground">{completionPct}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPct} className="h-2" />
        </CardContent>
      </Card>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const Icon = taskIcons[task.id] || CheckCircle2
          const color = taskColors[task.id] || "text-zinc-400"
          return (
            <motion.div key={task.id} variants={item}>
              <Card
                className={`glass-hover cursor-pointer transition-all duration-200 ${
                  task.completed ? "border-green-400/30 bg-green-400/5" : ""
                }`}
                onClick={() => toggleTask(task.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        task.completed ? "bg-green-400/10" : "bg-secondary"
                      }`}>
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Icon className={`h-5 w-5 ${color}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.timeSpent > 0 ? `${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m` : "Not started"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={task.completed ? "success" : "secondary"} className="text-xs">
                      {task.completed ? "Done" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/goals">
          <Card className="glass-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Active Goals</p>
                <p className="text-xl font-bold">4</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/leetcode">
          <Card className="glass-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Problems Solved</p>
                <p className="text-xl font-bold">156</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/habits">
          <Card className="glass-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-400/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Habit Streak</p>
                <p className="text-xl font-bold">23 Days</p>
              </div>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
