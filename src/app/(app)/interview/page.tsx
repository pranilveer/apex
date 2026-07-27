"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Plus, ExternalLink, Bookmark, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TopicData {
  id: string
  label: string
  icon: string
  color: string
  progress: number
  notes: string
  resources: string[]
  bookmarks: string[]
}

const initialTopics: TopicData[] = [
  { id: "dsa", label: "DSA", icon: "💻", color: "purple", progress: 65, notes: "Arrays, Linked Lists, Trees done. Focus on Graphs and DP.", resources: ["LeetCode Blind 75", "NeetCode Roadmap"], bookmarks: ["https://neetcode.io"] },
  { id: "javascript", label: "JavaScript", icon: "⚡", color: "yellow", progress: 75, notes: "Closures, Prototypes, Event Loop covered. Need to review Promise internals.", resources: ["javascript.info", "You Don't Know JS"], bookmarks: [] },
  { id: "react", label: "React", icon: "⚛️", color: "cyan", progress: 80, notes: "Hooks, Context, Performance optimization. Practice custom hooks.", resources: ["React docs", "Kent C. Dodds Blog"], bookmarks: ["https://kentcdodds.com"] },
  { id: "node", label: "Node.js", icon: "🟢", color: "green", progress: 55, notes: "Express basics done. Need to learn event-driven architecture.", resources: ["Node.js docs", "Designing Node.js"], bookmarks: [] },
  { id: "system-design", label: "System Design", icon: "🏗️", color: "blue", progress: 30, notes: "Read Alex Xu Vol 1. Practice URL shortener and Chat system.", resources: ["Alex Xu Vol 1 & 2", "System Design Interview"], bookmarks: ["https://github.com/donnemartin/system-design-primer"] },
  { id: "os", label: "Operating System", icon: "🖥️", color: "orange", progress: 40, notes: "Process vs Thread, Scheduling, Memory management basics.", resources: ["Operating Systems: Three Easy Pieces"], bookmarks: [] },
  { id: "dbms", label: "DBMS", icon: "🗄️", color: "pink", progress: 50, notes: "Normalization, Indexing, Transactions done. Practice SQL queries.", resources: ["SQLBolt", "Stanford DB Course"], bookmarks: [] },
  { id: "cn", label: "Computer Networks", icon: "🌐", color: "indigo", progress: 35, notes: "OSI model, TCP/IP, HTTP basics. Need to study DNS, load balancing.", resources: ["Computer Networking: Kurose & Ross"], bookmarks: [] },
  { id: "oop", label: "OOP", icon: "📦", color: "teal", progress: 70, notes: "SOLID principles, Design Patterns basics. Practice with code.", resources: ["Head First Design Patterns"], bookmarks: [] },
  { id: "hr", label: "HR Questions", icon: "👥", color: "rose", progress: 45, notes: "Why company, Strengths/Weaknesses, Salary negotiation.", resources: ["Glassdoor HR questions"], bookmarks: [] },
  { id: "behavioral", label: "Behavioral", icon: "💬", color: "lime", progress: 40, notes: "STAR method. Prepare 8-10 stories for leadership, conflict, teamwork.", resources: ["STAR Method Guide", "Amazon Leadership Principles"], bookmarks: [] },
]

const colorMap: Record<string, string> = {
  purple: "border-purple-400/30 bg-purple-400/5",
  yellow: "border-yellow-400/30 bg-yellow-400/5",
  cyan: "border-cyan-400/30 bg-cyan-400/5",
  green: "border-green-400/30 bg-green-400/5",
  blue: "border-blue-400/30 bg-blue-400/5",
  orange: "border-orange-400/30 bg-orange-400/5",
  pink: "border-pink-400/30 bg-pink-400/5",
  indigo: "border-indigo-400/30 bg-indigo-400/5",
  teal: "border-teal-400/30 bg-teal-400/5",
  rose: "border-rose-400/30 bg-rose-400/5",
  lime: "border-lime-400/30 bg-lime-400/5",
}

