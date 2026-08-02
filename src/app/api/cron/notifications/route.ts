import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { generateNotificationsForAllUsers } = await import("@/lib/notifications")
  try {
    const created = await generateNotificationsForAllUsers()
    return NextResponse.json({ ok: true, created })
  } catch (error) {
    console.error("Cron notification sync failed", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
