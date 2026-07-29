"use server"

import { getUserId, findMany, findOne, insertOne, updateOne, deleteOne, replaceOne } from "@/lib/db-actions"

export async function fetchGoals() {
  const items = await findMany<import("@/types").Goal>("goals")
  return items
}

export async function addGoal(data: import("@/types").Goal) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("goals", rest)
}

export async function updateGoal(id: string, data: Partial<import("@/types").Goal>) {
  await updateOne("goals", id, data as unknown as Record<string, unknown>)
}

export async function deleteGoal(id: string) {
  await deleteOne("goals", id)
}

export async function fetchHabits() {
  const items = await findMany<import("@/types").HabitEntry>("habits")
  return items
}

export async function saveHabitEntry(date: string, habits: Record<string, boolean>) {
  await replaceOne("habits", { date }, { date, habits } as unknown as Record<string, unknown>)
}

export async function fetchLeetCodeProblems() {
  const items = await findMany<import("@/types").LeetCodeProblem>("leetcode_problems")
  return items
}

export async function addLeetCodeProblem(data: import("@/types").LeetCodeProblem) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("leetcode_problems", rest)
}

export async function toggleRevision(problemId: string, needsRevision: boolean) {
  await updateOne("leetcode_problems", problemId, { needsRevision } as unknown as Record<string, unknown>)
}

export async function deleteLeetCodeProblem(id: string) {
  await deleteOne("leetcode_problems", id)
}

export async function fetchGitHubActivities() {
  const items = await findMany<import("@/types").GitHubActivity>("github_activities")
  return items
}

export async function addGitHubActivity(data: import("@/types").GitHubActivity) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("github_activities", rest)
}

export async function deleteGitHubActivity(id: string) {
  await deleteOne("github_activities", id)
}

export async function fetchProjects() {
  const items = await findMany<import("@/types").Project>("projects")
  return items
}

export async function addProject(data: import("@/types").Project) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("projects", rest)
}

export async function updateProject(id: string, data: Partial<import("@/types").Project>) {
  await updateOne("projects", id, data as unknown as Record<string, unknown>)
}

export async function fetchJobs() {
  const items = await findMany<import("@/types").JobApplication>("jobs")
  return items
}

export async function addJob(data: import("@/types").JobApplication) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("jobs", rest)
}

export async function updateJobStatus(id: string, status: string) {
  await updateOne("jobs", id, { status } as unknown as Record<string, unknown>)
}

export async function deleteJob(id: string) {
  await deleteOne("jobs", id)
}

export async function fetchResumes() {
  const items = await findMany<import("@/types").Resume>("resumes")
  return items
}

export async function addResume(data: import("@/types").Resume) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("resumes", rest)
}

export async function setDefaultResume(id: string) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("resumes").updateMany({ userId }, { $set: { isDefault: false } })
  await updateOne("resumes", id, { isDefault: true } as unknown as Record<string, unknown>)
}

export async function fetchApplicationRecords() {
  const items = await findMany<import("@/types").ApplicationRecord>("application_records")
  return items
}

export async function fetchResources() {
  const items = await findMany<import("@/types").Resource>("resources")
  return items
}

export async function addResource(data: import("@/types").Resource) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("resources", rest)
}

export async function toggleBookmark(resourceId: string, bookmarked: boolean) {
  await updateOne("resources", resourceId, { bookmarked } as unknown as Record<string, unknown>)
}

export async function deleteResource(id: string) {
  await deleteOne("resources", id)
}

export async function fetchJournalEntries() {
  const items = await findMany<import("@/types").JournalEntry>("journal_entries")
  return items
}

export async function saveJournalEntry(entry: import("@/types").JournalEntry) {
  await replaceOne("journal_entries", { date: entry.date }, entry as unknown as Record<string, unknown>)
}

export async function fetchInterviewTopics() {
  const items = await findMany<import("@/types").InterviewTopic>("interview_topics")
  return items
}

export async function updateInterviewTopic(id: string, data: Partial<import("@/types").InterviewTopic>) {
  await updateOne("interview_topics", id, data as unknown as Record<string, unknown>)
}

export async function fetchNotifications() {
  const items = await findMany<import("@/types").Notification>("notifications")
  return items
}

export async function addNotification(data: import("@/types").Notification) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("notifications", rest)
}

export async function markNotificationRead(id: string) {
  await updateOne("notifications", id, { read: true } as unknown as Record<string, unknown>)
}

export async function markAllNotificationsRead() {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("notifications").updateMany({ userId, read: false }, { $set: { read: true } })
}

export async function deleteNotification(id: string) {
  await deleteOne("notifications", id)
}

