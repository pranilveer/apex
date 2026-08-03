import { getDb } from "@/lib/mongodb"
import { addDays } from "@/lib/revision"
import type { ReminderSetting, GitHubAccount, GitHubActivity, GitHubRepoInfo } from "@/types"
import { GITHUB_INACTIVE_DAYS, GITHUB_MILESTONES, GITHUB_STREAK_WARNING_HOUR } from "@/lib/github"
import { inactiveRepos, totalCommits } from "@/lib/github-insights"

function nowParts(timeZone?: string): { today: string; minutes: number } {
  const tz = timeZone || "UTC"
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
  const parts = fmt.formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0"
  return {
    today: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  }
}

export async function generateNotificationsForUser(userId: string, timeZone?: string): Promise<number> {
  const db = await getDb()
  const notificationsCol = db.collection("notifications")

  let created = 0
  const insertIfMissing = async (refId: string, doc: { title: string; message: string; type: string }) => {
    const existing = await notificationsCol.findOne({ userId, refId })
    if (existing) return
    await notificationsCol.insertOne({
      userId,
      ...doc,
      refId,
      time: new Date().toISOString(),
      read: false,
      createdAt: new Date().toISOString(),
    })
    created++
  }

  const settingsDoc = await db.collection("reminder_settings").findOne({ userId })
  const effectiveTz = (settingsDoc?.timeZone as string | undefined) || timeZone || "UTC"
  const { today, minutes: nowMin } = nowParts(effectiveTz)
  const dueLimit = addDays(today, 3)

  // 1. Reminders from saved settings — only after their time has passed today
  const settings = (settingsDoc?.settings ?? []) as ReminderSetting[]
  for (const r of settings) {
    if (!r.enabled) continue
    const [h, m] = (r.time ?? "08:00").split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) continue
    if (h * 60 + m > nowMin) continue
    await insertIfMissing(`reminder-${r.id}-${today}`, {
      title: r.label,
      message: `${r.label} time is here. Stay on track!`,
      type: "reminder",
    })
  }

  // 2. Goals due within the next 3 days (not yet completed)
  const goals = await db.collection("goals").find({ userId }).toArray()
  for (const g of goals) {
    if (!g.targetDate) continue
    const target = Number(g.targetValue ?? 1)
    const current = Number(g.currentValue ?? 0)
    if (current >= target) continue
    if (g.targetDate < today || g.targetDate > dueLimit) continue
    await insertIfMissing(`goal-${String(g._id)}-${g.targetDate}`, {
      title: `Goal due: ${g.title}`,
      message: `"${g.title}" is due on ${g.targetDate}. Progress: ${current}/${target}.`,
      type: "goal",
    })
  }

  // 3. Interviews within the next 3 days
  const jobs = await db.collection("jobs").find({ userId }).toArray()
  for (const j of jobs) {
    const interviews = (j.interviews ?? []) as import("@/types").Interview[]
    for (const iv of interviews) {
      if (!iv.date) continue
      if (iv.date < today || iv.date > dueLimit) continue
      const company = String(j.company ?? "Company")
      const role = String(j.role ?? "")
      await insertIfMissing(`interview-${String(j._id)}-${iv.id}-${iv.date}`, {
        title: `Interview: ${company}${role ? ` - ${role}` : ""}`,
        message: `${iv.type || "Interview"} round ${iv.roundNumber || 1} on ${iv.date}${iv.time ? ` at ${iv.time}` : ""}${iv.meetingLink ? `\nJoin: ${iv.meetingLink}` : ""}`,
        type: "interview",
      })
    }
  }

  // 4. GitHub reminders — only when a GitHub account is connected
  const accountDoc = await db.collection("github_accounts").findOne({ userId })
  if (accountDoc) {
    const account = accountDoc as unknown as GitHubAccount
    const activities = (await db
      .collection("github_activities")
      .find({ userId })
      .project({ date: 1, type: 1, commitCount: 1, repository: 1 })
      .toArray()) as unknown as GitHubActivity[]
    const hasPushToday = activities.some((a) => a.date === today && a.type === "push")
    const commits = totalCommits(account, activities)
    const lateEnough = nowMin >= GITHUB_STREAK_WARNING_HOUR * 60

    // 4a. No commits today (only late in the day to avoid premature reminders)
    if (lateEnough && !hasPushToday) {
      await insertIfMissing(`github-no-commit-${today}`, {
        title: "No commits today",
        message: "You haven't pushed any code today. A short commit keeps your momentum going.",
        type: "github",
      })
    }

    // 4b. Contribution streak will end today
    const calendarDays = (account.contributionCalendar ?? []) as { date: string; count: number }[]
    const todayContrib = calendarDays.find((d) => d.date === today)?.count ?? 0
    if (lateEnough && (account.currentStreak ?? 0) > 0 && todayContrib === 0 && !hasPushToday) {
      await insertIfMissing(`github-streak-end-${today}`, {
        title: "Your contribution streak is on the line",
        message: `Make a commit before midnight to keep your ${account.currentStreak}-day streak alive.`,
        type: "github",
      })
    }

    // 4c. Inactive repositories (weekly, deduped per repo per week)
    const now = new Date()
    const monday = new Date(now)
    monday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7))
    const weekKey = monday.toISOString().slice(0, 10)
    const repoList = (account.repoList ?? []) as GitHubRepoInfo[]
    const inactive = inactiveRepos(repoList, GITHUB_INACTIVE_DAYS, 3)
    for (const repo of inactive) {
      await insertIfMissing(`github-inactive-${repo.name}-${weekKey}`, {
        title: `Repository inactive: ${repo.name}`,
        message: `${repo.name} hasn't had activity in ${GITHUB_INACTIVE_DAYS}+ days.${repo.language ? ` Language: ${repo.language}.` : ""}`,
        type: "github",
      })
    }

    // 4d. Commit milestone celebration (fires once per milestone)
    const reached = GITHUB_MILESTONES.filter((n) => commits >= n)
    const milestone = reached.length ? reached[reached.length - 1] : null
    if (milestone) {
      await insertIfMissing(`github-milestone-${milestone}`, {
        title: `Congratulations on ${milestone} commits!`,
        message: `You've made ${commits.toLocaleString()} commits. Keep building!`,
        type: "github",
      })
    }
  }

  return created
}

export async function generateNotificationsForAllUsers(): Promise<number> {
  const db = await getDb()
  const users = await db.collection("users").find({}, { projection: { _id: 1 } }).toArray()
  let total = 0
  for (const u of users) {
    total += await generateNotificationsForUser(String(u._id))
  }
  return total
}
