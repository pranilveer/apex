"use client"

import Link from "next/link"
import { ArrowRight, Zap } from "lucide-react"
import { Reveal } from "./reveal"

export function FinalCta() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/[0.12] via-[#0D1220] to-violet-500/[0.12] px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            </div>

            <div className="relative">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-xl shadow-blue-500/30">
                <Zap className="h-7 w-7 text-white" fill="currentColor" />
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your next offer starts with today&apos;s checklist.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Join developers who stopped juggling tabs and started building a system. Free to
                start, impossible to out-grow.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-blue-400/40 sm:w-auto"
                >
                  Start Your Job-Seeking System Today
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
                >
                  Explore the live app
                </Link>
              </div>
              <p className="mt-6 text-xs text-slate-600">Free forever plan · No credit card required</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
