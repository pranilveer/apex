"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { FolderKanban, Plus, ExternalLink, Github, Trash2, GripVertical, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectTask {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
}

interface Project {
  id: string
  name: string
  description: string
  status: string
  techStack: string[]
  repoUrl: string
  liveUrl: string
  features: string[]
  tasks: ProjectTask[]
}

const initialProjects: Project[] = [
  {
    id: "1", name: "Daily Tracker", description: "Full-stack productivity app for interview prep", status: "in-progress",
    techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "TailwindCSS"], repoUrl: "https://github.com/user/daily-tracker", liveUrl: "",
    features: ["Dashboard", "LeetCode Tracker", "GitHub Tracker", "Habit Tracker"],
    tasks: [
      { id: "t1", title: "Setup database schema", status: "done" },
      { id: "t2", title: "Build dashboard UI", status: "done" },
      { id: "t3", title: "Implement auth", status: "in-progress" },
      { id: "t4", title: "Add analytics charts", status: "todo" },
    ],
  },
  {
    id: "2", name: "Portfolio Site", description: "Personal portfolio with blog and projects showcase", status: "in-progress",
    techStack: ["React", "Vite", "TailwindCSS", "Framer Motion"], repoUrl: "https://github.com/user/portfolio", liveUrl: "https://portfolio.dev",
    features: ["Hero Section", "Projects Showcase", "Blog", "Contact Form"],
    tasks: [
      { id: "t5", title: "Design hero section", status: "done" },
      { id: "t6", title: "Build blog with MDX", status: "in-progress" },
    ],
  },
  {
    id: "3", name: "Algo Practice", description: "DSA solutions repository with explanations", status: "completed",
    techStack: ["Python", "Java"], repoUrl: "https://github.com/user/algo-practice", liveUrl: "",
    features: ["50+ DSA solutions", "Pattern-based approach", "Company tags"],
    tasks: [],
  },
]

const statusColors: Record<string, string> = {
  "planning": "text-blue-400 bg-blue-400/10",
  "in-progress": "text-yellow-400 bg-yellow-400/10",
  "completed": "text-green-400 bg-green-400/10",
  "on-hold": "text-orange-400 bg-orange-400/10",
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [open, setOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: "", description: "", techStack: "", repoUrl: "", liveUrl: "" })
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const handleAdd = () => {
    if (!newProject.name) return
    setProjects([...projects, {
      id: Date.now().toString(), name: newProject.name, description: newProject.description,
      status: "planning", techStack: newProject.techStack.split(",").map((t) => t.trim()).filter(Boolean),
      repoUrl: newProject.repoUrl, liveUrl: newProject.liveUrl, features: [], tasks: [],
    }])
    setOpen(false)
    setNewProject({ name: "", description: "", techStack: "", repoUrl: "", liveUrl: "" })
  }

  const moveTask = (projectId: string, taskId: string, newStatus: ProjectTask["status"]) => {
    setProjects(projects.map((p) => p.id === projectId ? {
      ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Project Tracker</h2>
          <p className="text-muted-foreground text-sm">Manage your personal projects</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />New Project</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Project Name</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} /></div>
              <div><Label>Tech Stack (comma separated)</Label><Input value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} placeholder="React, Node.js, PostgreSQL" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Repo URL</Label><Input value={newProject.repoUrl} onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })} /></div>
                <div><Label>Live URL</Label><Input value={newProject.liveUrl} onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Create Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

<div className="space-y-4 md:space-y-6">
        {projects.map((project, i) => {
          const todoTasks = project.tasks.filter((t) => t.status === "todo")
          const inProgressTasks = project.tasks.filter((t) => t.status === "in-progress")
          const doneTasks = project.tasks.filter((t) => t.status === "done")
          const totalTasks = project.tasks.length
          const progressPct = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0

          return (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-hover">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderKanban className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-base md:text-lg font-semibold truncate">{project.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="h-8 w-8"><Github className="h-4 w-4" /></Button></a>}
                          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button></a>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge className={statusColors[project.status] || ""}>{project.status}</Badge>
                        {project.techStack.map((tech) => <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>)}
                      </div>
                    </div>
                  </div>

                  {totalTasks > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{doneTasks.length}/{totalTasks} tasks ({progressPct}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  )}

                  {totalTasks > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                      {[
                        { label: "To Do", tasks: todoTasks, color: "border-blue-400/30" },
                        { label: "In Progress", tasks: inProgressTasks, color: "border-yellow-400/30" },
                        { label: "Done", tasks: doneTasks, color: "border-green-400/30" },
                      ].map((col) => (
                        <div key={col.label} className={`rounded-lg border ${col.color} p-3 space-y-2`}>
                          <p className="text-xs font-medium text-muted-foreground mb-2">{col.label} ({col.tasks.length})</p>
                          {col.tasks.map((task) => (
                            <div key={task.id} className="rounded-md bg-secondary/50 p-2 text-sm cursor-move">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
