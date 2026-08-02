"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Flame, Zap, Crown, TrendingUp, Award, Rocket, Code2, PenLine, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/gamification/stat-card"
import { AnimatedNumber } from "@/components/gamification/animated-number"
import { XpBreakdownCard } from "@/components/gamification/xp-breakdown-card"
import { DailyMissionsCard } from "@/components/gamification/daily-missions-card"
import { XpHistoryCard } from "@/components/gamification/xp-history-card"
import { ActivityTimelineCard } from "@/components/gamification/activity-timeline-card"
import { NextRewardsCard } from "@/components/gamification/next-rewards-card"
import { BadgeCard } from "@/components/gamification/badge-card"
import { BadgeModal } from "@/components/gamification/badge-modal"
import { WeeklyStatsCard } from "@/components/gamification/weekly-stats-card"
import { StreakCalendarCard } from "@/components/gamification/streak-calendar-card"
import { LevelUpOverlay } from "@/components/gamification/level-up-overlay"
import { GamificationSkeleton } from "@/components/gamification/gamification-skeleton"
import { updateGamification, fetchGamificationData } from "@/actions"
import type { GamificationSnapshot, BadgeProgress } from "@/lib/gamification"

export default function GamificationPage() {
  const [data, setData] = useState<GamificationSnapshot | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<BadgeProgress | null>(null)
  const [levelUp, setLevelUp] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const snapshot = await updateGamification()
        if (active) {
          setData(snapshot)
          setLevelUp(!!snapshot.lastUpdatedAt && snapshot.level > (snapshot.storedLevel ?? 0))
        }
      } catch {
        const snapshot = await fetchGamificationData()
        if (active) setData(snapshot)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (!data) return <GamificationSkeleton />

  const { levelInfo, badges, badgeProgress } = data
  const isEmpty = data.xp === 0

  const statCards = [
    { icon: Crown, label: "Level", value: `Lv. ${data.level}`, sub: "Current Level", iconBg: "bg-purple-500/10", iconColor: "text-purple-500", gradient: "from-purple-500/10", delay: 0 },
    { icon: Zap, label: "Total XP", value: <AnimatedNumber value={data.xp} />, sub: "Total XP", iconBg: "bg-yellow-400/10", iconColor: "text-yellow-400", delay: 0.1 },
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
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <CardContent className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <span className="text-muted-foreground text-xs sm:text-sm">Level {levelInfo.level} · {data.xp.toLocaleString()} / {levelInfo.xpForNextLevel.toLocaleString()} XP</span>
              <span className="font-medium text-xs sm:text-sm">{levelInfo.xpRemaining} XP to Level {levelInfo.level + 1}</span>
            </div>
            <Progress value={levelInfo.progressPct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {isEmpty ? (
        <Card className="p-4 sm:p-6">
          <CardContent className="flex flex-col items-center text-center py-6 sm:py-10">
            <Rocket className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-lg font-semibold mb-1">Start earning XP</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-5">
              Complete habits, solve LeetCode problems and write journal entries. Every action earns XP, builds streaks and unlocks badges.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/habits">
                <Button size="sm" className="gap-1.5"><CheckCircle2 className="h-4 w-4" />Complete Habits</Button>
              </Link>
              <Link href="/leetcode">
                <Button size="sm" variant="outline" className="gap-1.5"><Code2 className="h-4 w-4" />Solve LeetCode</Button>
              </Link>
              <Link href="/journal">
                <Button size="sm" variant="outline" className="gap-1.5"><PenLine className="h-4 w-4" />Write Journal</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <XpBreakdownCard breakdown={data.breakdown} todayXp={data.todayXp} />
            <DailyMissionsCard missions={data.missions} />
          </div>

          <XpHistoryCard history={data.xpHistory} />

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <ActivityTimelineCard timeline={data.timeline} />
            <NextRewardsCard rewards={data.nextRewards} />
          </div>
        </>
      )}

      <Card className="p-4 sm:p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />Badges &amp; Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            {badgeProgress.map((badge, i) => (
              <BadgeCard key={badge.badgeId} badge={badge} index={i} onClick={() => setSelectedBadge(badge)} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <WeeklyStatsCard stats={data.weeklyStats} />

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
                <p className="text-2xl font-bold text-primary">{badges.length}</p>
                <p className="text-xs text-muted-foreground">Badges Earned</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 text-sm mb-2">
                <span className="text-muted-foreground text-xs sm:text-sm">Next milestone</span>
                <span className="text-xs sm:text-sm">{Math.max(0, 30 - data.currentStreak)} days until Monthly Master</span>
              </div>
              <Progress value={Math.min(100, (data.currentStreak / 30) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {!isEmpty && <StreakCalendarCard days={data.streakCalendar} />}

      {!isEmpty && (
        <motion.div className="flex items-center justify-center gap-2 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Trophy className="h-3.5 w-3.5 text-yellow-400" />
          Keep your streak alive to climb the weekly leaderboard
        </motion.div>
      )}

      <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <LevelUpOverlay level={data.level} show={levelUp} />
    </div>
  )
}
