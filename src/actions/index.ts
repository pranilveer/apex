"use server"

import { getUserId, findMany, findOne, insertOne, updateOne, deleteOne, replaceOne, findManyGlobal, countDocumentsGlobal, distinctGlobal } from "@/lib/db-actions"
import { generateId } from "@/lib/utils"
import { getTodayDateString, nextRevisionDateFor } from "@/lib/revision"
import { buildSnapshot, type GamificationInput, type GamificationSnapshot } from "@/lib/gamification"

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

export async function fetchLeetCodeQuestions(params: { search?: string; difficulty?: string; topic?: string; topics?: string[]; limit?: number; skip?: number; solved?: "all" | "solved" | "unsolved" } = {}): Promise<{ questions: import("@/types").LeetCodeQuestion[]; total: number }> {
  const { search, difficulty, topic, topics, limit = 50, skip = 0, solved = "all" } = params
  const query: Record<string, unknown> = {}
  if (search && search.trim()) {
    const q = search.trim()
    if (/^\d+$/.test(q)) {
      query.$or = [{ title: { $regex: q, $options: "i" } }, { frontendId: Number(q) }]
    } else {
      query.title = { $regex: q, $options: "i" }
    }
  }
  if (difficulty && difficulty !== "All") query.difficulty = difficulty
  if (topic && topic !== "All") query.topics = topic
  if (topics && topics.length > 0) query.topics = { $in: topics }

  if (solved && solved !== "all") {
    const userId = await getUserId()
    const db = await (await import("@/lib/mongodb")).getDb()
    const solvedDocs = await db
      .collection("leetcode_problems")
      .find({ userId, slug: { $exists: true, $ne: "" } })
      .project({ slug: 1 })
      .toArray()
    const solvedSlugs = [...new Set(solvedDocs.map((s) => s.slug as string).filter(Boolean))]
    if (solved === "solved") {
      if (solvedSlugs.length === 0) return { questions: [], total: 0 }
      query.slug = { $in: solvedSlugs }
    } else {
      query.slug = { $nin: solvedSlugs }
    }
  }

  const [questions, total] = await Promise.all([
    findManyGlobal<import("@/types").LeetCodeQuestion>("leetcode_questions", query, { frontendId: 1 }, limit, skip),
    countDocumentsGlobal("leetcode_questions", query),
  ])
  return { questions, total }
}

export async function fetchLeetCodeTopics(): Promise<string[]> {
  const topics = await distinctGlobal("leetcode_questions", "topics")
  return topics.filter(Boolean).sort((a, b) => a.localeCompare(b))
}

