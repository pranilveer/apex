"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Flame, Zap, Star, Target, Medal, Crown, Award, TrendingUp, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { BADGES } from "@/lib/constants"
import { fetchGamificationData } from "@/actions"

const levelThresholds = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: (i + 1) * 100,
  title: i < 5 ? "Beginner" : i < 15 ? "Intermediate" : i < 30 ? "Advanced" : "Master",
}))

export default function GamificationPage() {
  const [data, setData] = useState<{ xp: number; level: number; currentStreak: number; longestStreak: number; dailyScore: number; badges: string[] }>({
    xp: 0, level: 0, currentStreak: 0, longestStreak: 0, dailyScore: 0, badges: [],
  })

  useEffect(() => {
    fetchGamificationData().then((d) => { if (d) setData(d) })
  }, [])

  const xpForNextLevel = data.level * 100
  const currentLevelXP = data.xp % 100
  const xpProgress = (currentLevelXP / 100) * 100

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Gamification</h2>
        <p className="text-muted-foreground text-sm">Track your progress and earn achievements</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { icon: Crown, label: "Level", value: `Lv. ${data.level}`, sub: `Level ${data.level}`, color: "primary", delay: 0, gradient: "from-purple-500/10" },
          { icon: Zap, label: "Total XP", value: data.xp.toLocaleString(), sub: "Total XP", color: "yellow-400", delay: 0.1 },
          { icon: Flame, label: "Current Streak", value: `${data.currentStreak} days`, sub: "Current Streak", color: "orange-400", delay: 0.2 },
          { icon: TrendingUp, label: "Daily Score", value: `${data.dailyScore}%`, sub: "Daily Score", color: "green-400", delay: 0.3 },
        ].map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
            <Card className={`glass-hover h-full ${item.gradient ? "overflow-hidden relative" : ""}`}>
              {item.gradient && <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} to-transparent`} />}
              <CardContent className="p-5 relative flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-${item.color}/10 flex items-center justify-center shrink-0`}>
                  <item.icon className={`h-6 w-6 text-${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold truncate">{item.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium">{currentLevelXP}/100 XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {BADGES.map((badge, i) => {
              const earned = data.badges.includes(badge.id)
              return (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <div className={cn("flex flex-col items-center p-4 rounded-xl border transition-all text-center",
                  earned ? "border-primary/30 bg-primary/5" : "border-border opacity-50 grayscale"
                )}>
                  <span className="text-4xl mb-2">{badge.icon}</span>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {earned ? (
                    <Badge variant="success" className="mt-2 text-xs">Earned</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2 text-xs">Locked</Badge>
                  )}
                </div>
              </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Weekly Rank</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[].map((w: { week: string; rank: number; score: number }) => (
              <div key={w.week} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    w.rank === 1 ? "bg-yellow-400/20 text-yellow-400" : w.rank === 2 ? "bg-zinc-300/20 text-zinc-300" : w.rank === 3 ? "bg-orange-400/20 text-orange-400" : "bg-secondary text-muted-foreground"
                  )}>
                    {w.rank}
                  </div>
                  <span className="text-sm font-medium">{w.week}</span>
                </div>
                <Badge variant="outline">{w.score}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Streak Stats</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-400/10 to-red-400/5 border border-orange-400/20">
              <Flame className="h-12 w-12 mx-auto text-orange-400 mb-2" />
              <p className="text-4xl font-bold">{data.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Next milestone</span>
                <span>{30 - data.currentStreak} days until Monthly Master</span>
              </div>
              <Progress value={(data.currentStreak / 30) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
