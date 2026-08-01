"use server"

import { getDb } from "@/lib/mongodb"
import { getUserId } from "@/lib/db-actions"
import { generateId } from "@/lib/utils"
import { nextRevisionDateFor } from "@/lib/revision"
import { fetchRecentAcSubmissions, fetchUserProfile, dateStrFromTimestamp } from "@/lib/leetcode"
import type { LeetCodeAccount, LeetCodeProblem } from "@/types"

const SYNC_INTERVAL_MS = 10 * 60 * 1000

interface SyncResult {
  added: number
  total: number
  skipped: boolean
  message: string
}

export async function getLeetCodeAccount(): Promise<LeetCodeAccount | null> {
  const userId = await getUserId()
  const db = await getDb()
  const doc = await db.collection("leetcode_accounts").findOne({ userId })
  if (!doc) return null
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return { ...rest, id: String(_id) } as unknown as LeetCodeAccount
}

export async function saveLeetCodeAccount(username: string): Promise<LeetCodeAccount> {
  const userId = await getUserId()
  const name = username.trim()
  if (!name) throw new Error("Please enter your LeetCode username")
  const valid = await fetchUserProfile(name)
  if (!valid) throw new Error("LeetCode username not found. Make sure your profile is public.")

  const db = await getDb()
  await db.collection("leetcode_accounts").updateOne(
    { userId },
    { $set: { username: name, lastError: "", updatedAt: new Date().toISOString() } },
    { upsert: true }
  )
  const updated = await getLeetCodeAccount()
  if (!updated) throw new Error("Failed to save LeetCode account")
  return updated
}

export async function disconnectLeetCodeAccount(): Promise<{ ok: boolean }> {
  const userId = await getUserId()
  const db = await getDb()
  await db.collection("leetcode_accounts").deleteOne({ userId })
  return { ok: true }
}

export async function syncLeetCodeSolutions(timeZone?: string): Promise<SyncResult> {
  const userId = await getUserId()
  const db = await getDb()
  const account = await db.collection("leetcode_accounts").findOne({ userId })
  if (!account) throw new Error("No LeetCode account connected")

  const now = Date.now()
  const lastSyncAt = account.lastSyncAt ? new Date(account.lastSyncAt as string).getTime() : 0
  if (now - lastSyncAt < SYNC_INTERVAL_MS) {
    return { added: 0, total: 0, skipped: true, message: "Already synced recently" }
  }

  try {
    const submissions = await fetchRecentAcSubmissions(account.username as string, 20)

    const solved = await db
      .collection("leetcode_problems")
      .find({ userId, slug: { $exists: true, $ne: "" } })
      .project({ slug: 1 })
      .toArray()
    const existingSlugs = new Set(solved.map((s) => s.slug as string).filter(Boolean))
    const candidates = submissions.filter((s) => !existingSlugs.has(s.titleSlug))

    let added = 0
    for (const sub of candidates) {
      const question = await db.collection("leetcode_questions").findOne({ slug: sub.titleSlug })
      if (!question) continue
      const date = dateStrFromTimestamp(sub.timestamp, timeZone)
      const problem: LeetCodeProblem = {
        id: generateId(),
        name: question.title as string,
        difficulty: question.difficulty as LeetCodeProblem["difficulty"],
        topic: Array.isArray(question.topics) ? (question.topics[0] as string) ?? "" : "",
        pattern: "",
        solvedDate: date,
        timeTaken: 0,
        needsRevision: false,
        companyTags: [],
        notes: "",
        slug: sub.titleSlug,
        frontendId: question.frontendId as number | undefined,
        revisionCount: 0,
        lastRevisionDate: date,
        confidence: 3,
        mistakes: [],
        attemptHistory: [{ type: "solved", date, confidence: 3 }],
        nextRevisionDate: nextRevisionDateFor(date, 0, 3),
      }
      const { id, ...rest } = problem
      await db
        .collection("leetcode_problems")
        .insertOne({ ...rest, userId, createdAt: new Date().toISOString() })
      added++
    }

    await db.collection("leetcode_accounts").updateOne(
      { userId },
      {
        $set: {
          lastSyncAt: new Date().toISOString(),
          lastError: "",
          syncedSlugs: candidates.map((c) => c.titleSlug),
          updatedAt: new Date().toISOString(),
        },
      }
    )
    return {
      added,
      total: submissions.length,
      skipped: false,
      message: added > 0 ? `Imported ${added} solved question${added > 1 ? "s" : ""}` : "No new solved questions found",
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed"
    await db.collection("leetcode_accounts").updateOne(
      { userId },
      { $set: { lastError: msg, updatedAt: new Date().toISOString() } }
    )
    throw new Error(msg)
  }
}
