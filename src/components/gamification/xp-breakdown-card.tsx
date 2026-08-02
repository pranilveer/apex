"use client"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SOURCE_ICONS, SOURCE_COLORS } from "./icon-map"
import type { XpBreakdownItem } from "@/lib/gamification"

export function XpBreakdownCard({ breakdown, todayXp }: { breakdown: XpBreakdownItem[]; todayXp: number }) {
  const hasData = todayXp > 0 && breakdown.length > 0

  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          Today&apos;s XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            No XP earned yet today. Complete habits, solve problems or write a journal entry to start earning!
          </p>
        ) : (
          <div className="space-y-2">
            {breakdown.map((item, i) => {
              const Icon = SOURCE_ICONS[item.type] ?? Sparkles
              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 sm:p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${SOURCE_COLORS[item.type] ?? "bg-secondary"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-green-400 shrink-0">+{item.xp} XP</span>
                </motion.div>
              )
            })}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-base font-bold">+{todayXp} XP</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