export async function fetchLeetCodeTopicCounts(): Promise<{ topic: string; count: number }[]> {
  const db = await (await import("@/lib/mongodb")).getDb()
  const res = await db.collection("leetcode_questions").aggregate([
    { $unwind: "$topics" },
    { $group: { _id: "$topics", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray()
  return res.map((r) => ({ topic: r._id as string, count: r.count as number }))
}

export async function fetchLeetCodePatternTotals(): Promise<Record<string, number>> {
  const { PATTERN_TOPICS } = await import("@/lib/revision")
  const db = await (await import("@/lib/mongodb")).getDb()
  const col = db.collection("leetcode_questions")
  const entries = Object.entries(PATTERN_TOPICS)
  const counts = await Promise.all(entries.map(([, tlist]) => col.countDocuments({ topics: { $in: tlist } })))
  const out: Record<string, number> = {}
  entries.forEach(([pattern], i) => {
    out[pattern] = counts[i]
  })
  return out
}

export async function fetchLeetCodeQuestionById(id: string): Promise<import("@/types").LeetCodeQuestion | null> {
  const { ObjectId } = await import("mongodb")
  if (!ObjectId.isValid(id)) throw new Error("Invalid question id")
  const db = await (await import("@/lib/mongodb")).getDb()
  const doc = await db.collection("leetcode_questions").findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return { id, ...rest } as unknown as import("@/types").LeetCodeQuestion
}

export async function fetchDailyLeetCodeSolved(): Promise<import("@/types").LeetCodeProblem[]> {
  const date = getTodayDateString()
  return findMany<import("@/types").LeetCodeProblem>("leetcode_problems", { solvedDate: date })
}

export async function fetchRandomUnsolvedLeetCodeQuestion(): Promise<import("@/types").LeetCodeQuestion | null> {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const solved = await db.collection("leetcode_problems").find({ userId, slug: { $exists: true, $ne: "" } }).project({ slug: 1 }).toArray()
  const excluded = [...new Set(solved.map((s) => s.slug).filter(Boolean))]
  const query: Record<string, unknown> = excluded.length > 0 ? { slug: { $nin: excluded } } : {}
  const total = await countDocumentsGlobal("leetcode_questions", query)
  if (total === 0) return null

  const docs = await db.collection("leetcode_questions").aggregate([
    { $match: query },
    { $sample: { size: 1 } },
  ]).toArray()
  if (docs.length === 0) return null
  const { _id, ...rest } = docs[0] as unknown as Record<string, unknown>
  return { id: String(_id), ...rest } as unknown as import("@/types").LeetCodeQuestion
}

export async function markLeetCodeQuestionSolved(
  questionId: string,
  data: { timeTaken?: number; notes?: string; confidence?: number; mistakes?: import("@/types").MistakeType[]; pattern?: string } = {}
): Promise<import("@/types").LeetCodeProblem | null> {
  const question = await fetchLeetCodeQuestionById(questionId)
  if (!question) throw new Error("Question not found")
  const date = getTodayDateString()

  const existing = await findOne<import("@/types").LeetCodeProblem>("leetcode_problems", { slug: question.slug })
  if (existing) {
    const history: import("@/types").AttemptRecord[] = Array.isArray(existing.attemptHistory) ? existing.attemptHistory : []
    const last = history[history.length - 1]
    const alreadyLogged = last && last.type === "solved" && last.date === date
    const attemptHistory = alreadyLogged ? history : [...history, { type: "solved" as const, date, confidence: data.confidence ?? existing.confidence }]
    await updateOne("leetcode_problems", existing.id, {
      timeTaken: data.timeTaken ?? existing.timeTaken,
      notes: data.notes ?? existing.notes,
      confidence: data.confidence ?? existing.confidence,
      mistakes: data.mistakes ?? existing.mistakes ?? [],
      pattern: data.pattern ?? existing.pattern,
      attemptHistory,
      updatedAt: new Date().toISOString(),
    } as unknown as Record<string, unknown>)
    return {
      ...existing,
      timeTaken: data.timeTaken ?? existing.timeTaken,
      notes: data.notes ?? existing.notes,
      confidence: data.confidence ?? existing.confidence,
      mistakes: data.mistakes ?? existing.mistakes ?? [],
      pattern: data.pattern ?? existing.pattern,
      attemptHistory,
    }
  }

  const confidence = data.confidence ?? 3
  const problem: import("@/types").LeetCodeProblem = {
    id: generateId(),
    name: question.title,
    difficulty: question.difficulty,
    topic: question.topics[0] || "",
    pattern: data.pattern ?? "",
    solvedDate: date,
    timeTaken: data.timeTaken ?? 0,
    needsRevision: false,
    companyTags: [],
    notes: data.notes ?? "",
    slug: question.slug,
    frontendId: question.frontendId,
    revisionCount: 0,
    lastRevisionDate: date,
    confidence,
    mistakes: data.mistakes ?? [],
    attemptHistory: [{ type: "solved", date, confidence }],
    nextRevisionDate: nextRevisionDateFor(date, 0, confidence),
  }
  const rest = { ...problem } as unknown as Record<string, unknown>
  delete rest.id
  await insertOne("leetcode_problems", rest)
  return problem
}

export async function markRevision(problemId: string, confidence: number): Promise<import("@/types").LeetCodeProblem | null> {
  const { ObjectId } = await import("mongodb")
  if (!ObjectId.isValid(problemId)) throw new Error("Invalid problem id")
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const col = db.collection("leetcode_problems")
  const doc = await col.findOne({ _id: new ObjectId(problemId), userId })
  if (!doc) throw new Error("Problem not found")
  const date = getTodayDateString()
  const revisionCount = ((doc.revisionCount as number) ?? 0) + 1
  const history: import("@/types").AttemptRecord[] = Array.isArray(doc.attemptHistory) ? doc.attemptHistory : []
  const attemptHistory = [...history, { type: "revision", date, confidence }]
  const nextRevisionDate = nextRevisionDateFor(date, revisionCount, confidence)
  await col.updateOne(
    { _id: doc._id },
    {
      $set: {
        revisionCount,
        lastRevisionDate: date,
        confidence,
        nextRevisionDate,
        attemptHistory,
        needsRevision: false,
        updatedAt: new Date().toISOString(),
      },
    }
  )
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return {
    ...rest,
    id: String(_id),
    revisionCount,
    lastRevisionDate: date,
    confidence,
    nextRevisionDate,
    attemptHistory,
    needsRevision: false,
  } as unknown as import("@/types").LeetCodeProblem
}

export async function updateLeetCodeNotes(problemId: string, notes: string) {
  await updateOne("leetcode_problems", problemId, { notes } as unknown as Record<string, unknown>)
}

export async function updateLeetCodeConfidence(problemId: string, confidence: number) {
  await updateOne("leetcode_problems", problemId, { confidence } as unknown as Record<string, unknown>)
}

export async function updateLeetCodeMistakes(problemId: string, mistakes: import("@/types").MistakeType[]) {
  await updateOne("leetcode_problems", problemId, { mistakes } as unknown as Record<string, unknown>)
}

export async function updateLeetCodePattern(problemId: string, pattern: string) {
  await updateOne("leetcode_problems", problemId, { pattern } as unknown as Record<string, unknown>)
}

export async function updateLeetCodeCompanyTags(problemId: string, companyTags: string[]) {
  await updateOne("leetcode_problems", problemId, { companyTags } as unknown as Record<string, unknown>)
}

export async function toggleLeetCodeBookmark(problemId: string, key: import("@/types").BookmarkKey): Promise<boolean> {
  const { ObjectId } = await import("mongodb")
  if (!ObjectId.isValid(problemId)) throw new Error("Invalid problem id")
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const col = db.collection("leetcode_problems")
  const doc = await col.findOne({ _id: new ObjectId(problemId), userId }, { projection: { [key]: 1 } })
  const current = Boolean(doc?.[key])
  await col.updateOne({ _id: new ObjectId(problemId), userId }, { $set: { [key]: !current, updatedAt: new Date().toISOString() } })
  return !current
}

export async function fetchDailyChallenge(): Promise<{
  easy: import("@/types").LeetCodeQuestion | null
  medium: import("@/types").LeetCodeQuestion | null
  hard: import("@/types").LeetCodeQuestion | null
  revision: import("@/types").LeetCodeProblem | null
}> {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const solved = await db.collection("leetcode_problems").find({ userId, slug: { $exists: true, $ne: "" } }).project({ slug: 1 }).toArray()
  const excluded = [...new Set(solved.map((s) => s.slug).filter(Boolean))]
  const nin = excluded.length > 0 ? { slug: { $nin: excluded } } : {}

  const pick = async (difficulty: string) => {
    const docs = await db.collection("leetcode_questions").aggregate([
      { $match: { ...nin, difficulty } },
      { $sample: { size: 1 } },
    ]).toArray()
    if (docs.length === 0) return null
    const { _id, ...rest } = docs[0] as unknown as Record<string, unknown>
    return { id: String(_id), ...rest } as unknown as import("@/types").LeetCodeQuestion
  }

  const today = getTodayDateString()
  const due = await db.collection("leetcode_problems").find({ userId, nextRevisionDate: { $lte: today }, lastRevisionDate: { $ne: today } }).toArray()
  let revision: import("@/types").LeetCodeProblem | null = null
  if (due.length > 0) {
    const chosen = due[Math.floor(Math.random() * due.length)]
    const { _id, ...rest } = chosen as unknown as Record<string, unknown>
    revision = { ...rest, id: String(_id) } as unknown as import("@/types").LeetCodeProblem
  }

  const [easy, medium, hard] = await Promise.all([pick("Easy"), pick("Medium"), pick("Hard")])
  return { easy, medium, hard, revision }
}

export async function fetchQuestionsByTopics(params: { topics?: string[]; difficulty?: string; excludeSolved?: boolean; limit?: number } = {}): Promise<{ questions: import("@/types").LeetCodeQuestion[]; total: number }> {
  const { topics = [], difficulty, excludeSolved, limit = 10 } = params
  const query: Record<string, unknown> = {}
  if (topics.length > 0) query.topics = { $in: topics }
  if (difficulty && difficulty !== "All") query.difficulty = difficulty
  if (excludeSolved) {
    const userId = await getUserId()
    const db = await (await import("@/lib/mongodb")).getDb()
    const solved = await db.collection("leetcode_problems").find({ userId, slug: { $exists: true, $ne: "" } }).project({ slug: 1 }).toArray()
    const excluded = [...new Set(solved.map((s) => s.slug).filter(Boolean))]
    if (excluded.length > 0) query.slug = { $nin: excluded }
  }
  const [questions, total] = await Promise.all([
    findManyGlobal<import("@/types").LeetCodeQuestion>("leetcode_questions", query, { frontendId: 1 }, limit, 0),
    countDocumentsGlobal("leetcode_questions", query),
  ])
  return { questions, total }
}

export async function fetchLeetCodeJournals(): Promise<import("@/types").LeetCodeJournal[]> {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const docs = await db.collection("leetcode_journals").find({ userId }).sort({ date: -1 }).toArray()
  return docs.map(({ _id, ...rest }) => ({ ...rest, id: String(_id) })) as unknown as import("@/types").LeetCodeJournal[]
}

export async function saveLeetCodeJournal(entry: import("@/types").LeetCodeJournal) {
  const { id: _id, ...rest } = entry
  void _id
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("leetcode_journals").updateOne(
    { userId, date: entry.date },
    { $set: { ...rest, updatedAt: new Date().toISOString() } },
    { upsert: true }
  )
}

export async function fetchGitHubActivities() {
  const items = await findMany<import("@/types").GitHubActivity>("github_activities")
  return items
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

export async function updateJob(id: string, data: Partial<import("@/types").JobApplication>) {
  await updateOne("jobs", id, data as unknown as Record<string, unknown>)
}

export async function updateJobStatus(id: string, status: string) {
  await updateOne("jobs", id, { status } as unknown as Record<string, unknown>)
}

export async function deleteJob(id: string) {
  await deleteOne("jobs", id)
}

export async function addStatusHistory(jobId: string, entry: import("@/types").StatusHistoryEntry) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId },
    { $push: { statusHistory: entry }, $set: { updatedAt: new Date().toISOString() } } as Record<string, unknown>
  )
}

export async function addInterview(jobId: string, interview: import("@/types").Interview) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId },
    { $push: { interviews: interview }, $set: { updatedAt: new Date().toISOString() } } as Record<string, unknown>
  )
}

