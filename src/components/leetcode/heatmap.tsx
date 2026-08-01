"use client"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RevisionMode } from "@/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const MODES: { value: RevisionMode; label: string }[] = [
  { value: "solved", label: "Solved" },
  { value: "revision", label: "Revision" },
  { value: "combined", label: "Combined" },
]

function heatColor(count: number): string {
  if (count >= 5) return "bg-green-500"
  if (count >= 3) return "bg-green-600"
  if (count >= 2) return "bg-green-800"
  if (count >= 1) return "bg-green-900/70"
  return "bg-secondary/50"
}

const dateKey = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

export function Heatmap({
  mode,
  onModeChange,
  solvedByDate,
  revisionByDate,
  month,
  onMonthChange,
  todayStr,
}: {
  mode: RevisionMode
  onModeChange: (m: RevisionMode) => void
  solvedByDate: Map<string, number>
  revisionByDate: Map<string, number>
  month: Date
  onMonthChange: (d: Date) => void
  todayStr: string
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const countFor = (y: number, m: number, d: number) => {
    const k = dateKey(y, m, d)
    if (mode === "solved") return solvedByDate.get(k) || 0
    if (mode === "revision") return revisionByDate.get(k) || 0
    return (solvedByDate.get(k) || 0) + (revisionByDate.get(k) || 0)
  }

  return (
    <Card className="glass-hover p-0">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-yellow-400 shrink-0" />
            <p className="font-semibold whitespace-nowrap">Monthly Streak Tracker</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <div className="flex rounded-lg border border-border/50 p-0.5">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => onModeChange(m.value)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                    mode === m.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm font-medium whitespace-nowrap">{MONTH_NAMES[monthIndex]} {year}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onMonthChange(new Date(year - 1, monthIndex, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm font-medium whitespace-nowrap">{year}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onMonthChange(new Date(year + 1, monthIndex, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:hidden">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground uppercase">{d}</div>
          ))}
          {Array.from({ length: firstWeekday }).map((_, i) => <div key={`blank-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const count = countFor(year, monthIndex, day)
            const isToday = dateKey(year, monthIndex, day) === todayStr
            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-xs",
                  heatColor(count),
                  count > 0 ? "text-zinc-100" : "text-muted-foreground",
                  isToday && "ring-2 ring-yellow-400"
                )}
                title={`${count} on ${dateKey(year, monthIndex, day)}`}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {Array.from({ length: 12 }).map((_, m) => {
            const miniFirstWeekday = new Date(year, m, 1).getDay()
            const miniDaysInMonth = new Date(year, m + 1, 0).getDate()
            return (
              <div key={m}>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">{MONTH_NAMES[m]}</p>
                <div className="grid grid-cols-7 gap-[3px]">
                  {Array.from({ length: miniFirstWeekday }).map((_, i) => <div key={`b-${m}-${i}`} />)}
                  {Array.from({ length: miniDaysInMonth }).map((_, i) => {
                    const day = i + 1
                    const count = countFor(year, m, day)
                    const isToday = dateKey(year, m, day) === todayStr
                    return (
                      <div
                        key={day}
                        className={cn(
                          "aspect-square rounded-[4px]",
                          heatColor(count),
                          isToday && "ring-2 ring-yellow-400"
                        )}
                        title={`${count} on ${dateKey(year, m, day)}`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Less
          <span className={`h-3 w-3 rounded-sm ${heatColor(0)}`} />
          <span className={`h-3 w-3 rounded-sm ${heatColor(1)}`} />
          <span className={`h-3 w-3 rounded-sm ${heatColor(2)}`} />
          <span className={`h-3 w-3 rounded-sm ${heatColor(3)}`} />
          <span className={`h-3 w-3 rounded-sm ${heatColor(5)}`} />
          More
        </div>
      </CardContent>
    </Card>
  )
}