export async function fetchGamificationData() {
  const data = await findOne<import("@/types").GamificationData>("gamification")
  return data
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

export async function fetchDailyTasks() {
  const date = getTodayDateString()
  const items = await findMany<import("@/types").DailyTask>("daily_tasks", { date })
  return items
}

export async function saveDailyTasks(tasks: import("@/types").DailyTask[]) {
  const date = getTodayDateString()
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const col = db.collection("daily_tasks")

  await col.deleteMany({ userId, date })
  if (tasks.length > 0) {
    await col.insertMany(
      tasks.map((t) => ({ ...t, userId, date }))
    )
  }
}

export async function toggleDailyTask(taskId: string, completed: boolean, label: string, timeSpent: number, notes: string) {
  const date = getTodayDateString()
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("daily_tasks").updateOne(
    { userId, date, id: taskId },
    { $set: { label, completed, timeSpent, notes, updatedAt: new Date().toISOString() } },
    { upsert: true }
  )
}

export interface AnalyticsData {
  weeklyData: { day: string; study: number; coding: number; office: number; gym: number }[]
  monthlyData: { day: number; studyHours: number; codingHours: number; gymMinutes: number }[]
  radarData: { skill: string; value: number }[]
  heatmapData: { date: string; count: number }[]
  productivityData: { week: string; productivity: number }[]
  pieData: { name: string; value: number; color: string }[]
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const tasks = await db.collection("daily_tasks").find({ userId }).toArray()

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()

  const weeklyData = DAYS.map((day) => ({ day, study: 0, coding: 0, office: 0, gym: 0 }))
  const monthlyMap = new Map<number, { studyHours: number; codingHours: number; gymMinutes: number }>()
  const heatmapMap = new Map<string, number>()
  const categoryTotals: Record<string, { name: string; value: number; color: string }> = {
    gym: { name: "Gym", value: 0, color: "#22c55e" },
    office: { name: "Office", value: 0, color: "#3b82f6" },
    leetcode: { name: "LeetCode", value: 0, color: "#eab308" },
    reading: { name: "Reading", value: 0, color: "#f97316" },
    journal: { name: "Journal", value: 0, color: "#ec4899" },
    project: { name: "Project", value: 0, color: "#06b6d4" },
  }

  const typedTasks = tasks as unknown as Array<{ date: string; id: string; completed: boolean; timeSpent: number }>
  for (const t of typedTasks) {
    const d = new Date(t.date)
    const dayOfWeek = d.getDay()
    const dayOfMonth = d.getDate()

    if (t.completed) {
      const dayName = DAYS[dayOfWeek]
      const idx = weeklyData.findIndex((w) => w.day === dayName)
      if (idx !== -1) {
        if (t.id === "gym") weeklyData[idx].gym += t.timeSpent
        else if (t.id === "office") weeklyData[idx].office += t.timeSpent
        else if (["leetcode", "github", "project", "javascript", "react", "nodejs", "system-design"].includes(t.id)) weeklyData[idx].coding += t.timeSpent
        else weeklyData[idx].study += t.timeSpent
      }

      if (!monthlyMap.has(dayOfMonth)) monthlyMap.set(dayOfMonth, { studyHours: 0, codingHours: 0, gymMinutes: 0 })
      const m = monthlyMap.get(dayOfMonth)!
      if (t.id === "gym") m.gymMinutes += t.timeSpent
      else if (["leetcode", "github", "project", "javascript", "react", "nodejs", "system-design"].includes(t.id)) m.codingHours += t.timeSpent
      else m.studyHours += t.timeSpent
    }

    const dateKey = t.date
    heatmapMap.set(dateKey, (heatmapMap.get(dateKey) || 0) + (t.completed ? 1 : 0))

    if (t.completed && categoryTotals[t.id]) {
      categoryTotals[t.id].value += t.timeSpent
    }
  }

  const monthlyEntries = Array.from(monthlyMap.entries())
  const monthlyData = monthlyEntries
    .map(([day, val]) => ({ day, ...val }))
    .sort((a, b) => a.day - b.day)

  const heatmapEntries = Array.from(heatmapMap.entries())
  const heatmapData = heatmapEntries.map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))

  const totalCat = Object.values(categoryTotals).reduce((s, c) => s + c.value, 0) || 1
  const pieData = Object.values(categoryTotals).map((c) => ({ ...c, value: Math.round((c.value / totalCat) * 100) }))

  const radarData = [
    { skill: "DSA", value: 0 },
    { skill: "React", value: 0 },
    { skill: "Node.js", value: 0 },
    { skill: "System Design", value: 0 },
    { skill: "JavaScript", value: 0 },
    { skill: "Consistency", value: Math.min(typedTasks.filter((t) => t.completed).length * 5, 100) },
  ]

  const leetcodeCount = await db.collection("leetcode_problems").countDocuments({ userId })
  if (leetcodeCount > 0) radarData[0].value = Math.min(leetcodeCount * 5, 100)

  const productivityData = Array.from({ length: 7 }, (_, i) => {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - (6 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const weekKey = `W${7 - i}`

    const weekTasks = typedTasks.filter((t) => {
      const d = new Date(t.date)
      return d >= weekStart && d < weekEnd
    })
    const completed = weekTasks.filter((t) => t.completed).length
    const total = weekTasks.length || 1
    return { week: weekKey, productivity: Math.round((completed / total) * 100) }
  })

  return { weeklyData, monthlyData, radarData, heatmapData, productivityData, pieData }
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  const { name, email, password } = data

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const db = await (await import("@/lib/mongodb")).getDb()
  const existing = await db.collection("users").findOne({ email })
  if (existing) {
    return { error: "Email already in use" }
  }

  const bcrypt = await import("bcryptjs")
  const hashedPassword = await bcrypt.hash(password, 12)

  const result = await db.collection("users").insertOne({
    name,
    email,
    password: hashedPassword,
    emailVerified: null,
    image: null,
    createdAt: new Date(),
  })

  return {
    success: true,
    id: result.insertedId.toString(),
  }
}