export async function updateInterview(jobId: string, interviewId: string, data: Partial<import("@/types").Interview>) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  for (const [key, val] of Object.entries(data)) {
    updates[`interviews.$.${key}`] = val
  }
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId, "interviews.id": interviewId },
    { $set: updates } as Record<string, unknown>
  )
}

export async function deleteInterview(jobId: string, interviewId: string) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId },
    { $pull: { interviews: { id: interviewId } }, $set: { updatedAt: new Date().toISOString() } } as Record<string, unknown>
  )
}

export async function addFollowUp(jobId: string, followUp: import("@/types").FollowUp) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId },
    { $push: { followUps: followUp }, $set: { updatedAt: new Date().toISOString() } } as Record<string, unknown>
  )
}

export async function updateFollowUp(jobId: string, followUpId: string, data: Partial<import("@/types").FollowUp>) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  await db.collection("jobs").updateOne(
    { _id: new ObjectId(jobId), userId, "followUps.id": followUpId },
    { $set: Object.entries(data).reduce((acc, [key, val]) => ({ ...acc, [`followUps.$.${key}`]: val }), { updatedAt: new Date().toISOString() as string } as Record<string, unknown>) } as Record<string, unknown>
  )
}

export async function fetchWishlist() {
  const items = await findMany<import("@/types").WishlistCompany>("wishlist")
  return items
}

