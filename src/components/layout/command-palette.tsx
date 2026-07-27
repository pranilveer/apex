"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Target, Code2, Github, FolderKanban, BookOpen,
  PenLine, CheckCircle2, Briefcase, FileText, Bookmark, BarChart3,
  Bell, Trophy, Brain, Settings, Search
} from "lucide-react"
import { useAppStore } from "@/stores/app-store"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const pages = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "LeetCode", href: "/leetcode", icon: Code2 },
  { title: "GitHub", href: "/github", icon: Github },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Interview Prep", href: "/interview", icon: BookOpen },
  { title: "Journal", href: "/journal", icon: PenLine },
  { title: "Habits", href: "/habits", icon: CheckCircle2 },
  { title: "Job Switch", href: "/jobs", icon: Briefcase },
  { title: "Resumes", href: "/resumes", icon: FileText },
  { title: "Resources", href: "/resources", icon: Bookmark },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Gamification", href: "/gamification", icon: Trophy },
  { title: "AI Coach", href: "/ai-coach", icon: Brain },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function CommandPalette() {
  const router = useRouter()
  const { commandOpen, setCommandOpen } = useAppStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [commandOpen, setCommandOpen])

  const runCommand = (href: string) => {
    setCommandOpen(false)
    router.push(href)
  }

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 max-w-md glass border-border/50">
        <Command className="rounded-xl border border-border bg-background">
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 pl-3 pr-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation" className="text-xs text-muted-foreground">
              {pages.map((page) => (
                <Command.Item
                  key={page.href}
                  onSelect={() => runCommand(page.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-foreground"
                >
                  <page.icon className="h-4 w-4" />
                  {page.title}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
