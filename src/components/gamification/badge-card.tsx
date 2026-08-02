"use client"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { BadgeProgress } from "@/lib/gamification"

function unitLabel(unit: string, target: number): string {
  if (target === 1) return unit
  return `${unit}s`
}

export function BadgeCard({ badge, index, onClick }: { badge: BadgeProgress; index: number; onClick: () => void }) {
  const earned = badge.earned
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="cursor-pointer h-full"
    >
      <div
        className={cn(
          "flex flex-col items-center p-3 sm:p-4 rounded-xl border text-center h-full transition-all duration-200",
          earned ? "border-primary/30 bg-primary/5" : "border-border opacity-60"
        )}
      >
        <motion.span
          animate={earned ? { scale: [1, 1.15, 1] } : undefined}
          transition={{ duration: 0.5 }}
          className={cn("text-3xl sm:text-4xl mb-1.5 sm:mb-2", earned ? "drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" : "grayscale")}
        >
          {badge.icon}
        </motion.span>
        <p className="text-[13px] sm:text-sm font-medium leading-tight">{badge.name}</p>
        {badge.computable ? (
          <>
            <div className="w-full mt-1.5">
              <Progress value={badge.pct} className="h-1.5" indicatorClassName={earned ? "bg-green-400" : "bg-primary"} />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {badge.current} / {badge.target} {unitLabel(badge.unit, badge.target)}
            </p>
          </>
        ) : (
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">Data not tracked yet</p>
        )}
        <Badge variant={earned ? "success" : "secondary"} className="mt-2 text-[10px] sm:text-xs">
          {earned ? "Earned" : "Locked"}
        </Badge>
      </div>
    </motion.div>
  )
}
