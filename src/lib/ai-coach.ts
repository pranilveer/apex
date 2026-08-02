import { getDb } from "@/lib/mongodb"

export interface CoachMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const CHAT_COLLECTION = "ai_chat"
const MAX_HISTORY = 50

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function loadChat(userId: string): Promise<CoachMessage[]> {
  const db = await getDb()
  const doc = await db.collection(CHAT_COLLECTION).findOne({ userId })
  const messages: CoachMessage[] = doc?.messages ?? []
  return messages.slice(-MAX_HISTORY)
}

export async function appendMessage(userId: string, msg: CoachMessage): Promise<void> {
  const db = await getDb()
  const col = db.collection(CHAT_COLLECTION)
  const doc = await col.findOne({ userId })
  const messages: CoachMessage[] = doc?.messages ?? []
  messages.push(msg)
  await col.updateOne(
    { userId },
    {
      $set: { messages: messages.slice(-MAX_HISTORY), updatedAt: new Date().toISOString() },
      $setOnInsert: { createdAt: new Date().toISOString() },
    },
    { upsert: true }
  )
}

export async function clearChat(userId: string): Promise<void> {
  const db = await getDb()
  await db.collection(CHAT_COLLECTION).updateOne(
    { userId },
    { $set: { messages: [], updatedAt: new Date().toISOString() } }
  )
}

const fmtDate = (d: unknown) => (typeof d === "string" ? d.slice(0, 10) : "-")

interface GoalDoc { title?: string; category?: string; priority?: string; targetDate?: string; currentValue?: number; targetValue?: number; unit?: string; description?: string; createdAt?: string }
interface HabitDoc { date?: string; habits?: Record<string, boolean> }
interface LeetCodeDoc { name?: string; difficulty?: string; topic?: string; solvedDate?: string; needsRevision?: boolean }
interface JournalDoc { date?: string; wins?: string; mistakes?: string; tomorrowPlan?: string; eveningReflection?: string; morningGoals?: string; mood?: string; energy?: number }
interface GitHubDoc { date?: string; commitCount?: number; hoursSpent?: number; repository?: string; featureBuilt?: string }
interface ProjectDoc { name?: string; status?: string; description?: string; tasks?: { status?: string }[]; updatedAt?: string }
interface JobDoc { role?: string; company?: string; status?: string; appliedDate?: string; archived?: boolean }
interface InterviewTopicDoc { label?: string; progress?: number; createdAt?: string }
interface DailyTaskDoc { date?: string; label?: string; completed?: boolean }
interface WishlistDoc { role?: string; company?: string; priority?: string; applied?: boolean; applicationDeadline?: string }

