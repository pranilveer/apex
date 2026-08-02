import { getDb } from "@/lib/mongodb"
import { addDays } from "@/lib/revision"
import type { ReminderSetting } from "@/types"

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
