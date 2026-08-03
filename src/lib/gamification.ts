import type {
  DailyTask,
  GitHubAccount,
  GitHubActivity,
  Goal,
  HabitEntry,
  InterviewTopic,
  JournalEntry,
  LeetCodeProblem,
  Project,
} from "@/types"
import { addDays, getTodayDateString, solvedDatesOf } from "@/lib/revision"
import { calculateStreak, getRelativeDayLabel } from "@/lib/utils"
import { BADGES } from "@/lib/constants"
import {
  countCommits,
  countCreatedRepos,
  countOpenSourceContributions,
  countReviews,
  ownRepoSet,
} from "@/lib/github-insights"

export const XP_PER_LEVEL = 100

export const ACTIVITY_XP = {
  leetcodeSolved: 25,
  habitCompleted: 15,
  dailyTaskCompleted: 10,
  journalWritten: 10,
  projectTaskDone: 15,
  goalCompleted: 50,
  interviewTopicMastered: 25,
} as const

export const GITHUB_ACTIVITY_XP = {
  push: 10,
  pullRequestOpened: 5,
  pullRequestMerged: 30,
  issueOpened: 5,
  issueClosed: 15,
  review: 15,
  release: 15,
  fork: 10,
  repositoryCreated: 50,
  createOther: 10,
  other: 5,
} as const

export const MISSION_XP = {
  githubCommit: 10,
  githubPr: 25,
  githubReview: 20,
  githubTask: 15,
} as const

export function githubActivityXp(activity: Pick<GitHubActivity, "type" | "action" | "merged" | "refType" | "title">): number {
  switch (activity.type) {
    case "push":
      return GITHUB_ACTIVITY_XP.push
    case "pull_request":
      return activity.merged ? GITHUB_ACTIVITY_XP.pullRequestMerged : GITHUB_ACTIVITY_XP.pullRequestOpened
    case "issue":
      return activity.action === "closed" || activity.title?.startsWith("Issue closed")
        ? GITHUB_ACTIVITY_XP.issueClosed
        : GITHUB_ACTIVITY_XP.issueOpened
    case "review":
      return GITHUB_ACTIVITY_XP.review
    case "release":
      return GITHUB_ACTIVITY_XP.release
    case "fork":
      return GITHUB_ACTIVITY_XP.fork
    case "create":
      return activity.refType === "repository" || activity.title?.startsWith("Created repository")
        ? GITHUB_ACTIVITY_XP.repositoryCreated
        : GITHUB_ACTIVITY_XP.createOther
    default:
      return GITHUB_ACTIVITY_XP.other
  }
}

export const BADGE_REWARDS: Record<string, number> = {
  "first-day": 25,
  "week-streak": 50,
  "month-streak": 200,
  "hundred-leetcode": 150,
  "early-bird": 75,
  "gym-rat": 100,
  "code-monkey": 100,
  "interview-ready": 120,
  "bookworm": 80,
  "hydrated": 60,
  "first-commit": 10,
  "commits-10": 25,
  "commits-100": 100,
  "commits-500": 250,
  "open-source-contributor": 150,
  "repository-creator": 100,
  "stars-100": 150,
  "pr-master": 150,
  "code-reviewer": 120,
}

export type XpSource =
  | "leetcode"
  | "habit"
  | "dailyTask"
  | "github"
  | "journal"
  | "project"
  | "goal"
  | "interview"

export interface ActivityEvent {
  id: string
  date: string // YYYY-MM-DD
  type: XpSource
  label: string
  xp: number
}

export interface XpBreakdownItem {
  type: XpSource
  label: string
  xp: number
  icon: string
}

export interface TimelineGroup {
  date: string
  label: string
  events: ActivityEvent[]
}

export interface LevelInfo {
  level: number
  currentLevelXp: number
  xpForNextLevel: number
  xpRemaining: number
  progressPct: number
}

export interface BadgeProgress {
  badgeId: string
  name: string
  description: string
  icon: string
  current: number
  target: number
  pct: number
  earned: boolean
  earnedAt: string | null
  rewardXp: number
  computable: boolean
  unit: string
}

