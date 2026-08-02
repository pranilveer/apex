"use client"
import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { XpHistoryPoint } from "@/lib/gamification"

const RANGES = [7, 30, 90] as const

export function XpHistoryCard({ history }: { history: XpHistoryPoint[] }) {
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const data = history.slice(-range)
  const hasData = data.some((d) => d.xp > 0)

  const tickFormatter = (d: string) => {
    const date = new Date(`${d}T00:00:00`)
    if (range === 7) return date.toLocaleDateString("en-US", { weekday: "short" })
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            XP History
          </CardTitle>
          <div className="flex items-center gap-1">
            {RANGES.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setRange(r)}
              >
                {r}D
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No XP earned in this period yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickFormatter={tickFormatter} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="xp" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
