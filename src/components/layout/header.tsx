"use client"
import { usePathname } from "next/navigation"
import { Search, Command, Moon, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/app-store"
import { getGreeting } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/goals": "Goals",
  "/leetcode": "LeetCode Tracker",
  "/github": "GitHub Tracker",
  "/projects": "Project Tracker",
  "/interview": "Interview Preparation",
  "/journal": "Daily Journal",
  "/habits": "Habit Tracker",
  "/jobs": "Job Switch Dashboard",
  "/resumes": "Resume Tracker",
  "/resources": "Resource Library",
  "/analytics": "Analytics",
  "/notifications": "Notifications",
  "/gamification": "Gamification",
  "/ai-coach": "AI Coach",
  "/settings": "Settings",
}

export function Header() {
  const pathname = usePathname()
  const { setCommandOpen, toggleFocusMode } = useAppStore()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground">{getGreeting()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
          <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFocusMode}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
