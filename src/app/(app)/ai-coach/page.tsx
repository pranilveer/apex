"use client"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Brain, Sparkles, Send, TrendingUp, Code2, BookOpen, Target, MessageSquare, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: string
}

const initialMessages: Message[] = []

const prompts = [
  { label: "Daily Analysis", icon: BarChart3, prompt: "Analyze my productivity today and suggest improvements" },
  { label: "LeetCode Coach", icon: Code2, prompt: "Suggest LeetCode problems based on my weak topics" },
  { label: "System Design", icon: BookOpen, prompt: "Suggest system design topics I should study" },
  { label: "Interview Prep", icon: Target, prompt: "Generate interview questions for my next interview" },
  { label: "Journal Review", icon: MessageSquare, prompt: "Review my journal and provide insights" },
  { label: "GitHub Analysis", icon: TrendingUp, prompt: "Analyze my GitHub activity and suggest improvements" },
]

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    setMessages([...messages, userMsg])
    setInput("")

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: "I'm analyzing your request. For a fully functional AI coach, integrate with OpenAI API or similar. The analysis would be based on your actual data stored in the database.",
      }
      setMessages((prev) => [...prev, aiMsg])
    }, 1000)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />AI Coach
        </h2>
        <p className="text-muted-foreground text-sm">Your personal AI-powered productivity assistant</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {prompts.map((p, i) => (
          <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-hover cursor-pointer" onClick={() => setInput(p.prompt)}>
              <CardContent className="p-3 text-center">
                <p.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">{p.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="h-[400px] md:h-[500px] flex flex-col">
        <CardHeader className="border-b border-border shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Conversation
            <Badge variant="success" className="ml-auto text-xs">Online</Badge>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  <div className="max-w-none text-sm space-y-1">
                    {msg.content.split("\n").map((line, idx) => {
                      if (line.startsWith("## ")) return <h2 key={idx} className="text-lg font-bold mt-0 mb-2">{line.replace("## ", "")}</h2>
                      if (line.startsWith("### ")) return <h3 key={idx} className="text-base font-semibold mt-3 mb-1">{line.replace("### ", "")}</h3>
                      if (line.startsWith("- ")) return <li key={idx} className="text-sm ml-4 list-disc">{line.replace("- ", "")}</li>
                      if (line.startsWith("| ")) {
                        const cells = line.split("|").filter(Boolean).map((c) => c.trim())
                        if (cells.every((c) => c.match(/^[-:]+$/))) return null
                        return <div key={idx} className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-border/50">{cells.map((c, ci) => <span key={ci}>{c}</span>)}</div>
                      }
                      if (line.match(/^\d+\.\s/)) return <p key={idx} className="text-sm ml-4">{line}</p>
                      if (line.trim() === "") return <br key={idx} />
                      return <p key={idx} className="text-sm">{line}</p>
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{msg.timestamp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-border p-4 shrink-0">
          <div className="flex gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your AI coach anything..." className="min-h-[60px] resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }} />
            <Button onClick={handleSend} disabled={!input.trim()} className="self-end"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
