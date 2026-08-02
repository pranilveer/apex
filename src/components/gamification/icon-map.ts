import {
  Code2,
  CheckCircle2,
  ListChecks,
  Github,
  PenLine,
  FolderKanban,
  Target,
  BookOpen,
  Dumbbell,
  Droplets,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const SOURCE_ICONS: Record<string, LucideIcon> = {
  leetcode: Code2,
  habit: CheckCircle2,
  dailyTask: ListChecks,
  github: Github,
  journal: PenLine,
  project: FolderKanban,
  goal: Target,
  interview: BookOpen,
}

export const MISSION_ICONS: Record<string, LucideIcon> = {
  leetcode: Code2,
  gym: Dumbbell,
  github: Github,
  journal: PenLine,
  water: Droplets,
  tasks: ListChecks,
}

export const SOURCE_COLORS: Record<string, string> = {
  leetcode: "text-yellow-400 bg-yellow-400/10",
  habit: "text-green-400 bg-green-400/10",
  dailyTask: "text-blue-400 bg-blue-400/10",
  github: "text-purple-400 bg-purple-400/10",
  journal: "text-pink-400 bg-pink-400/10",
  project: "text-cyan-400 bg-cyan-400/10",
  goal: "text-indigo-400 bg-indigo-400/10",
  interview: "text-orange-400 bg-orange-400/10",
}
