"use client"
import { motion } from "framer-motion"
import { Trophy, Flame, Zap, Star, Target, Medal, Crown, Award, TrendingUp, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const levelThresholds = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: (i + 1) * 100,
  title: i < 5 ? "Beginner" : i < 15 ? "Intermediate" : i < 30 ? "Advanced" : "Master",
}))

const currentXP = 2350
const currentLevel = 24
const currentStreak = 23
const longestStreak = 31
const dailyScore = 78

const badges = [
  { id: "first-day", name: "First Day", icon: "🌟", description: "Complete your first day", earned: true },
  { id: "week-streak", name: "Week Warrior", icon: "🔥", description: "7 day streak", earned: true },
  { id: "month-streak", name: "Monthly Master", icon: "👑", description: "30 day streak", earned: false },
  { id: "hundred-leetcode", name: "Century Coder", icon: "💯", description: "Solve 100 LeetCode problems", earned: true },
  { id: "early-bird", name: "Early Bird", icon: "🐦", description: "Wake up before 6 AM for 7 days", earned: true },
  { id: "gym-rat", name: "Gym Rat", icon: "💪", description: "30 day gym streak", earned: false },
  { id: "code-monkey", name: "Code Monkey", icon: "🐙", description: "100 GitHub contributions in a month", earned: false },
  { id: "interview-ready", name: "Interview Ready", icon: "🎯", description: "Complete all interview prep topics", earned: false },
  { id: "bookworm", name: "Bookworm", icon: "📚", description: "Read 10 books", earned: false },
  { id: "hydrated", name: "Stay Hydrated", icon: "💧", description: "30 day water intake streak", earned: true },
]

const weeklyRankings = [
  { week: "Week 1", rank: 5, score: 72 },
  { week: "Week 2", rank: 3, score: 85 },
  { week: "Week 3", rank: 4, score: 68 },
  { week: "Week 4", rank: 1, score: 91 },
  { week: "Week 5", rank: 2, score: 88 },
  { week: "Week 6", rank: 1, score: 95 },
]

export default function GamificationPage() {
  const xpForNextLevel = currentLevel * 100
  const currentLevelXP = currentXP % 100
  const xpProgress = (currentLevelXP / 100) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gamification</h2>
        <p className="text-muted-foreground text-sm">Track your progress and earn achievements</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="glass-hover overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <CardContent className="p-5 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Crown className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">Lv. {currentLevel}</p>
                  <p className="text-xs text-muted-foreground">Level {currentLevel}</p>
                </div>
              </div>
              <Progress value={xpProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{currentLevelXP}/100 XP to next level</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentXP.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-400/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentStreak} days</p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-hover">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-400/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dailyScore}%</p>
                  <p className="text-xs text-muted-foreground">Daily Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {badges.map((badge, i) => (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <div className={cn("flex flex-col items-center p-4 rounded-xl border transition-all text-center",
                  badge.earned ? "border-primary/30 bg-primary/5" : "border-border opacity-50 grayscale"
                )}>
                  <span className="text-4xl mb-2">{badge.icon}</span>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {badge.earned ? (
                    <Badge variant="success" className="mt-2 text-xs">Earned</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2 text-xs">Locked</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Weekly Rank</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {weeklyRankings.map((w) => (
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
              <p className="text-4xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-yellow-400">{longestStreak}</p>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center p-4 rounded-lg border border-border">
                <p className="text-2xl font-bold text-primary">{badges.filter((b) => b.earned).length}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Next milestone</span>
                <span>{30 - currentStreak} days until Monthly Master</span>
              </div>
              <Progress value={(currentStreak / 30) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
