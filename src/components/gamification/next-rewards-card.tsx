"use client"
import { Gift, Flame, Crown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { NextRewards } from "@/lib/gamification"

export function NextRewardsCard({ rewards }: { rewards: NextRewards }) {
  return (
    <Card className="p-4 sm:p-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-400" />
          Next Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-purple-400/30 bg-purple-400/5 p-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-sm font-medium">{rewards.level.label}</span>
            <span className="text-xs text-muted-foreground">{rewards.level.detail}</span>
          </div>
          <Progress value={(rewards.level.current / rewards.level.target) * 100} className="h-2" indicatorClassName="bg-purple-400" />
        </div>

        {rewards.streaks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rewards.streaks.map((s) => (
              <div key={s.id} className="rounded-lg border border-orange-400/30 bg-orange-400/5 p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    {s.icon === "Crown" ? <Crown className="h-4 w-4 text-yellow-400" /> : <Flame className="h-4 w-4 text-orange-400" />}
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.detail}</span>
                </div>
                <Progress value={(s.current / s.target) * 100} className="h-1.5" indicatorClassName="bg-orange-400" />
              </div>
            ))}
          </div>
        )}

        {rewards.badges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {rewards.badges.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3 text-center">
                <span className="text-2xl block mb-1">{b.icon}</span>
                <p className="text-sm font-medium leading-tight">{b.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.detail}</p>
                <div className="mt-2">
                  <Progress value={(b.current / Math.max(b.target, 1)) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {rewards.badges.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">All badges earned. Incredible work!</p>
        )}
      </CardContent>
    </Card>
  )
}
