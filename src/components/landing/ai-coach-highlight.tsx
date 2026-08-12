"use client"

import { CheckCircle2, ArrowRight, Send, Bot, Sparkles } from "lucide-react"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const coachPoints = [
  {
    title: "Knows your data",
    text: "Reads your real LeetCode history, habits, jobs and journal — not generic advice.",
  },
  {
    title: "Pinpoints weak spots",
    text: "Surfaces recurring mistakes and builds a concrete revision plan around them.",
  },
  {
    title: "Fast by design",
    text: "Streaming responses powered by Groq's Llama 3.3 — answers feel instant.",
  },
]

export function AiCoachHighlight() {
  return (
    <section id="ai-coach" className="relative scroll-mt-20 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_80%_50%,rgba(139,92,246,0.1),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <SectionHeading
                align="left"
                eyebrow="AI Career Coach"
                title={
                  <>
                    A coach that{" "}
                    <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                      actually reads your prep
                    </span>
                  </>
                }
                subtitle="Not another generic chatbot. The AI Coach knows what you solved yesterday, where you keep slipping, and which interviews are coming up."
              />
              <div className="mt-8 space-y-5">
                {coachPoints.map((p) => (
                  <div key={p.title} className="flex items-start gap-3.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                    <div>
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{p.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/auth/signup"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-500/20"
              >
                Try the AI Coach
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D1220] shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                      <Bot className="h-4 w-4 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">AI Coach</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online · Groq Llama 3.3
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-300">
                    <Sparkles className="h-3 w-3" /> Personalized
                  </span>
                </div>

                <div className="space-y-3.5 p-4">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-blue-500/15 px-4 py-2.5 text-sm text-blue-50">
                    I keep failing medium graph problems. What should I focus on this week?
                  </div>

                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3.5 text-sm">
                    <p className="text-slate-300">
                      Based on your last 14 days, <span className="font-semibold text-white">68% of wrong answers are graphs</span>. Here&apos;s a focused plan:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-slate-400">
                      <li className="flex gap-2">
                        <span className="font-bold text-violet-400">1.</span> Master BFS/DFS traversal on matrices first — it&apos;s your base.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-violet-400">2.</span> Re-attempt these 3 problems in your revision queue today.
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-violet-400">3.</span> Book 30 min on Friday for Word Ladder (Hard) with a timer.
                      </li>
                    </ul>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                      <Sparkles className="h-3 w-3" /> Next review: Number of Islands — due today
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
                  </div>
                </div>

                <div className="border-t border-white/[0.06] p-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <span className="text-sm text-slate-600">Ask about your prep, schedule, interviews…</span>
                    <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500 text-white">
                      <Send className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