export interface DailyMission {
  id: string
  label: string
  icon: string
  current: number
  target: number
  xp: number
  done: boolean
}

export interface NextReward {
  id: string
  label: string
  detail: string
  current: number
  target: number
  remaining: number
  xp?: number
  icon: string
}

export interface NextRewards {
  level: NextReward
  badges: NextReward[]
  streaks: NextReward[]
}

export interface XpHistoryPoint {
  date: string
  xp: number
}

export interface StreakCalendarDay {
  date: string
  count: number
  active: boolean
}

export interface WeeklyStats {
  xpThisWeek: number
  bestDay: string | null
  bestDayXp: number
  longestSession: number // minutes
  tasksCompleted: number
  leetcodeSolved: number
}

export interface GamificationInput {
  leetcodeProblems: LeetCodeProblem[]
  habits: HabitEntry[]
  dailyTasks: DailyTask[]
  githubActivities: GitHubActivity[]
  githubAccount?: GitHubAccount
  journalEntries: JournalEntry[]
  projects: (Project & { createdAt?: string; updatedAt?: string })[]
  goals: (Goal & { createdAt?: string; updatedAt?: string })[]
  interviewTopics: InterviewTopic[]
  badgeAwards: Record<string, string>
}

export interface GamificationSnapshot {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  dailyScore: number
  badges: string[]
  badgeAwards: Record<string, string>
  lastUpdatedAt?: string
  storedLevel?: number
  levelInfo: LevelInfo
  todayXp: number
  breakdown: XpBreakdownItem[]
  timeline: TimelineGroup[]
  badgeProgress: BadgeProgress[]
  nextRewards: NextRewards
  xpHistory: XpHistoryPoint[]
  streakCalendar: StreakCalendarDay[]
  weeklyStats: WeeklyStats
  missions: DailyMission[]
}

export const SOURCE_META: { type: XpSource; label: string; icon: string }[] = [
  { type: "leetcode", label: "LeetCode", icon: "Code2" },
  { type: "habit", label: "Habits", icon: "CheckCircle2" },
  { type: "dailyTask", label: "Daily Tasks", icon: "ListChecks" },
  { type: "github", label: "GitHub", icon: "Github" },
  { type: "journal", label: "Journal", icon: "PenLine" },
  { type: "project", label: "Projects", icon: "FolderKanban" },
  { type: "goal", label: "Goals", icon: "Target" },
  { type: "interview", label: "Interview Prep", icon: "BookOpen" },
]

const HABIT_LABELS: Record<string, string> = {
  gym: "Gym",
  protein: "Protein",
  meditation: "Meditation",
  reading: "Reading",
  water: "Water",
  sleep: "Sleep",
  leetcode: "LeetCode",
  github: "GitHub",
  project: "Project",
  office: "Office",
}