export async function addWishlist(data: import("@/types").WishlistCompany) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("wishlist", rest)
}

export async function updateWishlist(id: string, data: Partial<import("@/types").WishlistCompany>) {
  await updateOne("wishlist", id, data as unknown as Record<string, unknown>)
}

export async function deleteWishlist(id: string) {
  await deleteOne("wishlist", id)
}

export async function fetchJobGoals() {
  const items = await findMany<import("@/types").JobGoal>("job_goals")
  return items
}

export async function addJobGoal(data: import("@/types").JobGoal) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("job_goals", rest)
}

export async function updateJobGoal(id: string, data: Partial<import("@/types").JobGoal>) {
  await updateOne("job_goals", id, data as unknown as Record<string, unknown>)
}

export async function deleteJobGoal(id: string) {
  await deleteOne("job_goals", id)
}

export async function fetchInterviewLearnings() {
  const items = await findMany<import("@/types").InterviewLearning>("interview_learnings")
  return items
}

export async function addInterviewLearning(data: import("@/types").InterviewLearning) {
  const rest = { ...data } as unknown as Record<string, unknown>
  delete rest.id
  return insertOne("interview_learnings", rest)
}

export async function deleteInterviewLearning(id: string) {
  await deleteOne("interview_learnings", id)
}

export async function duplicateJob(id: string) {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  const { ObjectId } = await import("mongodb")
  const original = await db.collection("jobs").findOne({ _id: new ObjectId(id), userId })
  if (!original) throw new Error("Job not found")
  const { _id, ...rest } = original as unknown as Record<string, unknown>
  const dup = { ...rest, id: generateId(), appliedDate: new Date().toISOString().split("T")[0], status: "applied", statusHistory: [], interviews: [], followUps: [], archived: false, createdAt: new Date().toISOString() }
  await db.collection("jobs").insertOne(dup)
}

