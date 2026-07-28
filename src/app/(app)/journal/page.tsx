"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { PenLine, Sun, Moon as MoonIcon, Trophy, AlertTriangle, Calendar, Smile, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const moodOptions = [
  { value: "great", emoji: "🔥", label: "Great", color: "text-green-400" },
  { value: "good", emoji: "😊", label: "Good", color: "text-blue-400" },
  { value: "okay", emoji: "😐", label: "Okay", color: "text-yellow-400" },
  { value: "bad", emoji: "😔", label: "Bad", color: "text-orange-400" },
  { value: "terrible", emoji: "💀", label: "Terrible", color: "text-red-400" },
]

interface JournalEntry {
  date: string
  morningGoals: string
  eveningReflection: string
  wins: string
  mistakes: string
  tomorrowPlan: string
  mood: string
  energy: number
}

const initialEntries: Record<string, JournalEntry> = {}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(initialEntries)
  const [editing, setEditing] = useState(false)

  const entry = entries[selectedDate] || {
    date: selectedDate, morningGoals: "", eveningReflection: "", wins: "", mistakes: "", tomorrowPlan: "", mood: "", energy: 5,
  }

  const updateField = (field: keyof JournalEntry, value: string | number) => {
    const updated = { ...entry, [field]: value }
    setEntries({ ...entries, [selectedDate]: updated })
  }

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    setSelectedDate(d.toISOString().split("T")[0])
    setEditing(false)
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Daily Journal</h2>
          <p className="text-muted-foreground text-sm">Reflect and plan your days</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">{new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
            {isToday && <Badge variant="info">Today</Badge>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)}><ChevronRight className="h-5 w-5" /></Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sun className="h-4 w-4 text-yellow-400" />Morning Goals</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={entry.morningGoals} onChange={(e) => updateField("morningGoals", e.target.value)}
                placeholder="What do you want to accomplish today?" className="min-h-[150px] bg-transparent border-transparent focus:border-border focus:bg-secondary/50" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MoonIcon className="h-4 w-4 text-indigo-400" />Evening Reflection</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={entry.eveningReflection} onChange={(e) => updateField("eveningReflection", e.target.value)}
                placeholder="How did your day go? Reflect on what happened..." className="min-h-[150px] bg-transparent border-transparent focus:border-border focus:bg-secondary/50" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-green-400" />Today&apos;s Wins</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={entry.wins} onChange={(e) => updateField("wins", e.target.value)}
                placeholder="What went well today? Celebrate your wins!" className="min-h-[120px] bg-transparent border-transparent focus:border-border focus:bg-secondary/50" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-orange-400" />Today&apos;s Mistakes</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={entry.mistakes} onChange={(e) => updateField("mistakes", e.target.value)}
                placeholder="What could have gone better? Learn from mistakes." className="min-h-[120px] bg-transparent border-transparent focus:border-border focus:bg-secondary/50" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-primary" />Tomorrow&apos;s Plan</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={entry.tomorrowPlan} onChange={(e) => updateField("tomorrowPlan", e.target.value)}
            placeholder="Plan your tomorrow. What will you focus on?" className="min-h-[120px] bg-transparent border-transparent focus:border-border focus:bg-secondary/50" />
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Smile className="h-4 w-4 text-primary" />Mood</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {moodOptions.map((m) => (
                <button key={m.value}
                  onClick={() => updateField("mood", m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    entry.mood === m.value ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-muted-foreground"
                  }`}>
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`text-xs ${m.color}`}>{m.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="h-4 w-4 text-yellow-400" />Energy Level</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <button key={level}
                  onClick={() => updateField("energy", level)}
                  className={`h-10 w-10 rounded-lg font-medium text-sm transition-all ${
                    entry.energy === level
                      ? level <= 3 ? "bg-red-400/20 text-red-400 border border-red-400/50"
                        : level <= 6 ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50"
                        : "bg-green-400/20 text-green-400 border border-green-400/50"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}>
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {entry.energy <= 3 ? "Low energy - rest and recover" : entry.energy <= 6 ? "Moderate energy" : "High energy - make the most of it!"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
