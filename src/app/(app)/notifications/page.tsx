"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, BellOff, Check, Clock, Dumbbell, Code2, Github, Moon, Briefcase, Plus, Trash2, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  { id: "1", title: "Morning Reminder", message: "Start your day with a plan. Review today's goals.", type: "reminder", time: "06:00 AM", read: false },
  { id: "2", title: "Workout Reminder", message: "Time for gym! Don't skip today.", type: "reminder", time: "06:30 AM", read: false },
  { id: "3", title: "LeetCode Reminder", message: "Solve at least 2 problems today to maintain your streak.", type: "reminder", time: "10:00 AM", read: true },
  { id: "4", title: "GitHub Reminder", message: "Make your daily contribution. Keep the green squares alive!", type: "reminder", time: "06:00 PM", read: true },
  { id: "5", title: "Sleep Reminder", message: "Wind down. Sleep before 12 AM for better recovery.", type: "reminder", time: "11:00 PM", read: true },
  { id: "6", title: "Interview Reminder", message: "Microsoft OA scheduled for tomorrow at 2 PM.", type: "info", time: "08:00 PM", read: false },
]

const reminderDefaults = [
  { id: "morning", label: "Morning Reminder", icon: Clock, time: "06:00", enabled: true },
  { id: "workout", label: "Workout Reminder", icon: Dumbbell, time: "06:30", enabled: true },
  { id: "leetcode", label: "LeetCode Reminder", icon: Code2, time: "10:00", enabled: true },
  { id: "github", label: "GitHub Reminder", icon: Github, time: "18:00", enabled: true },
  { id: "sleep", label: "Sleep Reminder", icon: Moon, time: "23:00", enabled: true },
  { id: "interview", label: "Interview Reminder", icon: Briefcase, time: "14:00", enabled: false },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [reminders, setReminders] = useState(reminderDefaults)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const toggleReminder = (id: string) => {
    setReminders(reminders.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground text-sm">Manage your reminders and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{unreadCount} unread</Badge>
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${n.read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-secondary" : "bg-primary/20"}`}>
                    <Bell className={`h-4 w-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${n.read ? "" : "text-foreground"}`}>{n.title}</p>
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => markAsRead(n.id)}><Check className="h-3 w-3" /></Button>}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNotification(n.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />Reminder Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <r.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.time}</p>
                  </div>
                </div>
                <Switch checked={r.enabled} onCheckedChange={() => toggleReminder(r.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
