"use client"

import { XCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const pains = [
  {
    title: "Scattered tools",
    text: "LeetCode in one tab, jobs in another, notes in a doc — nothing talks to each other.",
  },
  {
    title: "No accountability",
    text: "No reminders, no streaks, no feedback. One missed day quietly becomes three missed weeks.",
  },
  {
    title: "Lost motivation",
    text: "You can't see progress, so you don't trust it. Momentum dies somewhere around week two.",
  },
]

const fixes = [
  {
    title: "One command center",
    text: "Every prep activity lives in a single dashboard, connected and automatically synced.",
  },
  {
    title: "Smart nudges",
    text: "Reminders, due-date alerts and review queues keep you showing up — even on bad days.",
  },
  {
    title: "Visible momentum",
    text: "XP, levels, streaks and a 90-day calendar make progress impossible to ignore.",
  },
]

export function ProblemSolution() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Why DailyTracker"
            title={
              <>
                The chaos is real.{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  So is the fix.
                </span>
              </>
            }
            subtitle="Job-seeking is a marathon. Most tools treat it like a sprint with no scoreboard. We built the opposite."
          />
        </Reveal>

        <div className="relative mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <Reveal delay={0.05} className="space-y-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-rose-400">
              The pain
            </p>
            {pains.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-rose-500/25 hover:bg-rose-500/[0.04]"
              >
                <div className="flex items-start gap-3.5">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400/80" />
                  <div>
                    <h3 className="font-semibold text-slate-200">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{p.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="hidden items-center lg:flex">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 shadow-lg shadow-blue-500/10">
                <ArrowRight className="h-6 w-6 text-blue-400" />
              </div>
              <div className="absolute inset-0 -z-10 h-14 w-14 animate-pulse-glow rounded-full blur-xl" />
            </div>
          </Reveal>

          <Reveal delay={0.25} className="space-y-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              The system
            </p>
            {fixes.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-blue-500/[0.07] to-violet-500/[0.07] p-5 transition-colors hover:border-emerald-500/25 hover:from-emerald-500/[0.06] hover:to-blue-500/[0.06]"
              >
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-slate-200">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{f.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
