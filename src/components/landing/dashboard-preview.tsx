import {
  Zap,
  Code2,
  Github,
  FolderKanban,
  Target,
  Briefcase,
  BarChart3,
  Flame,
  CheckCircle2,
  Circle,
  Brain,
} from "lucide-react"

const heatCells = [2, 3, 1, 0, 4, 3, 2, 1, 3, 4, 0, 2, 3, 1, 2, 4, 3, 1, 2, 3, 0, 4, 2, 3, 1, 2, 3, 4, 2, 1, 3, 2, 4, 3, 1, 2]
const heatShade = ["bg-white/[0.04]", "bg-emerald-500/20", "bg-emerald-500/40", "bg-emerald-500/60", "bg-emerald-500/90"]
const bars = [38, 55, 44, 70, 62, 88, 78, 96]
const taskRows = [
  { label: "2 LeetCode problems", done: true },
  { label: "GitHub commit", done: true },
  { label: "System design notes", done: false },
]

export function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0D1220] shadow-2xl shadow-black/50 ring-1 ring-white/[0.03]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <div className="ml-3 flex h-6 flex-1 items-center rounded-md bg-white/[0.04] px-3">
          <span className="text-[11px] text-slate-500">dailytracker.app/dashboard</span>
        </div>
      </div>

      <div className="flex">
        <div className="hidden w-12 flex-col items-center gap-3 border-r border-white/[0.06] py-4 sm:flex">
          {[Zap, Code2, Github, FolderKanban, Target, Briefcase, BarChart3].map((Icon, i) => (
            <span
              key={i}
              className={
                i === 0
                  ? "flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400"
                  : "flex h-7 w-7 items-center justify-center rounded-lg text-slate-600"
              }
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>

        <div className="flex-1 space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Good morning, Dev</p>
              <p className="text-sm font-semibold text-white">Tuesday, Aug 12</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
              <Flame className="h-3 w-3" fill="currentColor" /> 21-day streak
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "XP", value: "1,240", color: "text-blue-400" },
              { label: "Level", value: "12", color: "text-violet-400" },
              { label: "Solved", value: "86", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5">
                <p className="text-[10px] text-slate-500">{s.label}</p>
                <p className={`text-lg font-bold leading-tight ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white">Level 12 · 1,240 / 1,300 XP</span>
              <span className="text-slate-500">60 XP to Level 13</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
            </div>
            <div className="mt-3 space-y-1.5">
              {taskRows.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-[11px]">
                  {t.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-slate-600" />
                  )}
                  <span className={t.done ? "text-slate-400 line-through" : "text-slate-300"}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="mb-2 text-[10px] text-slate-500">Last 90 days</p>
              <div className="grid grid-cols-12 gap-[3px]">
                {heatCells.map((v, i) => (
                  <span key={i} className={`aspect-square rounded-[3px] ${heatShade[v]}`} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="mb-2 text-[10px] text-slate-500">Weekly activity</p>
              <div className="flex h-12 items-end gap-1.5">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[3px] bg-gradient-to-t from-blue-500/40 to-blue-400"
                    style={{ height: `${b}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2">
            <Brain className="h-3.5 w-3.5 shrink-0 text-violet-300" />
            <p className="text-[11px] text-slate-300">
              <span className="font-semibold text-violet-200">AI Coach</span> — your top recurring
              mistake is binary search. Review these 3 problems today.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