export function buildActivityEvents(input: GamificationInput): ActivityEvent[] {
  const today = getTodayDateString()
  const events: ActivityEvent[] = []

  for (const p of input.leetcodeProblems) {
    for (const d of solvedDatesOf(p)) {
      events.push({ id: `${p.id}-${d}`, date: d, type: "leetcode", label: `Solved ${p.name}`, xp: ACTIVITY_XP.leetcodeSolved })
    }
  }

  for (const h of input.habits) {
    for (const [id, done] of Object.entries(h.habits)) {
      if (!done) continue
      events.push({ id: `${h.date}-${id}`, date: h.date, type: "habit", label: `Completed ${HABIT_LABELS[id] ?? id}`, xp: ACTIVITY_XP.habitCompleted })
    }
  }

  for (const t of input.dailyTasks) {
    if (!t.completed) continue
    events.push({ id: `${t.date}-${t.id}`, date: t.date, type: "dailyTask", label: `Finished ${t.label}`, xp: ACTIVITY_XP.dailyTaskCompleted })
  }

  for (const g of input.githubActivities) {
    events.push({ id: `${g.id}-github`, date: g.date, type: "github", label: `${g.title} in ${g.repository}`, xp: githubActivityXp(g) })
  }

  for (const j of input.journalEntries) {
    events.push({ id: `${j.date}-journal`, date: j.date, type: "journal", label: "Journal written", xp: ACTIVITY_XP.journalWritten })
  }

  for (const p of input.projects) {
    const date = (p.updatedAt ?? p.createdAt)?.slice(0, 10) ?? today
    for (const t of p.tasks ?? []) {
      if (t.status !== "done") continue
      events.push({ id: `${p.id}-${t.id}`, date, type: "project", label: `Completed task in ${p.name}`, xp: ACTIVITY_XP.projectTaskDone })
    }
  }

  for (const g of input.goals) {
    if (g.targetValue > 0 && g.currentValue >= g.targetValue) {
      const date = (g.updatedAt ?? g.createdAt)?.slice(0, 10) ?? today
      events.push({ id: `${g.id}-goal`, date, type: "goal", label: `Completed goal: ${g.title}`, xp: ACTIVITY_XP.goalCompleted })
    }
  }

  for (const t of input.interviewTopics) {
    if ((t.progress ?? 0) >= 100) {
      const withTs = t as InterviewTopic & { updatedAt?: string; createdAt?: string }
      const date = withTs.updatedAt?.slice(0, 10) ?? withTs.createdAt?.slice(0, 10) ?? today
      events.push({ id: `${t.id}-interview`, date, type: "interview", label: `Mastered ${t.label}`, xp: ACTIVITY_XP.interviewTopicMastered })
    }
  }

  return events
}

export function calculateXP(events: ActivityEvent[], today?: string): { totalXp: number; todayXp: number; breakdown: XpBreakdownItem[] } {
  const date = today ?? getTodayDateString()
  const totalXp = events.reduce((s, e) => s + e.xp, 0)
  const todayXp = events.filter((e) => e.date === date).reduce((s, e) => s + e.xp, 0)

  const breakdownMap = new Map<XpSource, number>()
  for (const e of events) {
    if (e.date !== date) continue
    breakdownMap.set(e.type, (breakdownMap.get(e.type) ?? 0) + e.xp)
  }
  const breakdown = SOURCE_META
    .filter((s) => (breakdownMap.get(s.type) ?? 0) > 0)
    .map((s) => ({ type: s.type, label: s.label, xp: breakdownMap.get(s.type)!, icon: s.icon }))
    .sort((a, b) => b.xp - a.xp)

  return { totalXp, todayXp, breakdown }
}

export function calculateLevel(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL)
  const currentLevelXp = xp % XP_PER_LEVEL
  const xpForNextLevel = (level + 1) * XP_PER_LEVEL
  const xpRemaining = Math.max(0, xpForNextLevel - xp)
  const progressPct = Math.round((currentLevelXp / XP_PER_LEVEL) * 100)
  return { level, currentLevelXp, xpForNextLevel, xpRemaining, progressPct }
}

export function calculateCurrentStreak(events: ActivityEvent[]): { current: number; longest: number } {
  const dates = [...new Set(events.map((e) => e.date))]
  const { current, longest } = calculateStreak(dates)
  return { current, longest }
}

export function calculateDailyScore(missions: DailyMission[]): number {
  if (missions.length === 0) return 0
  const done = missions.filter((m) => m.done).length
  return Math.round((done / missions.length) * 100)
}

