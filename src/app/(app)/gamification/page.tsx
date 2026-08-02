"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Flame, Zap, Crown, Award, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { BADGES } from "@/lib/constants"
import { fetchGamificationData } from "@/actions"

export default function GamificationPage() {
  const [data, setData] = useState<{ xp: number; level: number; currentStreak: number; longestStreak: number; dailyScore: number; badges: string[] }>({
    xp: 0, level: 0, currentStreak: 0, longestStreak: 0, dailyScore: 0, badges: [],
  })

  useEffect(() => {
    fetchGamificationData().then((d) => { if (d) setData(d) })
  }, [])

  const currentLevelXP = data.xp % 100
  const xpProgress = (currentLevelXP / 100) * 100

  const statCards = [
    { icon: Crown, label: "Level", value: `Lv. ${data.level}`, sub: "Level", iconBg: "bg-purple-500/10", iconColor: "text-purple-500", gradient: "from-purple-500/10", delay: 0 },
    { icon: Zap, label: "Total XP", value: data.xp.toLocaleString(), sub: "Total XP", iconBg: "bg-yellow-400/10", iconColor: "text-yellow-400", delay: 0.1 },
    { icon: Flame, label: "Current Streak", value: `${data.currentStreak} days`, sub: "Current Streak", iconBg: "bg-orange-400/10", iconColor: "text-orange-400", delay: 0.2 },
    { icon: TrendingUp, label: "Daily Score", value: `${data.dailyScore}%`, sub: "Daily Score", iconBg: "bg-green-400/10", iconColor: "text-green-400", delay: 0.3 },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Gamification</h2>
        <p className="text-muted-foreground text-sm">Track your progress and earn achievements</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        {statCards.map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }} className="min-w-0">
            <Card className={`glass-hover h-full p-4 sm:p-5 ${item.gradient ? "overflow-hidden relative" : ""}`}>
              {item.gradient && <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} to-transparent`} />}
              <CardContent className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold truncate">{item.value}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{item.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <CardContent className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 text-sm mb-1">
              <span className="text-muted-foreground text-xs sm:text-sm">XP Progress</span>
              <span className="font-medium text-xs sm:text-sm">{currentLevelXP}/100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card className="p-4 sm:p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {BADGES.map((badge, i) => {
              const earned = data.badges.includes(badge.id)
              return (
                <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className={cn("flex flex-col items-center p-3 sm:p-4 rounded-xl border text-center h-full",
                    earned ? "border-primary/30 bg-primary/5" : "border-border opacity-50 grayscale"
                  )}>
                    <span className="text-3xl sm:text-4xl mb-1.5 sm:mb-2">{badge.icon}</span>
                    <p className="text-[13px] sm:text-sm font-medium leading-tight">{badge.name}</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-snug">{badge.description}</p>
                    <Badge variant={earned ? "success" : "secondary"} className="mt-2 text-[10px] sm:text-xs">{earned ? "Earned" : "Locked"}</Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Rank</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Trophy className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm text-muted-foreground">No rankings yet. Keep up the streak to climb the leaderboard!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="pb-2"><CardTitle className="text-base">Streak Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-orange-400/10 to-red-400/5 border border-orange-400/20">
              <Flame className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-orange-400 mb-2" />
              <p className="text-3xl sm:text-4xl font-bold">{data.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-yellow-400">{data.longestStreak}</p>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">{data.badges.length}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-sm mb-2">
                <span className="text-muted-foreground text-xs sm:text-sm">Next milestone</span>
                <span className="text-xs sm:text-sm">{Math.max(0, 30 - data.currentStreak)} days until Monthly Master</span>
              </div>
              <Progress value={(data.currentStreak / 30) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