export async function archiveJob(id: string) {
  await updateOne("jobs", id, { archived: true } as unknown as Record<string, unknown>)
}

export async function exportJobsCSV() {
  const jobs = await fetchJobs()
  const headers = ["Company", "Role", "Status", "Applied Date", "Location", "Work Mode", "Source", "Expected Salary", "Offered Salary", "Recruiter Name", "Recruiter Email", "Notes"]
  const rows = jobs.map((j) => [j.company, j.role, j.status, j.appliedDate, j.location, j.workMode, j.source, j.expectedSalary.toString(), j.salaryOffered.toString(), j.recruiterName, j.recruiterEmail, `"${j.notes.replace(/"/g, '""')}"`])
  return [headers, ...rows].map((r) => r.join(",")).join("\n")
}

export async function exportJobsJSON() {
  const jobs = await fetchJobs()
  return JSON.stringify(jobs, null, 2)
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

export async function addNotification(data: { title: string; message: string; type: string }) {
  return insertOne("notifications", {
    title: data.title,
    message: data.message,
    type: data.type,
    time: new Date().toISOString(),
    read: false,
  })
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

export async function deleteAllNotifications() {
  const userId = await getUserId()
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("notifications").deleteMany({ userId })
}

export async function fetchReminderSettings() {
  const doc = await findOne<{ settings: import("@/types").ReminderSetting[]; timeZone?: string }>("reminder_settings")
  return doc ?? null
}

export async function saveReminderSettings(settings: import("@/types").ReminderSetting[], timeZone?: string) {
  await replaceOne("reminder_settings", {}, { settings, timeZone })
}

export async function syncNotifications(timeZone?: string): Promise<number> {
  const userId = await getUserId()
  const { generateNotificationsForUser } = await import("@/lib/notifications")
  return generateNotificationsForUser(userId, timeZone)
}

async function buildGamificationSnapshot(userId: string): Promise<GamificationSnapshot> {
  const db = await (await import("@/lib/mongodb")).getDb()

  const [leetcodeProblems, habits, dailyTasks, githubActivities, journalEntries, projects, goals, interviewTopics, gamificationDoc] = await Promise.all([
    db.collection("leetcode_problems").find({ userId }).toArray(),
    db.collection("habits").find({ userId }).toArray(),
    db.collection("daily_tasks").find({ userId }).toArray(),
    db.collection("github_activities").find({ userId }).toArray(),
    db.collection("journal_entries").find({ userId }).toArray(),
    db.collection("projects").find({ userId }).toArray(),
    db.collection("goals").find({ userId }).toArray(),
    db.collection("interview_topics").find({ userId }).toArray(),
    db.collection("gamification").findOne({ userId }),
  ])

  const stripId = <T>(doc: unknown): T => {
    const { _id, ...rest } = doc as Record<string, unknown>
    return { ...rest, id: String(_id) } as T
  }

  const input: GamificationInput = {
    leetcodeProblems: leetcodeProblems.map((d) => stripId<import("@/types").LeetCodeProblem>(d)),
    habits: habits.map((d) => stripId<import("@/types").HabitEntry>(d)),
    dailyTasks: dailyTasks.map((d) => stripId<import("@/types").DailyTask>(d)),
    githubActivities: githubActivities.map((d) => stripId<import("@/types").GitHubActivity>(d)),
    journalEntries: journalEntries.map((d) => stripId<import("@/types").JournalEntry>(d)),
    projects: projects.map((d) => stripId<import("@/types").Project & { createdAt?: string; updatedAt?: string }>(d)),
    goals: goals.map((d) => stripId<import("@/types").Goal & { createdAt?: string; updatedAt?: string }>(d)),
    interviewTopics: interviewTopics.map((d) => stripId<import("@/types").InterviewTopic>(d)),
    badgeAwards: (gamificationDoc?.badgeAwards as Record<string, string> | undefined) ?? {},
  }

  const snapshot = buildSnapshot(input)
  return {
    ...snapshot,
    storedLevel: Number(gamificationDoc?.level ?? 0),
    lastUpdatedAt: gamificationDoc?.updatedAt as string | undefined,
  }
}

export async function fetchGamificationData() {
  const userId = await getUserId()
  return buildGamificationSnapshot(userId)
}

export async function updateGamification(): Promise<GamificationSnapshot> {
  const userId = await getUserId()
  const snapshot = await buildGamificationSnapshot(userId)
  const db = await (await import("@/lib/mongodb")).getDb()
  await db.collection("gamification").updateOne(
    { userId },
    {
      $set: {
        xp: snapshot.xp,
        level: snapshot.level,
        currentStreak: snapshot.currentStreak,
        longestStreak: snapshot.longestStreak,
        dailyScore: snapshot.dailyScore,
        badges: snapshot.badges,
        badgeAwards: snapshot.badgeAwards,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  )
  return snapshot
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
  const tasks = (await db.collection("daily_tasks").find({ userId }).toArray()).map(({ _id, ...rest }) => rest)

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
