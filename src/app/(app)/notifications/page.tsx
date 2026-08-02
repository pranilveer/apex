"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle, Bell, BellOff, BellRing, Briefcase, Check, CheckCircle2, Clock,
  Code2, Dumbbell, Github, Moon, Plus, Settings, Target, Trash2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn, formatDate, generateId } from "@/lib/utils"
import type { Notification, ReminderSetting } from "@/types"
import {
  fetchNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
  fetchReminderSettings,
  saveReminderSettings,
  syncNotifications,
} from "@/actions"

const NOTIFICATION_TYPES = ["info", "success", "warning", "reminder", "goal", "interview"] as const
type NotificationType = (typeof NOTIFICATION_TYPES)[number]

interface TypeMeta {
  label: string
  icon: LucideIcon
  badge: "info" | "success" | "warning" | "secondary"
  iconBg: string
  iconColor: string
}

const TYPE_META: Record<NotificationType, TypeMeta> = {
  info: { label: "Info", icon: Bell, badge: "info", iconBg: "bg-blue-400/10", iconColor: "text-blue-400" },
  success: { label: "Success", icon: CheckCircle2, badge: "success", iconBg: "bg-green-400/10", iconColor: "text-green-400" },
  warning: { label: "Warning", icon: AlertTriangle, badge: "warning", iconBg: "bg-yellow-400/10", iconColor: "text-yellow-400" },
  reminder: { label: "Reminder", icon: Clock, badge: "secondary", iconBg: "bg-orange-400/10", iconColor: "text-orange-400" },
  goal: { label: "Goal", icon: Target, badge: "secondary", iconBg: "bg-purple-400/10", iconColor: "text-purple-400" },
  interview: { label: "Interview", icon: Briefcase, badge: "secondary", iconBg: "bg-cyan-400/10", iconColor: "text-cyan-400" },
}

const REMINDER_DEFAULTS: (ReminderSetting & { icon: LucideIcon })[] = [
  { id: "morning", label: "Morning Reminder", icon: Clock, time: "06:00", enabled: true },
  { id: "workout", label: "Workout Reminder", icon: Dumbbell, time: "06:30", enabled: true },
  { id: "leetcode", label: "LeetCode Reminder", icon: Code2, time: "10:00", enabled: true },
  { id: "github", label: "GitHub Reminder", icon: Github, time: "18:00", enabled: true },
  { id: "sleep", label: "Sleep Reminder", icon: Moon, time: "23:00", enabled: true },
  { id: "interview", label: "Interview Reminder", icon: Briefcase, time: "14:00", enabled: false },
]

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
] as const
type FilterKey = (typeof FILTERS)[number]["key"]