export function calculateBadgeProgress(
  input: GamificationInput,
  events: ActivityEvent[],
  streak: { current: number },
  today?: string
): BadgeProgress[] {
  const date = today ?? getTodayDateString()
  const activeDays = new Set(events.map((e) => e.date)).size
  const solvedCount = input.leetcodeProblems.length

  const gymDays = new Set<string>()
  const waterDays = new Set<string>()
  for (const h of input.habits) {
    for (const [id, done] of Object.entries(h.habits)) {
      if (!done) continue
      if (id === "gym") gymDays.add(h.date)
      if (id === "water") waterDays.add(h.date)
    }
  }
  for (const t of input.dailyTasks) {
    if (!t.completed) continue
    if (t.id === "gym") gymDays.add(t.date)
    if (t.id === "water") waterDays.add(t.date)
  }

  const cutoff = addDays(date, -29)
  const githubContribs = input.githubActivities.filter((g) => g.date >= cutoff).length

  const githubAccount = input.githubAccount
  const commitTotal = githubAccount?.totalCommits ?? countCommits(input.githubActivities)
  const ownRepos = ownRepoSet(githubAccount?.repoList ?? [])
  const prCount = input.githubActivities.filter((a) => a.type === "pull_request").length
  const hasGithubActivity = input.githubActivities.length > 0

  const totalTopics = input.interviewTopics.length
  const masteredTopics = input.interviewTopics.filter((t) => (t.progress ?? 0) >= 100).length

  const metrics: Record<string, { current: number; target: number; unit: string; computable: boolean }> = {
    "first-day": { current: activeDays, target: 1, unit: "day", computable: true },
    "week-streak": { current: streak.current, target: 7, unit: "day", computable: true },
    "month-streak": { current: streak.current, target: 30, unit: "day", computable: true },
    "hundred-leetcode": { current: solvedCount, target: 100, unit: "problem", computable: true },
    "early-bird": { current: 0, target: 0, unit: "day", computable: false },
    "gym-rat": { current: gymDays.size, target: 30, unit: "day", computable: true },
    "code-monkey": { current: githubContribs, target: 100, unit: "contribution", computable: true },
    "interview-ready": { current: masteredTopics, target: totalTopics, unit: "topic", computable: totalTopics > 0 },
    "bookworm": { current: 0, target: 0, unit: "book", computable: false },
    "hydrated": { current: waterDays.size, target: 30, unit: "day", computable: true },
    "first-commit": { current: commitTotal, target: 1, unit: "commit", computable: true },
    "commits-10": { current: commitTotal, target: 10, unit: "commit", computable: true },
    "commits-100": { current: commitTotal, target: 100, unit: "commit", computable: true },
    "commits-500": { current: commitTotal, target: 500, unit: "commit", computable: true },
    "open-source-contributor": { current: countOpenSourceContributions(input.githubActivities, ownRepos), target: 25, unit: "contribution", computable: hasGithubActivity },
    "repository-creator": { current: countCreatedRepos(input.githubActivities), target: 1, unit: "repository", computable: hasGithubActivity },
    "stars-100": { current: githubAccount?.stars ?? 0, target: 100, unit: "star", computable: githubAccount != null },
    "pr-master": { current: prCount, target: 25, unit: "pull request", computable: hasGithubActivity },
    "code-reviewer": { current: countReviews(input.githubActivities), target: 10, unit: "review", computable: hasGithubActivity },
  }

  return BADGES.map((b) => {
    const m = metrics[b.id] ?? { current: 0, target: 0, unit: "", computable: false }
    const computable = m.computable && m.target > 0
    const pct = computable ? Math.min(100, Math.round((m.current / m.target) * 100)) : 0
    const earned = computable && m.current >= m.target
    return {
      badgeId: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      current: m.current,
      target: m.target,
      pct,
      earned,
      earnedAt: input.badgeAwards[b.id] ?? null,
      rewardXp: BADGE_REWARDS[b.id] ?? 0,
      computable,
      unit: m.unit,
    }
  })
}

function mergeBadgeAwards(persisted: Record<string, string>, progress: BadgeProgress[], today: string): Record<string, string> {
  const awards = { ...persisted }
  for (const b of progress) {
    if (b.earned && !awards[b.badgeId]) awards[b.badgeId] = today
  }
  return awards
}

