"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, PlayCircle, Sparkles, Code2, Flame } from "lucide-react"
import { DashboardPreview } from "./dashboard-preview"

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-44 lg:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.18),transparent)]" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <motion.div variants={item} className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                Built for developers preparing for tech interviews
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Turn job-seeking chaos into{" "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                daily progress
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0"
            >
              LeetCode, habits, GitHub, interviews, jobs and resumes — all in one dashboard. Track
              everything, keep your streak alive, and get AI guidance from a coach that actually
              knows your daily grind.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/auth/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-400/40 sm:w-auto"
              >
                Start Tracking Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/dashboard"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 sm:w-auto"
              >
                <PlayCircle className="h-5 w-5 text-blue-400" />
                View Live Demo
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start"
            >
              {[
                { value: "13+", label: "integrated tools" },
                { value: "100%", label: "free to start" },
                { value: "24/7", label: "AI career coach" },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-white">{s.value}</span>
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={item} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-violet-500/20 blur-2xl" />
              <DashboardPreview />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -right-3 -top-6 hidden rounded-2xl border border-emerald-400/25 bg-[#0D1220]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur lg:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15">
                  <Code2 className="h-4 w-4 text-emerald-300" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white">Problem solved</p>
                  <p className="text-[11px] text-slate-500">+25 XP · Medium · Binary Search</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-2xl border border-orange-400/25 bg-[#0D1220]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur lg:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/15">
                <Flame className="h-4 w-4 text-orange-300" fill="currentColor" />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">21-day streak</p>
                <p className="text-[11px] text-slate-500">You&apos;re on fire. Keep going.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
