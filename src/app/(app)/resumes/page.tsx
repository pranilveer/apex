"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Plus, Upload, Eye, Trash2, Copy, CheckCircle2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStatusColor } from "@/lib/utils"

interface Resume {
  id: string
  name: string
  version: string
  isDefault: boolean
  coverLetter: string
  createdAt: string
}

interface ApplicationRecord {
  id: string
  company: string
  resumeUsed: string
  result: string
  date: string
  notes: string
}

const initialResumes: Resume[] = [
  { id: "1", name: "Full Stack Developer", version: "v3.2", isDefault: true, coverLetter: "Experienced full-stack developer with expertise in React, Node.js, and cloud technologies...", createdAt: "2026-07-20" },
  { id: "2", name: "Frontend Specialist", version: "v2.1", isDefault: false, coverLetter: "Passionate frontend developer focused on creating exceptional user experiences...", createdAt: "2026-07-15" },
  { id: "3", name: "SDE General", version: "v1.0", isDefault: false, coverLetter: "", createdAt: "2026-07-01" },
]

const initialApplications: ApplicationRecord[] = [
  { id: "1", company: "Google", resumeUsed: "Full Stack Developer v3.2", result: "applied", date: "2026-07-20", notes: "Applied for SDE-2 role" },
  { id: "2", company: "Microsoft", resumeUsed: "Full Stack Developer v3.2", result: "oa", date: "2026-07-15", notes: "OA received" },
  { id: "3", company: "Razorpay", resumeUsed: "Frontend Specialist v2.1", result: "offer", date: "2026-06-15", notes: "Got the offer!" },
]

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications)
  const [open, setOpen] = useState(false)
  const [newResume, setNewResume] = useState({ name: "", version: "", coverLetter: "" })

  const handleAdd = () => {
    if (!newResume.name) return
    setResumes([...resumes, { id: Date.now().toString(), ...newResume, isDefault: false, createdAt: new Date().toISOString().split("T")[0] }])
    setOpen(false)
    setNewResume({ name: "", version: "", coverLetter: "" })
  }

  const setDefault = (id: string) => {
    setResumes(resumes.map((r) => ({ ...r, isDefault: r.id === id })))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Resume Tracker</h2>
          <p className="text-muted-foreground text-sm">Manage your resumes and track where they&apos;re used</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />New Resume</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>New Resume</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={newResume.name} onChange={(e) => setNewResume({ ...newResume, name: e.target.value })} placeholder="Full Stack Developer" /></div>
              <div><Label>Version</Label><Input value={newResume.version} onChange={(e) => setNewResume({ ...newResume, version: e.target.value })} placeholder="v1.0" /></div>
              <div><Label>Cover Letter</Label><Textarea value={newResume.coverLetter} onChange={(e) => setNewResume({ ...newResume, coverLetter: e.target.value })} className="min-h-[150px]" placeholder="Write your cover letter..." /></div>
              <Button onClick={handleAdd} className="w-full">Create Resume</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{resumes.length}</p><p className="text-xs text-muted-foreground">Total Resumes</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-400">{applications.filter((a) => a.result === "offer").length}</p><p className="text-xs text-muted-foreground">Offers</p></CardContent></Card>
        <Card className="glass-hover"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-400">{applications.length}</p><p className="text-xs text-muted-foreground">Applications</p></CardContent></Card>
      </div>

      <Tabs defaultValue="resumes" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="resumes" className="flex-1 text-xs sm:text-sm">Resumes ({resumes.length})</TabsTrigger>
          <TabsTrigger value="applications" className="flex-1 text-xs sm:text-sm">Applied ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-3">
          {resumes.map((resume, i) => (
            <motion.div key={resume.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`glass-hover ${resume.isDefault ? "border-primary/30" : ""}`}>
                <CardContent className="p-4 md:p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-semibold truncate">{resume.name}</h3>
                        <Badge variant="outline">{resume.version}</Badge>
                        {resume.isDefault && <Badge variant="success">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Created: {resume.createdAt}</p>
                      {resume.coverLetter && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{resume.coverLetter}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-[52px]">
                    {!resume.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => setDefault(resume.id)} className="text-xs">Set Default</Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="applications" className="space-y-3">
          {applications.map((app, i) => (
            <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{app.company.slice(0, 2)}</div>
                    <div className="min-w-0">
                      <p className="font-medium">{app.company}</p>
                      <p className="text-xs text-muted-foreground truncate">Resume: {app.resumeUsed}</p>
                      <p className="text-xs text-muted-foreground">{app.date} · {app.notes}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(app.result)} shrink-0`}>{app.result}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
