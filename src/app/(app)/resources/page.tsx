"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bookmark, Plus, ExternalLink, Search, Youtube, BookOpen, FileText, Link2, Filter, Trash2, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RESOURCE_CATEGORIES } from "@/lib/constants"
import { generateId } from "@/lib/utils"
import { fetchResources, addResource, toggleBookmark, deleteResource } from "@/actions"

interface Resource {
  id: string
  title: string
  url: string
  type: string
  category: string[]
  notes: string
  bookmarked: boolean
}

const initialResources: Resource[] = []

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  article: FileText,
  course: BookOpen,
  book: BookOpen,
  link: Link2,
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [newResource, setNewResource] = useState({ title: "", url: "", type: "article", category: "", notes: "" })

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.notes.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !activeCategory || r.category.includes(activeCategory)
    return matchSearch && matchCategory
  })

  useEffect(() => {
    fetchResources().then(setResources)
  }, [])

  const handleAdd = async () => {
    if (!newResource.title) return
    const id = generateId()
    const resource: Resource = {
      id, title: newResource.title, url: newResource.url,
      type: newResource.type, category: newResource.category.split(",").map((c) => c.trim()).filter(Boolean),
      notes: newResource.notes, bookmarked: false,
    }
    setResources([...resources, resource])
    setOpen(false)
    setNewResource({ title: "", url: "", type: "article", category: "", notes: "" })
    await addResource(resource)
  }

  const handleToggleBookmark = async (id: string) => {
    const resource = resources.find((r) => r.id === id)
    if (!resource) return
    const next = !resource.bookmarked
    setResources(resources.map((r) => r.id === id ? { ...r, bookmarked: next } : r))
    await toggleBookmark(id, next)
  }

  const handleDelete = async (id: string) => {
    setResources(resources.filter((r) => r.id !== id))
    await deleteResource(id)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Resource Library</h2>
          <p className="text-muted-foreground text-sm">Your curated collection of learning resources</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Resource</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} /></div>
              <div><Label>URL</Label><Input value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Type</Label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" value={newResource.type} onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}>
                    <option value="article">Article</option><option value="video">Video</option><option value="course">Course</option><option value="book">Book</option><option value="link">Link</option>
                  </select>
                </div>
                <div><Label>Category</Label><Input value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })} placeholder="React, DSA" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={newResource.notes} onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add Resource</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={activeCategory === null ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(null)}>All</Button>
        {RESOURCE_CATEGORIES.map((cat) => (
          <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}>{cat}</Button>
        ))}
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {filtered.map((r, i) => {
          const Icon = typeIcons[r.type] || Link2
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{r.title}</h3>
                          {r.url && (
                            <a href={r.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>
                        <div className="flex gap-1.5 mt-2">
                          <Badge variant="outline" className="text-xs">{r.type}</Badge>
                          {r.category.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleBookmark(r.id)}>
                        <Star className={`h-4 w-4 ${r.bookmarked ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
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