export async function buildContext(userId: string): Promise<string> {
  const db = await getDb()
  const q = { userId }

  const [goals, habits, leetcode, journals, github, projects, jobs, interviewTopics, dailyTasks, wishlist] =
    await Promise.all([
      db.collection("goals").find(q).sort({ createdAt: -1 }).limit(10).toArray() as Promise<GoalDoc[]>,
      db.collection("habits").find(q).sort({ date: -1 }).limit(30).toArray() as Promise<HabitDoc[]>,
      db.collection("leetcode_problems").find(q).sort({ solvedDate: -1 }).limit(60).toArray() as Promise<LeetCodeDoc[]>,
      db.collection("journal_entries").find(q).sort({ date: -1 }).limit(14).toArray() as Promise<JournalDoc[]>,
      db.collection("github_activities").find(q).sort({ date: -1 }).limit(30).toArray() as Promise<GitHubDoc[]>,
      db.collection("projects").find(q).sort({ updatedAt: -1 }).limit(10).toArray() as Promise<ProjectDoc[]>,
      db.collection("jobs").find(q).sort({ appliedDate: -1 }).limit(20).toArray() as Promise<JobDoc[]>,
      db.collection("interview_topics").find(q).sort({ createdAt: -1 }).limit(20).toArray() as Promise<InterviewTopicDoc[]>,
      db.collection("daily_tasks").find(q).sort({ date: -1 }).limit(14).toArray() as Promise<DailyTaskDoc[]>,
      db.collection("wishlist").find(q).sort({ applicationDeadline: 1 }).limit(10).toArray() as Promise<WishlistDoc[]>,
    ])

  const lines: string[] = []

  if (goals.length) {
    lines.push("## Goals")
    for (const g of goals) {
      lines.push(
        `- ${g.title} (${g.category ?? "uncategorized"}, ${g.priority ?? "medium"} priority, target ${fmtDate(g.targetDate)}): ${g.currentValue ?? 0}/${g.targetValue ?? 0} ${g.unit ?? ""}${g.description ? ` — ${g.description}` : ""}`
      )
    }
  }

  if (habits.length) {
    const recent = habits[0]
    const done = Object.entries(recent.habits ?? {}).filter(([, v]) => v).map(([k]) => k)
    lines.push(
      `## Habits (last entry ${fmtDate(recent.date)})`,
      `- Completed: ${done.length ? done.join(", ") : "none"}`
    )
  }

  if (leetcode.length) {
    const byDiff: Record<string, number> = {}
    for (const p of leetcode) { const d = p.difficulty ?? "Unknown"; byDiff[d] = (byDiff[d] ?? 0) + 1 }
    const needsRev = leetcode.filter((p) => p.needsRevision).length
    lines.push(
      "## LeetCode",
      `- Total solved in view: ${leetcode.length} (Easy ${byDiff.Easy ?? 0}, Medium ${byDiff.Medium ?? 0}, Hard ${byDiff.Hard ?? 0})`,
      `- Awaiting revision: ${needsRev}`,
      `- Recent: ${leetcode.slice(0, 12).map((p) => `${p.name} [${p.difficulty}/${p.topic ?? "?"}]`).join(", ")}`
    )
  }

  if (journals.length) {
    lines.push("## Journal (recent)")
    for (const j of journals.slice(0, 7)) {
      const bits = [
        j.wins ? `wins: ${j.wins}` : "",
        j.mistakes ? `mistakes: ${j.mistakes}` : "",
        j.tomorrowPlan ? `plan: ${j.tomorrowPlan}` : "",
        j.eveningReflection ? `reflection: ${j.eveningReflection}` : "",
      ].filter(Boolean)
      lines.push(`- ${fmtDate(j.date)} (mood: ${j.mood ?? "?"}/energy ${j.energy ?? "?"}): ${bits.join(" | ") || "no details"}`)
    }
  }

  if (github.length) {
    const totalCommits = github.reduce((s, g) => s + (g.commitCount ?? 0), 0)
    const totalHours = github.reduce((s, g) => s + (g.hoursSpent ?? 0), 0)
    lines.push(
      "## GitHub",
      `- Days tracked: ${github.length}, total commits: ${totalCommits}, hours: ${totalHours}`,
      `- Recent: ${github.slice(0, 8).map((g) => `${g.date}: ${g.commitCount}c in ${g.repository ?? "?"}${g.featureBuilt ? ` (${g.featureBuilt})` : ""}`).join("; ")}`
    )
  }

  if (projects.length) {
    lines.push("## Projects")
    for (const p of projects.slice(0, 6)) {
      const doneTasks = (p.tasks ?? []).filter((t) => t.status === "done").length
      lines.push(`- ${p.name} [${p.status ?? "?"}] (${doneTasks}/${(p.tasks ?? []).length} tasks done)${p.description ? ` — ${p.description}` : ""}`)
    }
  }

  if (jobs.length) {
    const active = jobs.filter((j) => !j.archived)
    lines.push("## Job applications")
    for (const j of active.slice(0, 10)) {
      lines.push(`- ${j.role} @ ${j.company} — ${j.status ?? "applied"}${j.appliedDate ? ` (applied ${fmtDate(j.appliedDate)})` : ""}`)
    }
  }

  if (interviewTopics.length) {
    lines.push(
      "## Interview prep",
      interviewTopics.map((t) => `- ${t.label}: ${t.progress ?? 0}%`).join("\n")
    )
  }

  if (dailyTasks.length) {
    const days = [...new Set(dailyTasks.map((t) => t.date))]
    lines.push(
      "## Daily tracking",
      `- Days tracked: ${days.length}, latest: ${fmtDate(dailyTasks[0]?.date)}`,
      `- Last day: ${dailyTasks.filter((t) => t.date === dailyTasks[0]?.date && t.completed).map((t) => t.label).join(", ") || "no tasks completed"}`
    )
  }

  if (wishlist.length) {
    lines.push("## Company wishlist")
    for (const w of wishlist.slice(0, 6)) {
      lines.push(`- ${w.role ?? "role"} @ ${w.company} — priority ${w.priority ?? "?"}${w.applied ? " (applied)" : ""}${w.applicationDeadline ? `, deadline ${fmtDate(w.applicationDeadline)}` : ""}`)
    }
  }

  if (lines.length === 0) {
    lines.push("No tracked data yet.")
  }

  return lines.join("\n")
}

export function buildSystemPrompt(context: string, userName: string | null): string {
  const greeting = userName ? ` The user's name is ${userName}; address them by name occasionally.` : ""
  return `You are Apex AI Coach, an expert, encouraging personal coach inside the user's productivity app (DailyTracker/Apex). The user is a software engineer preparing for product-company interviews.${greeting}

You are given a snapshot of the user's real tracked data below. Use it to give specific, actionable, personalized advice. When answering:
- Refer to the user's actual numbers, problems, goals, and entries whenever relevant.
- Be concise but concrete: short paragraphs, bullet points, and small tables are fine (use markdown).
- For LeetCode questions, suggest by topic/pattern and difficulty matching their weak areas.
- For job search, reference specific companies/applications and give next-step actions.
- Never invent data that is not in the snapshot; if something is missing say so briefly.
- Keep responses under ~500 words unless the user asks for detail.

Today's date: ${new Date().toISOString().slice(0, 10)}.

USER DATA SNAPSHOT:
${context}`
}
