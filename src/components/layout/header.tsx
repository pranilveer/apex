"use client"
import { usePathname } from "next/navigation"
import { Search, Command, Maximize2, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
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
  const { setCommandOpen, toggleFocusMode, sidebarOpen, setSidebarOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6 md:h-16">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-9 w-9 md:hidden shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold md:text-xl truncate">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">{getGreeting()}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
          <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleFocusMode} className="h-9 w-9">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
