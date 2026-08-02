"use client"
import { CalendarDays, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDate } from "@/lib/utils"
import type { BadgeProgress } from "@/lib/gamification"

function unitLabel(unit: string, target: number): string {
  if (target === 1) return unit
  return `${unit}s`
}

export function BadgeModal({ badge, onClose }: { badge: BadgeProgress | null; onClose: () => void }) {
  return (
    <Dialog open={!!badge} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="glass border-border/50 max-w-md">
        {badge && (
          <>
            <DialogHeader className="items-center text-center sm:text-center">
              <span className="text-5xl mb-2">{badge.icon}</span>
              <DialogTitle>{badge.name}</DialogTitle>
              <DialogDescription>{badge.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {badge.computable ? (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Current Progress</span>
                    <span className="font-medium">
                      {badge.current} / {badge.target} {unitLabel(badge.unit, badge.target)}
                    </span>
                  </div>
                  <Progress value={badge.pct} className="h-2" indicatorClassName={badge.earned ? "bg-green-400" : "bg-primary"} />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Unlock requirement: reach {badge.target} {unitLabel(badge.unit, badge.target)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This badge cannot be tracked yet — the app doesn&apos;t record this data source.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border p-3 text-center">
                  <Trophy className="h-4 w-4 mx-auto text-yellow-400 mb-1" />
                  <p className="text-sm font-bold">+{badge.rewardXp} XP</p>
                  <p className="text-[11px] text-muted-foreground">Reward</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <CalendarDays className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-sm font-bold">{badge.earnedAt ? formatDate(badge.earnedAt) : "—"}</p>
                  <p className="text-[11px] text-muted-foreground">Unlocked</p>
                </div>
              </div>
              <Badge variant={badge.earned ? "success" : "secondary"} className="w-full justify-center py-1">
                {badge.earned ? "Earned" : "Locked"}
              </Badge>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
