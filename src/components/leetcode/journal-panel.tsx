"use client"
import { useEffect, useMemo, useState } from "react"
import { BookOpen, Loader2, Save, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { generateId, cn } from "@/lib/utils"
import { getTodayDateString } from "@/lib/revision"
import type { JournalMood, LeetCodeJournal } from "@/types"
import { fetchLeetCodeJournals, saveLeetCodeJournal } from "@/actions"

const MOODS: JournalMood[] = ["Great", "Good", "Okay", "Tired", "Stressed"]

type JournalDraft = Omit<LeetCodeJournal, "id" | "date">

const EMPTY_DRAFT: JournalDraft = {
  learned: "",
  mistakes: "",
  interviewLearnings: "",
  tomorrowPlan: "",
  mood: "Good",
  energy: 3,
}

const toDraft = (e: LeetCodeJournal): JournalDraft => ({
  learned: e.learned,
  mistakes: e.mistakes,
  interviewLearnings: e.interviewLearnings,
  tomorrowPlan: e.tomorrowPlan,
  mood: e.mood,
  energy: e.energy,
})

function fmtDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function JournalPanel() {
  const [entries, setEntries] = useState<LeetCodeJournal[]>([])
  const [selected, setSelected] = useState(getTodayDateString())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<JournalDraft>(EMPTY_DRAFT)

  useEffect(() => {
    fetchLeetCodeJournals().then((items) => {
      setEntries(items)
      const today = getTodayDateString()
      const current = items.find((e) => e.date === today)
      setDraft(current ? toDraft(current) : EMPTY_DRAFT)
      setLoading(false)
    })
  }, [])

  const current = useMemo(() => entries.find((e) => e.date === selected), [entries, selected])

  const selectEntry = (date: string) => {
    setSelected(date)
    const entry = entries.find((e) => e.date === date)
    setDraft(entry ? toDraft(entry) : EMPTY_DRAFT)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveLeetCodeJournal({ id: current?.id ?? generateId(), date: selected, ...draft })
      const items = await fetchLeetCodeJournals()
      setEntries(items)
    } finally {
      setSaving(false)
    }
  }

  const field = (key: keyof typeof draft, label: string, multiline?: boolean) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {multiline ? (
        <Textarea value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="min-h-[80px] text-sm" />
      ) : (
        <Input value={draft[key] as string} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="text-sm" />
      )}
    </div>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
              <p className="font-semibold">Daily DSA Journal</p>
            </div>
            <Input type="date" value={selected} onChange={(e) => selectEntry(e.target.value)} className="h-8 w-40 text-sm" />
          </div>

          <div className="space-y-3">
            {field("learned", "What I learned")}
            {field("mistakes", "Mistakes", true)}
            {field("interviewLearnings", "Interview learnings", true)}
            {field("tomorrowPlan", "Tomorrow&apos;s plan", true)}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Mood</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDraft({ ...draft, mood: m })}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        draft.mood === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Energy</Label>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setDraft({ ...draft, energy: n })} aria-label={`Energy ${n}`}>
                      <Star className={cn("h-5 w-5 transition-transform hover:scale-125", draft.energy >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Journal
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-hover">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <p className="font-semibold">Past Entries</p>
          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No journal entries yet.</p>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => selectEntry(e.date)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                    selected === e.date ? "border-primary/50 bg-primary/5" : "border-border/50"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{fmtDate(e.date)}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{e.mood}</span>
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={cn("h-3 w-3", e.energy >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
                        ))}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {e.learned || e.mistakes || e.tomorrowPlan || "No content"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
