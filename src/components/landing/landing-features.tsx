"use client"

import {
  Code2,
  Brain,
  Briefcase,
  Trophy,
  Github,
  BarChart3,
  BookOpen,
  Bell,
  ArrowUpRight,
} from "lucide-react"
import { Reveal } from "./reveal"
import { SectionHeading } from "./section-heading"

const features = [
  {
    icon: Code2,
    title: "LeetCode + Spaced Repetition",
    text: "Track every problem with confidence levels. A smart revision queue resurfaces problems right before you'd forget them.",
    color: "bg-blue-500/15 text-blue-400",
    border: "hover:border-blue-500/30",
    glow: "group-hover:bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "AI Career Coach",
    text: "A Groq-powered (Llama 3.3) coach that reads your actual daily data and gives you personalized interview guidance.",
    color: "bg-violet-500/15 text-violet-400",
    border: "hover:border-violet-500/30",
    glow: "group-hover:bg-violet-500/10",
  },
  {
    icon: Briefcase,
    title: "Job Application Tracker",
    text: "Applications, interviews, follow-ups, wishlist and salary tracking with status pipelines — zero spreadsheets.",
    color: "bg-emerald-500/15 text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "group-hover:bg-emerald-500/10",
  },
  {
    icon: Trophy,
    title: "Gamification & Streaks",
    text: "XP, levels, badges and streak calendars turn boring consistency into a game you actually want to win.",
    color: "bg-amber-500/15 text-amber-400",
    border: "hover:border-amber-500/30",
    glow: "group-hover:bg-amber-500/10",
  },
  {
    icon: Github,
    title: "GitHub + Daily Habits",
    text: "Auto-synced contributions alongside daily habits and tasks. Every commit and workout lands on one timeline.",
    color: "bg-slate-500/15 text-slate-300",
    border: "hover:border-slate-500/30",
    glow: "group-hover:bg-slate-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    text: "See where your time actually goes. Trends, consistency and prep coverage across every track you care about.",
    color: "bg-cyan-500/15 text-cyan-400",
    border: "hover:border-cyan-500/30",
    glow: "group-hover:bg-cyan-500/10",
  },
  {
    icon: BookOpen,
    title: "Interview Prep Hub",
    text: "Structured DSA and system-design topics with mastery tracking. Walk into every round knowing where you stand.",
    color: "bg-rose-500/15 text-rose-400",
    border: "hover:border-rose-500/30",
    glow: "group-hover:bg-rose-500/10",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    text: "Reminders for daily routines, goals due soon and upcoming interviews. A nudge at the right moment keeps you moving.",
    color: "bg-sky-500/15 text-sky-400",
    border: "hover:border-sky-500/30",
    glow: "group-hover:bg-sky-500/10",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative scroll-mt-20 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_20%,rgba(139,92,246,0.08),transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Everything you need"
            title="One platform. Every prep tool that matters."
            subtitle="Stop stitching together ten tabs and a spreadsheet. DailyTracker ships the whole toolkit for a serious job hunt."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 0.07}>
              <a
                href="/auth/signup"
                className={`group relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] ${f.border}`}
              >
                <div className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 ${f.glow}`} />
                <div className="relative">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}
                  >
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