export function calculateNextRewards(
  levelInfo: LevelInfo,
  badgeProgress: BadgeProgress[],
  streak: { current: number }
): NextRewards {
  const level: NextReward = {
    id: "next-level",
    label: `Level ${levelInfo.level + 1}`,
    detail: `${levelInfo.xpRemaining} XP to go`,
    current: levelInfo.currentLevelXp,
    target: XP_PER_LEVEL,
    remaining: levelInfo.xpRemaining,
    icon: "Zap",
  }

  const upcoming = badgeProgress
    .filter((b) => b.computable && !b.earned)
    .map((b) => {
      const remaining = Math.max(0, b.target - b.current)
      return {
        id: b.badgeId,
        label: b.name,
        detail: `${remaining} ${b.unit}${remaining === 1 ? "" : "s"} left`,
        current: b.current,
        target: b.target,
        remaining,
        xp: b.rewardXp,
        icon: b.icon,
      }
    })
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 3)

  const weekRemaining = Math.max(0, 7 - streak.current)
  const monthRemaining = Math.max(0, 30 - streak.current)
  const streaks: NextReward[] = [
    {
      id: "week-streak",
      label: "Week Streak",
      detail: `${weekRemaining} day${weekRemaining === 1 ? "" : "s"} left`,
      current: streak.current,
      target: 7,
      remaining: weekRemaining,
      icon: "Flame",
    },
    {
      id: "month-streak",
      label: "Monthly Master",
      detail: `${monthRemaining} day${monthRemaining === 1 ? "" : "s"} left`,
      current: streak.current,
      target: 30,
      remaining: monthRemaining,
      icon: "Crown",
    },
  ]

  return { level, badges: upcoming, streaks }
}

export function groupTimeline(events: ActivityEvent[], maxGroups = 10): TimelineGroup[] {
  const byDate = new Map<string, ActivityEvent[]>()
  for (const e of events) {
    const arr = byDate.get(e.date) ?? []
    arr.push(e)
    byDate.set(e.date, arr)
  }
  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, maxGroups)
    .map(([d, evs]) => ({
      date: d,
      label: getRelativeDayLabel(d),
      events: evs.sort((x, y) => y.xp - x.xp),
    }))
}

export function buildXpHistory(events: ActivityEvent[], days = 90): XpHistoryPoint[] {
  const today = getTodayDateString()
  const byDay = new Map<string, number>()
  for (const e of events) byDay.set(e.date, (byDay.get(e.date) ?? 0) + e.xp)

  const points: XpHistoryPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    points.push({ date: d, xp: byDay.get(d) ?? 0 })
  }
  return points
}

export function buildStreakCalendar(events: ActivityEvent[], days = 90): StreakCalendarDay[] {
  const today = getTodayDateString()
  const byDay = new Map<string, number>()
  for (const e of events) byDay.set(e.date, (byDay.get(e.date) ?? 0) + 1)

  const cells: StreakCalendarDay[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    const count = byDay.get(d) ?? 0
    cells.push({ date: d, count, active: count > 0 })
  }
  return cells
}

export function generateDailyMissions(input: GamificationInput, today?: string): DailyMission[] {
  const date = today ?? getTodayDateString()
  const habitsToday = input.habits.find((h) => h.date === date)?.habits ?? {}
  const tasksToday = input.dailyTasks.filter((t) => t.date === date)
  const doneTaskIds = new Set(tasksToday.filter((t) => t.completed).map((t) => t.id))

  const leetcodeToday = input.leetcodeProblems.flatMap((p) => solvedDatesOf(p)).filter((d) => d === date).length
  const journalToday = input.journalEntries.filter((j) => j.date === date).length
  const gymDone = habitsToday["gym"] || doneTaskIds.has("gym") ? 1 : 0
  const waterDone = habitsToday["water"] || doneTaskIds.has("water") ? 1 : 0

  const missions: DailyMission[] = [
    { id: "leetcode", label: "Solve 2 LeetCode problems", icon: "Code2", current: leetcodeToday, target: 2, xp: 50, done: leetcodeToday >= 2 },
    { id: "gym", label: "Complete Gym", icon: "Dumbbell", current: gymDone, target: 1, xp: 15, done: gymDone >= 1 },
    { id: "journal", label: "Write a journal entry", icon: "PenLine", current: journalToday, target: 1, xp: 10, done: journalToday >= 1 },
    { id: "water", label: "Stay hydrated", icon: "Droplets", current: waterDone, target: 1, xp: 10, done: waterDone >= 1 },
  ]

  if (input.githubAccount) {
    const githubCommitToday = input.githubActivities.filter((g) => g.date === date && g.type === "push").length
    const githubPrOpenedToday = input.githubActivities.filter(
      (g) => g.date === date && g.type === "pull_request" && (g.action === "opened" || g.action === "reopened")
    ).length
    const githubReviewToday = input.githubActivities.filter((g) => g.date === date && g.type === "review").length
    const githubTaskDone = tasksToday.filter((t) => t.completed && (t.id === "github" || t.id === "project")).length

    missions.push(
      { id: "github-commit", label: "Make a commit", icon: "GitCommit", current: githubCommitToday, target: 1, xp: MISSION_XP.githubCommit, done: githubCommitToday >= 1 },
      { id: "github-pr", label: "Open a pull request", icon: "GitPullRequest", current: githubPrOpenedToday, target: 1, xp: MISSION_XP.githubPr, done: githubPrOpenedToday >= 1 },
      { id: "github-review", label: "Review a pull request", icon: "Eye", current: githubReviewToday, target: 1, xp: MISSION_XP.githubReview, done: githubReviewToday >= 1 },
      { id: "github-task", label: "Complete a repository task", icon: "FolderGit2", current: githubTaskDone, target: 1, xp: MISSION_XP.githubTask, done: githubTaskDone >= 1 }
    )
  }

  if (tasksToday.length > 0) {
    const done = tasksToday.filter((t) => t.completed).length
    missions.push({ id: "tasks", label: "Finish today's tasks", icon: "ListChecks", current: done, target: tasksToday.length, xp: 30, done: done >= tasksToday.length })
  }

  return missions
}

