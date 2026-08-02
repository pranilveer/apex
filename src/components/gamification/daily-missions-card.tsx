"use client"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MISSION_ICONS } from "./icon-map"
import type { DailyMission } from "@/lib/gamification"

export function DailyMissionsCard({ missions }: { missions: DailyMission[] }) {
  const done = missions.filter((m) => m.done).length
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            Daily Missions
          </CardTitle>
          <Badge variant={done === missions.length && missions.length > 0 ? "success" : "secondary"} className="text-xs">
            {done}/{missions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {missions.map((m, i) => {
          const Icon = MISSION_ICONS[m.id] ?? Target
          return (
            <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={cn("flex items-center gap-3 rounded-lg border p-2.5", m.done ? "border-green-400/30 bg-green-400/5" : "border-border")}>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", m.done ? "bg-green-400/10" : "bg-secondary")}>
                  <Icon className={cn("h-4 w-4", m.done ? "text-green-400" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", m.done && "line-through text-muted-foreground")}>{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.current} / {m.target}
                  </p>
                </div>
                {m.done ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                )}
                <span className="text-xs font-semibold text-yellow-400 shrink-0">+{m.xp}</span>
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
