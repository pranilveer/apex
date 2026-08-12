import Link from "next/link"
import { Zap, Github } from "lucide-react"

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "AI Coach", href: "#ai-coach" },
      { label: "Gamification", href: "#gamification" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Login", href: "/auth/signin" },
      { label: "Create account", href: "/auth/signup" },
      { label: "Live demo", href: "/dashboard" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">DailyTracker</span>
                <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                  Apex
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The all-in-one productivity system for developers preparing for tech jobs. Track
              LeetCode, habits, GitHub, interviews and jobs in one place.
            </p>
            <a
              href="https://github.com/pranilveer/apex"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-slate-500 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-white">Built for</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>Coding job seekers</li>
              <li>Career switchers</li>
              <li>Structured learners</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-slate-600 sm:flex-row">
          <p>© {new Date().getFullYear()} DailyTracker · Apex. All rights reserved.</p>
          <p>
            Made for developers · <span className="text-slate-500">Open source on</span>{" "}
            <a
              href="https://github.com/pranilveer/apex"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-400 hover:text-white"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