export default function InterviewPage() {
  const [topics, setTopics] = useState<TopicData[]>(initialTopics)
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null)
  const [open, setOpen] = useState(false)
  const [newResource, setNewResource] = useState({ title: "", url: "" })

  const avgProgress = Math.round(topics.reduce((sum, t) => sum + t.progress, 0) / topics.length)

  const updateNotes = (id: string, notes: string) => {
    setTopics(topics.map((t) => t.id === id ? { ...t, notes } : t))
    if (selectedTopic?.id === id) setSelectedTopic({ ...selectedTopic, notes })
  }

  const addResource = (id: string, title: string, url: string) => {
    setTopics(topics.map((t) => t.id === id ? { ...t, resources: [...t.resources, title], bookmarks: [...t.bookmarks, url] } : t))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Preparation</h2>
          <p className="text-muted-foreground text-sm">Master all topics for your dream company</p>
        </div>
        <Badge variant="info" className="text-sm px-3 py-1">Overall: {avgProgress}%</Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{avgProgress}%</span>
          </div>
          <Progress value={avgProgress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, i) => (
          <motion.div key={topic.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className={`glass-hover cursor-pointer border ${colorMap[topic.color]} transition-all`} onClick={() => setSelectedTopic(topic)}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <h3 className="font-semibold">{topic.label}</h3>
                  </div>
                  <span className="text-lg font-bold">{topic.progress}%</span>
                </div>
                <Progress value={topic.progress} className="h-2 mb-3" />
                <p className="text-xs text-muted-foreground line-clamp-2">{topic.notes}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{topic.resources.length} resources</Badge>
                  {topic.bookmarks.length > 0 && <Badge variant="outline" className="text-xs">{topic.bookmarks.length} bookmarks</Badge>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="glass border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedTopic.icon}</span>
                {selectedTopic.label}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="notes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="resources">Resources ({selectedTopic.resources.length})</TabsTrigger>
                <TabsTrigger value="bookmarks">Bookmarks ({selectedTopic.bookmarks.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="notes" className="space-y-4">
                <div>
                  <Label>Your Notes</Label>
                  <Textarea
                    value={selectedTopic.notes}
                    onChange={(e) => updateNotes(selectedTopic.id, e.target.value)}
                    className="mt-2 min-h-[200px]"
                    placeholder="Write your notes here..."
                  />
                </div>
                <div>
                  <Label>Progress</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Progress value={selectedTopic.progress} className="h-3 flex-1" />
                    <span className="text-sm font-medium w-12 text-right">{selectedTopic.progress}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={selectedTopic.progress}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setTopics(topics.map((t) => t.id === selectedTopic.id ? { ...t, progress: val } : t))
                      setSelectedTopic({ ...selectedTopic, progress: val })
                    }}
                    className="w-full mt-2 accent-primary" />
                </div>
              </TabsContent>
              <TabsContent value="resources" className="space-y-2">
                {selectedTopic.resources.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1">{r}</span>
                    {selectedTopic.bookmarks[i] && (
                      <a href={selectedTopic.bookmarks[i]} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><ExternalLink className="h-3 w-3" /></Button>
                      </a>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <Input placeholder="Resource title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} />
                  <Input placeholder="URL (optional)" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} />
                  <Button onClick={() => { addResource(selectedTopic.id, newResource.title, newResource.url); setNewResource({ title: "", url: "" }) }}>Add</Button>
                </div>
              </TabsContent>
              <TabsContent value="bookmarks" className="space-y-2">
                {selectedTopic.bookmarks.filter(Boolean).map((b, i) => (
                  <a key={i} href={b} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent transition-colors">
                    <Bookmark className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm flex-1 truncate">{b}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ))}
                {selectedTopic.bookmarks.filter(Boolean).length === 0 && <p className="text-center text-muted-foreground py-4">No bookmarks yet</p>}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