export function calculateWeeklyStats(input: GamificationInput, events: ActivityEvent[], today?: string): WeeklyStats {
  const date = today ?? getTodayDateString()
  const weekStart = addDays(date, -6)
  const weekEvents = events.filter((e) => e.date >= weekStart && e.date <= date)
  const xpThisWeek = weekEvents.reduce((s, e) => s + e.xp, 0)

  const byDay = new Map<string, number>()
  for (const e of weekEvents) byDay.set(e.date, (byDay.get(e.date) ?? 0) + e.xp)
  let bestDay: string | null = null
  let bestDayXp = 0
  for (const [d, xp] of byDay) {
    if (xp > bestDayXp) {
      bestDayXp = xp
      bestDay = d
    }
  }

  let longestSession = 0
  for (const t of input.dailyTasks) {
    if (t.completed && t.date >= weekStart && t.date <= date && (t.timeSpent || 0) > longestSession) {
      longestSession = t.timeSpent
    }
  }

  const tasksCompleted = input.dailyTasks.filter((t) => t.completed && t.date >= weekStart && t.date <= date).length
  const leetcodeSolved = weekEvents.filter((e) => e.type === "leetcode").length

  return { xpThisWeek, bestDay, bestDayXp, longestSession, tasksCompleted, leetcodeSolved }
}

export function buildSnapshot(input: GamificationInput): GamificationSnapshot {
  const today = getTodayDateString()
  const events = buildActivityEvents(input)
  const { totalXp, todayXp, breakdown } = calculateXP(events, today)
  const levelInfo = calculateLevel(totalXp)
  const streak = calculateCurrentStreak(events)
  const badgeProgress = calculateBadgeProgress(input, events, streak, today)
  const badges = badgeProgress.filter((b) => b.earned).map((b) => b.badgeId)
  const badgeAwards = mergeBadgeAwards(input.badgeAwards, badgeProgress, today)
  const missions = generateDailyMissions(input, today)
  const dailyScore = calculateDailyScore(missions)

  return {
    xp: totalXp,
    level: levelInfo.level,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    dailyScore,
    badges,
    badgeAwards,
    levelInfo,
    todayXp,
    breakdown,
    timeline: groupTimeline(events),
    badgeProgress,
    nextRewards: calculateNextRewards(levelInfo, badgeProgress, streak),
    xpHistory: buildXpHistory(events, 90),
    streakCalendar: buildStreakCalendar(events, 90),
    weeklyStats: calculateWeeklyStats(input, events, today),
    missions,
  }
}
