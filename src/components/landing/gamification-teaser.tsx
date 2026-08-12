"use client"

import { Trophy, Flame, Code2, Droplets, Github, Target, Zap } from "lucide-react"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const badges = [
  { icon: Trophy, label: "First Day", earned: true },
  { icon: Flame, label: "Week Streak", earned: true },
  { icon: Code2, label: "100 Solved", earned: true },
  { icon: Github, label: "Code Monkey", earned: false },
  { icon: Droplets, label: "Hydrated", earned: true },
  { icon: Target, label: "Interview Ready", earned: false },
]

const heat = [3, 4, 2, 1, 0, 4, 4, 3, 2, 4, 1, 3, 4, 0, 2, 4, 3, 1, 4, 3, 2, 4, 0, 3, 4, 2, 3, 4, 1, 4, 3, 4, 2, 3, 4, 4, 3, 2, 4]
const shade = ["bg-white/[0.04]", "bg-emerald-500/20", "bg-emerald-500/40", "bg-emerald-500/65", "bg-emerald-500/90"]

export function GamificationTeaser() {
  return (
    <section id="gamification" className="relative scroll-mt-20 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_15%_50%,rgba(59,130,246,0.1),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Gamification"
            title="Consistency you can see. Levels you can feel."
            subtitle="Every habit, problem and commit earns XP. Streaks, badges and a 90-day calendar make showing up addictive."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="absolute -inset-5 rounded-3xl bg-gradient-to-br from-blue-500/15 via-transparent to-amber-500/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D1220] p-6 shadow-2xl shadow-black/40 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25">
                    <Zap className="h-7 w-7 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Level 12</p>
                    <p className="text-2xl font-extrabold text-white">1,240 XP</p>
                    <p className="mt-0.5 text-xs text-slate-500">60 XP to Level 13</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {badges.map((b) => (
                    <div
                      key={b.label}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                        b.earned
                          ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
                          : "border-white/10 bg-white/[0.03] text-slate-600"
                      }`}
                    >
                      <b.icon className="h-4 w-4" />
                      {b.label}
                      <span
                        className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          b.earned ? "bg-amber-400/15 text-amber-400" : "bg-white/[0.04] text-slate-700"
                        }`}
                      >
                        {b.earned ? "Earned" : "Locked"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Streak calendar · last 90 days</span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Flame className="h-3.5 w-3.5 text-orange-400" fill="currentColor" />
                    21-day current streak
                  </span>
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
                  {heat.map((v, i) => (
                    <span
                      key={i}
                      className={`aspect-square rounded-[3px] ${shade[v]}`}
                      title={v > 0 ? "Active day" : "Missed day"}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[10px] text-slate-600">
                  Less
                  {[0, 1, 2, 3, 4].map((s) => (
                    <span key={s} className={`h-2 w-2 rounded-[2px] ${shade[s]}`} />
                  ))}
                  More
                </div>
              </div>
            </div>

            <div className="absolute -right-3 -top-5 hidden rounded-xl border border-blue-500/25 bg-[#0D1220]/95 px-3.5 py-2 shadow-lg shadow-black/40 backdrop-blur sm:block">
              <p className="text-xs font-bold text-blue-300">+25 XP</p>
              <p className="text-[10px] text-slate-500">Solved · Medium</p>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-amber-400/25 bg-[#0D1220]/95 px-3.5 py-2 shadow-lg shadow-black/40 backdrop-blur sm:block">
              <p className="text-xs font-bold text-amber-300">Level Up!</p>
              <p className="text-[10px] text-slate-500">2 new badges available</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
