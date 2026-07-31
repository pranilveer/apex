"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { BOOKMARK_DEFS } from "@/lib/revision"
import type { BookmarkKey, LeetCodeProblem } from "@/types"

export type SmartScope = "all" | "title" | "number" | "topic" | "pattern" | "company" | "notes" | "mistakes"

export interface SmartSearchState {
  q: string
  scope: SmartScope
  difficulty: "All" | "Easy" | "Medium" | "Hard"
  bookmark: "All" | BookmarkKey
}

export const DEFAULT_SMART_SEARCH: SmartSearchState = { q: "", scope: "all", difficulty: "All", bookmark: "All" }

export function applySmartSearch(problems: LeetCodeProblem[], state: SmartSearchState): LeetCodeProblem[] {
  const q = state.q.trim().toLowerCase()
  return problems.filter((p) => {
    if (state.bookmark !== "All" && !p[state.bookmark]) return false
    if (state.difficulty !== "All" && p.difficulty !== state.difficulty) return false
    if (!q) return true
    switch (state.scope) {
      case "title":
        return p.name.toLowerCase().includes(q)
      case "number":
        return String(p.frontendId ?? "").includes(q)
      case "topic":
        return p.topic.toLowerCase().includes(q)
      case "pattern":
        return p.pattern.toLowerCase().includes(q)
      case "company":
        return (p.companyTags ?? []).some((c) => c.toLowerCase().includes(q))
      case "notes":
        return p.notes.toLowerCase().includes(q)
      case "mistakes":
        return (p.mistakes ?? []).some((m) => m.toLowerCase().includes(q))
      default:
        return (
          p.name.toLowerCase().includes(q) ||
          String(p.frontendId ?? "").includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.pattern.toLowerCase().includes(q) ||
          (p.companyTags ?? []).some((c) => c.toLowerCase().includes(q)) ||
          p.notes.toLowerCase().includes(q) ||
          (p.mistakes ?? []).some((m) => m.toLowerCase().includes(q))
        )
    }
  })
}

const SCOPES: { value: SmartScope; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "title", label: "Title" },
  { value: "number", label: "Number" },
  { value: "topic", label: "Topic" },
  { value: "pattern", label: "Pattern" },
  { value: "company", label: "Company" },
  { value: "notes", label: "Notes" },
  { value: "mistakes", label: "Mistakes" },
]

export function SmartSearch({
  state,
  onChange,
  resultCount,
}: {
  state: SmartSearchState
  onChange: (s: SmartSearchState) => void
  resultCount: number
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search solved questions by title, number, topic, pattern, company, notes, mistakes..."
          value={state.q}
          onChange={(e) => onChange({ ...state, q: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={state.scope} onValueChange={(v) => onChange({ ...state, scope: v as SmartScope })}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SCOPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.difficulty} onValueChange={(v) => onChange({ ...state, difficulty: v as SmartSearchState["difficulty"] })}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...state, bookmark: "All" })}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              state.bookmark === "All" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {BOOKMARK_DEFS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...state, bookmark: key })}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                state.bookmark === key ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{resultCount} result{resultCount === 1 ? "" : "s"}</span>
      </div>
    </div>
  )
}
