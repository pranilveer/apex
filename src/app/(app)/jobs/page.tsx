"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, Plus, ExternalLink, Phone, Mail, Trash2, CheckCircle2, XCircle, Clock, FileText, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { getStatusColor } from "@/lib/utils"

interface Job {
  id: string
  company: string
  role: string
  status: string
  appliedDate: string
  referralStatus: string
  salaryOffered: number
  expectedSalary: number
  notes: string
}

const initialJobs: Job[] = [
  { id: "1", company: "Google", role: "SDE-2", status: "applied", appliedDate: "2026-07-20", referralStatus: "Pending from contact", salaryOffered: 0, expectedSalary: 2500000, notes: "Applied through referral" },
  { id: "2", company: "Microsoft", role: "SDE-II", status: "oa", appliedDate: "2026-07-15", referralStatus: "Referral confirmed", salaryOffered: 0, expectedSalary: 2200000, notes: "OA scheduled for next week" },
  { id: "3", company: "Amazon", role: "SDE-1", status: "interview", appliedDate: "2026-07-10", referralStatus: "Through careers page", salaryOffered: 0, expectedSalary: 2000000, notes: "Phone screen done" },
  { id: "4", company: "Atlassian", role: "SSE", status: "applied", appliedDate: "2026-07-22", referralStatus: "Cold email sent", salaryOffered: 0, expectedSalary: 2000000, notes: "" },
  { id: "5", company: "Flipkart", role: "SDE-2", status: "rejected", appliedDate: "2026-06-30", referralStatus: "", salaryOffered: 0, expectedSalary: 1800000, notes: "Rejected after system design round" },
  { id: "6", company: "Razorpay", role: "SDE-1", status: "offer", appliedDate: "2026-06-15", referralStatus: "LinkedIn", salaryOffered: 1800000, expectedSalary: 1500000, notes: "Received offer!" },
]

const statusFlow = ["applied", "oa", "interview", "hr", "offer", "rejected"]

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [open, setOpen] = useState(false)
  const [newJob, setNewJob] = useState({ company: "", role: "", notes: "", expectedSalary: 0 })

  const counts = {
    applied: jobs.filter((j) => j.status === "applied").length,
    oa: jobs.filter((j) => j.status === "oa").length,
    interview: jobs.filter((j) => j.status === "interview").length,
    hr: jobs.filter((j) => j.status === "hr").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
    offer: jobs.filter((j) => j.status === "offer").length,
  }

  const handleAdd = () => {
    if (!newJob.company) return
    setJobs([...jobs, {
      id: Date.now().toString(), company: newJob.company, role: newJob.role,
      status: "applied", appliedDate: new Date().toISOString().split("T")[0],
      referralStatus: "", salaryOffered: 0, expectedSalary: newJob.expectedSalary, notes: newJob.notes,
    }])
    setOpen(false)
    setNewJob({ company: "", role: "", notes: "", expectedSalary: 0 })
  }

  const updateStatus = (id: string, status: string) => {
    setJobs(jobs.map((j) => j.id === id ? { ...j, status } : j))
  }

  const handleDelete = (id: string) => setJobs(jobs.filter((j) => j.id !== id))

  const bestOffer = jobs.filter((j) => j.salaryOffered > 0).sort((a, b) => b.salaryOffered - a.salaryOffered)[0]
  const avgExpected = Math.round(jobs.reduce((sum, j) => sum + j.expectedSalary, 0) / jobs.length)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Job Switch Dashboard</h2>
          <p className="text-muted-foreground text-sm">Track your job applications and interview pipeline</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Application</Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>New Application</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Company</Label><Input value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} placeholder="Google" /></div>
              <div><Label>Role</Label><Input value={newJob.role} onChange={(e) => setNewJob({ ...newJob, role: e.target.value })} placeholder="SDE-2" /></div>
              <div><Label>Expected Salary (CTC)</Label><Input type="number" value={newJob.expectedSalary || ""} onChange={(e) => setNewJob({ ...newJob, expectedSalary: Number(e.target.value) })} placeholder="2000000" /></div>
              <div><Label>Notes</Label><Textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Applied", count: counts.applied, icon: FileText, color: "text-blue-400" },
          { label: "OA", count: counts.oa, icon: Clock, color: "text-yellow-400" },
          { label: "Interview", count: counts.interview, icon: Phone, color: "text-purple-400" },
          { label: "HR", count: counts.hr, icon: Mail, color: "text-cyan-400" },
          { label: "Rejected", count: counts.rejected, icon: XCircle, color: "text-red-400" },
          { label: "Offers", count: counts.offer, icon: CheckCircle2, color: "text-green-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-hover">
              <CardContent className="p-4 text-center">
                <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="salary">Salary Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-3">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          {job.referralStatus && <Badge variant="outline" className="text-xs">{job.referralStatus}</Badge>}
                          <span className="text-xs text-muted-foreground">{job.appliedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="h-8 rounded-md border border-border bg-secondary px-2 text-xs" value={job.status} onChange={(e) => updateStatus(job.id, e.target.value)}>
                        {statusFlow.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader><CardTitle className="text-base">Wishlist Companies</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {["Google", "Microsoft", "Amazon", "Atlassian", "Stripe", "Razorpay", "Flipkart", "Swiggy", "PhonePe"].map((c) => (
                  <div key={c} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.slice(0, 2)}</div>
                      <span className="text-sm font-medium">{c}</span>
                    </div>
                    {jobs.find((j) => j.company === c) ? (
                      <Badge variant="success" className="text-xs">Applied</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">To Apply</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Salary Calculator</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Current CTC</Label><Input type="number" placeholder="800000" /></div>
                <div><Label>Target CTC</Label><Input type="number" placeholder="2000000" /></div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Expected CTC (avg from applications)</p>
                  <p className="text-2xl font-bold text-primary">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(avgExpected)}</p>
                </div>
                {bestOffer && (
                  <div className="p-4 rounded-lg bg-green-400/5 border border-green-400/20">
                    <p className="text-sm text-muted-foreground">Best Offer</p>
                    <p className="text-2xl font-bold text-green-400">{bestOffer.company} - {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(bestOffer.salaryOffered)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
