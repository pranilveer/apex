import type { GitHubAccount, GitHubActivity, GitHubRepoInfo } from "@/types"
import { CODING_MINUTES_PER_COMMIT } from "@/lib/github"

export interface GitHubCalendar {
  days: { date: string; count: number }[]
  currentStreak: number
  longestStreak: number
  totalContributions: number
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return dayKey(d)
}

export function countPushEvents(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "push").length
}

export function countCommits(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "push").reduce((s, a) => s + (a.commitCount ?? 1), 0)
}

export function countMergedPrs(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "pull_request" && a.merged).length
}

export function countClosedIssues(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "issue" && (a.action === "closed" || a.title.startsWith("Issue closed"))).length
}

export function countCreatedRepos(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "create" && (a.refType === "repository" || a.title.startsWith("Created repository"))).length
}

export function countReviews(activities: GitHubActivity[]): number {
  return activities.filter((a) => a.type === "review").length
}

export function totalCommits(account: GitHubAccount | null | undefined, activities: GitHubActivity[]): number {
  if (account?.totalCommits) return account.totalCommits
  return countCommits(activities)
}

export function ownRepoSet(repoList: GitHubRepoInfo[]): Set<string> {
  return new Set(repoList.map((r) => r.name))
}

export function isOpenSource(activity: GitHubActivity, own: Set<string>): boolean {
  if (!activity.repository) return false
  return !own.has(activity.repository)
}

export function countOpenSourceContributions(activities: GitHubActivity[], own: Set<string>): number {
  return activities.filter((a) => isOpenSource(a, own)).length
}

export function topLanguages(repoList: GitHubRepoInfo[], limit = 6): { name: string; value: number }[] {
  const counts = new Map<string, number>()
  for (const r of repoList) {
    const lang = r.language || "No language"
    counts.set(lang, (counts.get(lang) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, limit).map(([name, value]) => ({ name, value }))
  const rest = sorted.slice(limit).reduce((s, [, v]) => s + v, 0)
  if (rest > 0) top.push({ name: "Other", value: rest })
  return top
}

export function mostActiveRepo(activities: GitHubActivity[], days = 30): string | null {
  const cutoff = addDays(dayKey(new Date()), -days)
  const counts = new Map<string, number>()
  for (const a of activities) {
    if (a.date < cutoff) continue
    counts.set(a.repository, (counts.get(a.repository) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [repo, n] of counts) {
    if (n > bestCount) {
      bestCount = n
      best = repo
    }
  }
  return best
}

export function inactiveRepos(repoList: GitHubRepoInfo[], days = 7, limit = 3): GitHubRepoInfo[] {
  const today = new Date()
  const cutoff = today.getTime() - days * 24 * 60 * 60 * 1000
  const cutoffCreated = today.getTime() - days * 24 * 60 * 60 * 1000
  return repoList
    .filter((r) => {
      if (r.archived) return false
      const pushed = new Date(r.pushedAt).getTime()
      if (Number.isNaN(pushed)) return false
      if (pushed > cutoff) return false
      const created = new Date(r.createdAt).getTime()
      if (!Number.isNaN(created) && created > cutoffCreated) return false
      return true
    })
    .sort((a, b) => new Date(a.pushedAt).getTime() - new Date(b.pushedAt).getTime())
    .slice(0, limit)
}

export function repoGrowth(repoList: GitHubRepoInfo[]): { month: string; created: number }[] {
  const months = repoList
    .map((r) => r.createdAt?.slice(0, 7))
    .filter((m): m is string => Boolean(m))
    .sort()
  if (!months.length) return []
  const countByMonth = new Map<string, number>()
  for (const m of months) countByMonth.set(m, (countByMonth.get(m) ?? 0) + 1)
  const sortedMonths = [...countByMonth.keys()].sort()
  let running = 0
  return sortedMonths.map((m) => {
    running += countByMonth.get(m) ?? 0
    return { month: m, created: running }
  })
}

export function contributionTrend(calendar: GitHubCalendar | null, days = 30): { date: string; count: number }[] {
  if (!calendar?.days.length) return []
  const map = new Map(calendar.days.map((d) => [d.date, d.count]))
  const today = dayKey(new Date())
  const out: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    out.push({ date: d, count: map.get(d) ?? 0 })
  }
  return out
}

export function weeklyContributions(calendar: GitHubCalendar | null): { day: string; count: number }[] {
  const trend = contributionTrend(calendar, 7)
  return trend.map((t) => ({
    day: new Date(`${t.date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    count: t.count,
  }))
}

export function estimateCodingMinutes(contributions: number, trackedTaskMinutes: number): number {
  return trackedTaskMinutes + contributions * CODING_MINUTES_PER_COMMIT
}
