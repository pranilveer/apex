"use server"

import { getUserId, findMany, findOne, insertOne, updateOne, deleteOne, replaceOne } from "@/lib/db-actions"

export async function fetchGoals() {
  const items = await findMany<import("@/types").Goal>("goals")
  return items
}

export async function addGoal(data: import("@/types").Goal) {
  const { id, ...rest } = data
  return insertOne("goals", rest as unknown as Record<string, unknown>)
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
  const { id, ...rest } = data
  return insertOne("leetcode_problems", rest as unknown as Record<string, unknown>)
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
  const { id, ...rest } = data
  return insertOne("github_activities", rest as unknown as Record<string, unknown>)
}

export async function deleteGitHubActivity(id: string) {
  await deleteOne("github_activities", id)
}

export async function fetchProjects() {
  const items = await findMany<import("@/types").Project>("projects")
  return items
}

export async function addProject(data: import("@/types").Project) {
  const { id, ...rest } = data
  return insertOne("projects", rest as unknown as Record<string, unknown>)
}

export async function updateProject(id: string, data: Partial<import("@/types").Project>) {
  await updateOne("projects", id, data as unknown as Record<string, unknown>)
}

export async function fetchJobs() {
  const items = await findMany<import("@/types").JobApplication>("jobs")
  return items
}

export async function addJob(data: import("@/types").JobApplication) {
  const { id, ...rest } = data
  return insertOne("jobs", rest as unknown as Record<string, unknown>)
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
  const { id, ...rest } = data
  return insertOne("resumes", rest as unknown as Record<string, unknown>)
}

export async function setDefaultResume(id: string) {
  const userId = await getUserId()
  const col = (await import("@/lib/db-actions")).getCollection
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
  const { id, ...rest } = data
  return insertOne("resources", rest as unknown as Record<string, unknown>)
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
  const { id, ...rest } = data
  return insertOne("notifications", rest as unknown as Record<string, unknown>)
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