function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [reminders, setReminders] = useState<(ReminderSetting & { icon: LucideIcon })[]>(REMINDER_DEFAULTS)
  const [remindersLoaded, setRemindersLoaded] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [newNotification, setNewNotification] = useState({ title: "", message: "", type: "info" })

  const unreadCount = notifications.filter((n) => !n.read).length
  const todayCount = notifications.filter((n) => {
    const d = new Date(n.time)
    return !Number.isNaN(d.getTime()) && d.toDateString() === new Date().toDateString()
  }).length

  useEffect(() => {
    let cancelled = false
    syncNotifications(Intl.DateTimeFormat().resolvedOptions().timeZone)
      .then(() => fetchNotifications())
      .then((items) => { if (!cancelled) setNotifications(items) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    fetchReminderSettings()
      .then((doc) => {
        if (doc?.settings?.length) {
          setReminders(REMINDER_DEFAULTS.map((d) => {
            const match = doc.settings.find((s) => s.id === d.id)
            return match ? { ...d, ...match } : d
          }))
        }
      })
      .catch(() => {})
      .finally(() => setRemindersLoaded(true))
  }, [])

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await markNotificationRead(id)
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await markAllNotificationsRead()
  }

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await deleteNotification(id)
  }

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      window.setTimeout(() => setConfirmClear(false), 2500)
      return
    }
    setNotifications([])
    void deleteAllNotifications()
    setConfirmClear(false)
  }

  const handleAdd = async () => {
    if (!newNotification.title.trim()) return
    const notif: Notification = {
      id: generateId(),
      title: newNotification.title.trim(),
      message: newNotification.message.trim(),
      type: newNotification.type,
      time: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [notif, ...prev])
    setNewNotification({ title: "", message: "", type: "info" })
    setAddOpen(false)
    await addNotification({ title: notif.title, message: notif.message, type: notif.type })
  }

  const persistReminders = (next: (ReminderSetting & { icon: LucideIcon })[]) => {
    setReminders(next)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1500)
    void saveReminderSettings(
      next.map(({ id, label, time, enabled }) => ({ id, label, time, enabled })),
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  }

  const toggleReminder = (id: string) => {
    persistReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const changeReminderTime = (id: string, time: string) => {
    persistReminders(reminders.map((r) => (r.id === id ? { ...r, time } : r)))
  }

  const visibleNotifications = [...notifications]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .filter((n) => (filter === "all" ? true : filter === "unread" ? !n.read : n.read))

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground text-sm">Manage your reminders and notifications</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Badge variant="info" className="flex-1 sm:flex-none justify-center">{unreadCount} unread</Badge>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <Button
            variant={confirmClear ? "destructive" : "outline"}
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmClear ? "Confirm?" : "Clear all"}
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-1 sm:flex-none gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50 p-4 sm:p-6 max-h-[85dvh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={newNotification.title} onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })} placeholder="e.g. Follow-up call tomorrow" />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={newNotification.message} onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} placeholder="Details..." />
                </div>
                <div>
                  <Label>Type</Label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm" value={newNotification.type} onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}>
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t} value={t}>{TYPE_META[t].label}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAdd} className="w-full">Create Notification</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-4 grid-cols-3">
        <Card className="p-3 sm:p-4"><CardContent className="text-center"><p className="text-xl sm:text-3xl font-bold text-primary">{notifications.length}</p><p className="text-[11px] sm:text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="p-3 sm:p-4"><CardContent className="text-center"><p className="text-xl sm:text-3xl font-bold text-blue-400">{unreadCount}</p><p className="text-[11px] sm:text-xs text-muted-foreground">Unread</p></CardContent></Card>
        <Card className="p-3 sm:p-4"><CardContent className="text-center"><p className="text-xl sm:text-3xl font-bold text-green-400">{todayCount}</p><p className="text-[11px] sm:text-xs text-muted-foreground">Today</p></CardContent></Card>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 items-start">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                Recent Notifications
              </CardTitle>
              <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer", filter === f.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-y-auto pr-1 -mr-1 space-y-2">
            {loading ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <BellOff className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {filter === "all" ? "No notifications yet" : filter === "unread" ? "No unread notifications" : "No read notifications"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {filter === "all" ? "Create your first notification to get started." : "Nothing here right now."}
                  </p>
                </div>
                {filter === "all" && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setAddOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Notification
                  </Button>
                )}
              </div>
            ) : (
              visibleNotifications.map((n, i) => {
                const meta = (TYPE_META as Record<string, TypeMeta>)[n.type] ?? TYPE_META.info
                const Icon = meta.icon
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <div className={cn("flex items-start gap-3 p-3 rounded-lg border transition-all", n.read ? "border-border bg-background" : "border-primary/30 bg-primary/5")}>
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", n.read ? "bg-secondary" : meta.iconBg)}>
                        <Icon className={cn("h-4 w-4", n.read ? "text-muted-foreground" : meta.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-medium truncate", n.read && "text-muted-foreground")}>{n.title}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0">{formatRelativeTime(n.time)}</span>
                        </div>
                        {n.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>}
                        <div className="mt-1.5">
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(n.id)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Reminder Settings
              {savedFlash && <Badge variant="success">Saved</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!remindersLoaded ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              reminders.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", r.enabled ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.label}</p>
                        <Input
                          type="time"
                          value={r.time}
                          onChange={(e) => changeReminderTime(r.id, e.target.value)}
                          className="mt-1 h-8 w-28 px-2 text-xs"
                          disabled={!r.enabled}
                        />
                      </div>
                    </div>
                    <Switch checked={r.enabled} onCheckedChange={() => toggleReminder(r.id)} />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
