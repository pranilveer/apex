"use client"
import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { StreakCalendarDay } from "@/lib/gamification"

function heatColor(count: number): string {
  if (count >= 5) return "bg-green-500"
  if (count >= 3) return "bg-green-600"
  if (count >= 2) return "bg-green-700"
  if (count >= 1) return "bg-green-400/60"
  return "bg-secondary"
}

export function StreakCalendarCard({ days }: { days: StreakCalendarDay[] }) {
  const active = days.filter((d) => d.active).length
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-orange-400" />
            Streak Calendar
          </CardTitle>
          <span className="text-xs text-muted-foreground">{active} active days</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-13 gap-1 min-w-[520px]">
            {days.map((d) => (
              <div
                key={d.date}
                className={cn("h-4 w-full rounded-sm", heatColor(d.count))}
                title={`${d.date}: ${d.count} activities`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 5].map((n) => (
            <div key={n} className={cn("h-3 w-3 rounded-sm", heatColor(n))} />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
