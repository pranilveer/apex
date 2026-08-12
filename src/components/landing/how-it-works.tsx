"use client"

import { UserPlus, Link2, CalendarCheck2, TrendingUp } from "lucide-react"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign up free",
    text: "Create your account in seconds. No credit card, no setup marathon.",
  },
  {
    icon: Link2,
    step: "02",
    title: "Connect accounts",
    text: "Link LeetCode and GitHub. Your progress and contributions sync automatically.",
  },
  {
    icon: CalendarCheck2,
    step: "03",
    title: "Track daily",
    text: "Log habits, tasks, problems, jobs and journal entries. The dashboard does the rest.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Level up with AI",
    text: "Get personalized coaching, spot weak areas and watch streaks compound into results.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From zero to a system in four steps"
            subtitle="No tutorials, no configuration hell. Just connect, show up and let the system carry the momentum."
          />
        </Reveal>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className="absolute left-0 right-0 top-7 hidden border-t border-dashed border-white/10 lg:block" />
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1} className="relative">
              <div className="group text-center lg:px-2">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0D1220] shadow-lg shadow-black/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-500/40 group-hover:shadow-blue-500/20">
                  <s.icon className="h-6 w-6 text-blue-400" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-widest text-blue-400/70">
                  Step {s.step}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
