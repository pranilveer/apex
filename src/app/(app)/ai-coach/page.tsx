"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Brain, Sparkles, Send, TrendingUp, Code2, BookOpen, Target, MessageSquare, BarChart3, Square, Trash2, AlertTriangle, User, Bot, Maximize2, Minimize2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const prompts = [
  { label: "Daily Analysis", icon: BarChart3, prompt: "Analyze my productivity today and suggest improvements" },
  { label: "LeetCode Coach", icon: Code2, prompt: "Suggest LeetCode problems based on my weak topics" },
  { label: "System Design", icon: BookOpen, prompt: "Suggest system design topics I should study" },
  { label: "Interview Prep", icon: Target, prompt: "Generate interview questions for my next interview" },
  { label: "Journal Review", icon: MessageSquare, prompt: "Review my journal and provide insights" },
  { label: "GitHub Analysis", icon: TrendingUp, prompt: "Analyze my GitHub activity and suggest improvements" },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{part.slice(1, -1)}</code>
    }
    return part
  })
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let list: { text: string; numbered: boolean }[] = []
  let table: string[][] = []

  const flushList = (key: string) => {
    if (list.length === 0) return
    const numbered = list[0].numbered
    elements.push(
      numbered ? (
        <ol key={key} className="my-1 space-y-0.5 text-sm">
          {list.map((item, i) => <li key={i} className="ml-5 list-decimal">{renderInline(item.text)}</li>)}
        </ol>
      ) : (
        <ul key={key} className="my-1 space-y-0.5 text-sm">
          {list.map((item, i) => <li key={i} className="ml-5 list-disc">{renderInline(item.text)}</li>)}
        </ul>
      )
    )
    list = []
  }

  const flushTable = (key: string) => {
    if (table.length < 2) { table = []; return }
    elements.push(
      <div key={key} className="my-2 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr>{table[0].map((c, i) => <th key={i} className="border-b border-border bg-muted/50 px-2 py-1.5 text-left font-medium">{c}</th>)}</tr>
          </thead>
          <tbody>
            {table.slice(1).map((row, ri) => (
              <tr key={ri}>{row.map((c, ci) => <td key={ci} className="border-b border-border/60 px-2 py-1.5">{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    table = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("## ")) {
      flushList(`l${elements.length}`); flushTable(`t${elements.length}`)
      elements.push(<h2 key={elements.length} className="mt-3 mb-1 text-base font-bold">{trimmed.replace(/^#+\s*/, "")}</h2>)
    } else if (trimmed.startsWith("# ")) {
      flushList(`l${elements.length}`); flushTable(`t${elements.length}`)
      elements.push(<h3 key={elements.length} className="mt-2 mb-1 text-lg font-bold">{trimmed.replace(/^#+\s*/, "")}</h3>)
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushTable(`t${elements.length}`)
      list.push({ text: trimmed.replace(/^[-*]\s*/, ""), numbered: false })
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushTable(`t${elements.length}`)
      list.push({ text: trimmed.replace(/^\d+\.\s*/, ""), numbered: true })
    } else if (trimmed.startsWith("|")) {
      flushList(`l${elements.length}`)
      const cells = trimmed.split("|").slice(1, -1).map((c) => c.trim())
      if (cells.length && cells.every((c) => c.match(/^[-:]+$/))) continue
      if (cells.length) table.push(cells)
    } else if (trimmed === "") {
      flushList(`l${elements.length}`); flushTable(`t${elements.length}`)
      elements.push(<div key={elements.length} className="h-2" />)
    } else {
      flushList(`l${elements.length}`); flushTable(`t${elements.length}`)
      elements.push(<p key={elements.length} className="text-sm leading-relaxed">{renderInline(line)}</p>)
    }
  }
  flushList(`l${elements.length}`); flushTable(`t${elements.length}`)

  return <div className="max-w-none space-y-1">{elements}</div>
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [needsKey, setNeedsKey] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [fullChat, setFullChat] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<Message[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    if (fullChat) inputRef.current?.focus()
  }, [fullChat])

  useEffect(() => {
    fetch("/api/ai-coach")
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d.messages) ? d.messages : []))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  const stopStreaming = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  const clearChat = async () => {
    if (isStreaming) stopStreaming()
    setNeedsKey(false)
    await fetch("/api/ai-coach", { method: "DELETE" }).catch(() => {})
    setMessages([])
  }

  const handleSend = async (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || isStreaming) return
    setInput("")
    setNeedsKey(false)

    const history = messagesRef.current
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text, timestamp: new Date().toISOString() }
    const aiId = `a-${Date.now()}`
    const aiMsg: Message = { id: aiId, role: "assistant", content: "", timestamp: new Date().toISOString() }
    setMessages([...history, userMsg, aiMsg])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const payload = {
      message: text,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === "GROQ_API_KEY_NOT_CONFIGURED") setNeedsKey(true)
        throw new Error(err.error ?? "AI request failed")
      }
      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: acc } : m)))
      }
      setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: acc } : m)))
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, content: "⚠️ Something went wrong. Please try again." } : m)))
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const badge = isStreaming
    ? { variant: "warning" as const, text: "Typing…" }
    : needsKey
      ? { variant: "destructive" as const, text: "Needs setup" }
      : { variant: "success" as const, text: "Online" }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={fullChat ? "hidden" : ""}>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />AI Coach
        </h2>
        <p className="text-muted-foreground text-sm">Your personal AI coach — powered by Groq, aware of your real progress</p>
      </div>

      {!fullChat && needsKey && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-destructive">Groq API key not configured</p>
              <p className="text-muted-foreground">Add your key to <code className="rounded bg-muted px-1 py-0.5">.env</code> as <code className="rounded bg-muted px-1 py-0.5">GROQ_API_KEY=gsk_...</code>, then restart the dev server. Get a free key at console.groq.com/keys.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={fullChat ? "hidden" : ""}>
        <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {prompts.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-hover cursor-pointer" onClick={() => setInput(p.prompt)}>
                <CardContent className="p-2.5 sm:p-3 text-center">
                  <p.icon className="h-5 w-5 mx-auto mb-1.5 sm:mb-2 text-primary" />
                  <p className="text-xs font-medium">{p.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card className={`flex flex-col ${fullChat ? "h-[calc(100dvh-6rem)]" : "h-[55vh] min-h-[380px] md:h-[520px]"}`}>
        <CardHeader className="border-b border-border shrink-0 flex-row items-center justify-between gap-1.5">
          <CardTitle className="text-base min-w-0 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Conversation
          </CardTitle>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground md:hidden"
              onClick={() => setFullChat(!fullChat)}
              title={fullChat ? "Exit full screen" : "Full screen chat"}
            >
              {fullChat ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Badge variant={badge.variant} className="text-xs">{badge.text}</Badge>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearChat} title="Clear chat">
                <Trash2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
          {!loaded ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading conversation…</div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Ask me anything</p>
                <p className="text-xs text-muted-foreground max-w-sm">I can review your goals, habits, LeetCode progress, journal, job search and more — just pick a prompt above or type below.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] rounded-xl p-3 sm:p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <div className="mb-1 flex items-center gap-1.5 text-xs opacity-60">
                      {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      {msg.role === "user" ? "You" : "AI Coach"}
                    </div>
                    {msg.content ? (
                      <MessageContent content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-2 py-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/70" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/50 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-primary/30 [animation-delay:300ms]" />
                      </div>
                    )}
                    <p className="mt-2 text-xs opacity-50">{formatTime(msg.timestamp)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 sm:p-4 shrink-0">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? "AI is responding…" : "Ask your AI coach anything…"}
              className="min-h-[48px] sm:min-h-[60px]"
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
              }}
            />
            {isStreaming ? (
              <Button variant="secondary" className="self-end" onClick={stopStreaming} title="Stop generating">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => handleSend()} disabled={!input.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-2 hidden sm:block text-center text-[11px] text-muted-foreground">Responses are generated live from your tracked data · Enter to send, Shift+Enter for a new line</p>
        </div>
      </Card>
    </div>
  )
}
