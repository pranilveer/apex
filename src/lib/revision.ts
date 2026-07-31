import type { BookmarkKey, LeetCodeProblem, MistakeType } from "@/types"

export const REVISION_INTERVALS = [3, 7, 14, 30, 60, 90]

export const MISTAKE_TYPES: MistakeType[] = [
  "Pattern not recognized",
  "Binary Search Logic",
  "Sliding Window Logic",
  "Off by One",
  "Wrong Condition",
  "Edge Case",
  "Overflow",
  "Wrong Complexity",
  "Forgot Formula",
  "Implementation Bug",
  "Other",
]

export const BOOKMARK_DEFS: { key: BookmarkKey; label: string; hint: string }[] = [
  { key: "isFavorite", label: "Favorite", hint: "Favorite questions" },
  { key: "isMustRevise", label: "Must Revise", hint: "Must revise before interviews" },
  { key: "isInterviewFavorite", label: "Interview Favs", hint: "Classic interview questions" },
  { key: "isCompanyFavorite", label: "Company Favs", hint: "Frequently asked in companies" },
]

export const PATTERN_TOPICS: Record<string, string[]> = {
  "Array": ["Array", "Matrix"],
  "String": ["String"],
  "HashMap": ["Hash Table"],
  "Binary Search": ["Binary Search"],
  "Sliding Window": ["Sliding Window"],
  "Two Pointer": ["Two Pointers"],
  "Greedy": ["Greedy"],
  "Heap": ["Heap (Priority Queue)"],
  "Graph": ["Graph", "Depth-First Search", "Breadth-First Search", "Union Find", "Topological Sort"],
  "Trie": ["Trie"],
  "DP": ["Dynamic Programming"],
  "Backtracking": ["Backtracking"],
  "Tree": ["Tree", "Binary Tree", "Binary Search Tree"],
  "Stack": ["Stack", "Monotonic Stack"],
  "Queue": ["Queue"],
  "Linked List": ["Linked List"],
  "Recursion": ["Recursion"],
  "Math": ["Math", "Number Theory", "Combinatorics"],
  "Bit Manipulation": ["Bit Manipulation"],
  "Sorting": ["Sorting"],
  "Prefix Sum": ["Prefix Sum", "Prefix Sum Matrix"],
  "Divide and Conquer": ["Divide and Conquer"],
  "Simulation": ["Simulation"],
  "Memoization": ["Memoization"],
}

export const PATTERN_NAMES = Object.keys(PATTERN_TOPICS)

export const COMPANY_TOPICS: Record<string, string[]> = {
  Google: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Graph", "Heap (Priority Queue)", "Tree", "Sliding Window", "Two Pointers", "Backtracking"],
  Amazon: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Tree", "Greedy", "Two Pointers", "Heap (Priority Queue)", "Stack"],
  Microsoft: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Tree", "Linked List", "Stack", "Backtracking", "Two Pointers"],
  Meta: ["Array", "Hash Table", "String", "Binary Search", "Sliding Window", "Tree", "Graph", "Dynamic Programming", "Greedy", "Two Pointers"],
  Adobe: ["Array", "String", "Hash Table", "Dynamic Programming", "Binary Search", "Matrix", "Greedy", "Stack", "Tree"],
  Uber: ["Array", "Hash Table", "String", "Dynamic Programming", "Graph", "Binary Search", "Greedy", "Stack", "Two Pointers"],
  Atlassian: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Graph", "Greedy", "Heap (Priority Queue)"],
  Flipkart: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Greedy", "Sliding Window", "Stack", "Two Pointers"],
  PhonePe: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Graph", "Greedy", "Stack", "Tree"],
  Swiggy: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Graph", "Greedy", "Sliding Window", "Two Pointers"],
  Razorpay: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Stack", "Greedy", "Two Pointers", "Queue"],
  Walmart: ["Array", "Hash Table", "String", "Dynamic Programming", "Binary Search", "Greedy", "Sliding Window", "Tree", "Stack"],
  NVIDIA: ["Array", "Matrix", "Hash Table", "String", "Dynamic Programming", "Bit Manipulation", "Math", "Graph", "Binary Search"],
}

export const COMPANY_NAMES = Object.keys(COMPANY_TOPICS)

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function getTodayDateString(): string {
  return toDateStr(new Date())
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toDateStr(dt)
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number)
  const [by, bm, bd] = b.split("-").map(Number)
  const ms = new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Spaced repetition schedule. Base intervals [3, 7, 14, 30, 60, 90].
 * Higher confidence pushes the next revision further out, lower confidence
 * pulls it earlier.
 */
export function nextRevisionDateFor(baseDate: string, revisionCount: number, confidence: number): string {
  let idx = Math.min(Math.max(revisionCount, 0), REVISION_INTERVALS.length - 1)
  if (confidence >= 5) idx = Math.min(idx + 2, REVISION_INTERVALS.length - 1)
  else if (confidence === 4) idx = Math.min(idx + 1, REVISION_INTERVALS.length - 1)
  else if (confidence <= 2) idx = 0
  return addDays(baseDate, REVISION_INTERVALS[Math.max(0, idx)])
}

export type RevisionStatus = "overdue" | "due" | "upcoming" | "done" | "none"

export function revisionStatus(p: LeetCodeProblem, today: string): RevisionStatus {
  if (!p.nextRevisionDate) return "none"
  if (p.lastRevisionDate === today) return "done"
  if (p.nextRevisionDate < today) return "overdue"
  if (p.nextRevisionDate === today) return "due"
  return "upcoming"
}

export function patternsForTopics(topics: string[]): string[] {
  const set = new Set<string>()
  for (const t of topics) {
    for (const [pattern, topicList] of Object.entries(PATTERN_TOPICS)) {
      if (topicList.some((x) => x.toLowerCase() === t.toLowerCase())) set.add(pattern)
    }
  }
  return [...set]
}

export function problemPatterns(p: LeetCodeProblem): string[] {
  const topics = [p.topic, ...(p.pattern ? p.pattern.split(",").map((x) => x.trim()) : [])].filter(Boolean)
  if (p.pattern && PATTERN_NAMES.some((n) => n.toLowerCase() === p.pattern.toLowerCase())) {
    return [p.pattern]
  }
  return patternsForTopics(topics)
}

export function solvedDatesOf(p: LeetCodeProblem): string[] {
  if (Array.isArray(p.attemptHistory) && p.attemptHistory.length > 0) {
    return p.attemptHistory.filter((a) => a.type === "solved").map((a) => a.date)
  }
  return [p.solvedDate]
}

export function revisionDatesOf(p: LeetCodeProblem): string[] {
  if (Array.isArray(p.attemptHistory)) {
    return p.attemptHistory.filter((a) => a.type === "revision").map((a) => a.date)
  }
  return p.lastRevisionDate ? [p.lastRevisionDate] : []
}

export function estimateTime(minutes: number[]): string {
  const total = minutes.reduce((a, b) => a + (b || 0), 0)
  if (total === 0) return "—"
  const m = total % 60
  const h = Math.floor(total / 60)
  if (h === 0) return `${m} minutes`
  return m === 0 ? `${h} hour${h > 1 ? "s" : ""}` : `${h}h ${m}m`
}

export function confidenceLabel(confidence?: number): string {
  if (!confidence) return "Not rated"
  if (confidence <= 2) return "Needs Work"
  if (confidence === 3) return "Getting There"
  if (confidence === 4) return "Solid"
  return "Mastered"
}
