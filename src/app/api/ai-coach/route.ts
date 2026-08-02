import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"
import { getUserId } from "@/lib/db-actions"
import { getDb } from "@/lib/mongodb"
import { appendMessage, buildContext, buildSystemPrompt, clearChat, loadChat, newId, type CoachMessage } from "@/lib/ai-coach"

export const runtime = "nodejs"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const MAX_CONTEXT = 16

async function authorize(): Promise<string | null> {
  try {
    return await getUserId()
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await authorize()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const messages = await loadChat(userId)
  return Response.json({ messages })
}

export async function DELETE() {
  const userId = await authorize()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })
  await clearChat(userId)
  return Response.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const userId = await authorize()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY_NOT_CONFIGURED" }, { status: 500 })
  }

  let body: { message?: unknown; history?: unknown } | null = null
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userMessage = typeof body?.message === "string" ? body.message.trim() : ""
  if (!userMessage) {
    return Response.json({ error: "MESSAGE_REQUIRED" }, { status: 400 })
  }

  const history: CoachMessage[] = Array.isArray(body?.history)
    ? (body.history as CoachMessage[]).slice(-MAX_CONTEXT)
    : []

  const db = await getDb()
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
  const userName = user?.name ?? null

  const [context, userMsg] = await Promise.all([
    buildContext(userId),
    Promise.resolve<CoachMessage>({
      id: newId(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    }),
  ])

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: buildSystemPrompt(context, userName) },
    ...history.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.content })),
    { role: "user", content: userMessage },
  ]

  let groqRes: Response
  try {
    groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    })
  } catch (err) {
    console.error("AI coach: Groq fetch failed", err)
    return Response.json({ error: "GROQ_NETWORK_ERROR" }, { status: 502 })
  }

  if (!groqRes.ok) {
    const detail = await groqRes.text().catch(() => "")
    console.error("AI coach: Groq error", groqRes.status, detail)
    return Response.json({ error: "GROQ_ERROR", status: groqRes.status }, { status: 502 })
  }

  await appendMessage(userId, userMsg)

  const groqStream = groqRes.body
  if (!groqStream) {
    return Response.json({ error: "GROQ_EMPTY_RESPONSE" }, { status: 502 })
  }

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let pending = ""

  const toText = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      pending += decoder.decode(chunk, { stream: true })
      const lines = pending.split("\n")
      pending = lines.pop() ?? ""
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue
        const data = trimmed.slice(5).trim()
        if (data === "[DONE]") continue
        try {
          const json = JSON.parse(data)
          const delta: string | undefined = json.choices?.[0]?.delta?.content
          if (delta) controller.enqueue(encoder.encode(delta))
        } catch {
          // partial/invalid frame, ignore
        }
      }
    },
    flush(controller) {
      const trimmed = pending.trim()
      pending = ""
      if (!trimmed.startsWith("data:")) return
      const data = trimmed.slice(5).trim()
      if (data === "[DONE]") return
      try {
        const json = JSON.parse(data)
        const delta: string | undefined = json.choices?.[0]?.delta?.content
        if (delta) controller.enqueue(encoder.encode(delta))
      } catch {
        // ignore
      }
    },
  })

  const [clientStream, saveStream] = groqStream.pipeThrough(toText).tee()

  void (async () => {
    const reader = saveStream.getReader()
    let content = ""
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        content += new TextDecoder().decode(value)
      }
    } catch {
      // client aborted mid-stream; still save what we got
    } finally {
      if (content) {
        await appendMessage(userId, {
          id: newId(),
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
        })
      }
    }
  })()

  return new Response(clientStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
