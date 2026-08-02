"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Target, Code2, Github, FolderKanban, BookOpen,
  PenLine, CheckCircle2, Briefcase, FileText, Bookmark, BarChart3,
  Bell, Trophy, Brain, Settings, ChevronLeft, ChevronRight, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Target, Code2, Github, FolderKanban, BookOpen,
  PenLine, CheckCircle2, Briefcase, FileText, Bookmark, BarChart3,
  Bell, Trophy, Brain, Settings,
}

const navItems = [
  { title: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { title: "Goals", href: "/goals", icon: "Target" },
  { title: "LeetCode", href: "/leetcode", icon: "Code2" },
  { title: "GitHub", href: "/github", icon: "Github" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Interview Prep", href: "/interview", icon: "BookOpen" },
  { title: "Journal", href: "/journal", icon: "PenLine" },
  { title: "Habits", href: "/habits", icon: "CheckCircle2" },
  { title: "Job Switch", href: "/jobs", icon: "Briefcase" },
  { title: "Resumes", href: "/resumes", icon: "FileText" },
  { title: "Resources", href: "/resources", icon: "Bookmark" },
  { title: "Analytics", href: "/analytics", icon: "BarChart3" },
]

const bottomItems = [
  { title: "Notifications", href: "/notifications", icon: "Bell" },
  { title: "Gamification", href: "/gamification", icon: "Trophy" },
  { title: "AI Coach", href: "/ai-coach", icon: "Brain" },
  { title: "Settings", href: "/settings", icon: "Settings" },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const renderItem = (item: { title: string; href: string; icon: string }) => {
    const Icon = iconMap[item.icon]
    const isActive = pathname === item.href
    return (
      <Link key={item.href} href={item.href} onClick={onNavigate}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-3 md:py-2 text-[15px] md:text-sm font-medium transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {Icon && <Icon className="h-5 w-5 md:h-4 md:w-4 shrink-0" />}
          <span>{item.title}</span>
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute left-0 h-6 w-[3px] rounded-r-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className="flex h-full w-[256px] flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">DailyTracker</span>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 pb-10 md:pb-3">
        <div className="space-y-1">{navItems.map(renderItem)}</div>

        {/* Bottom items stay pinned on desktop, but flow inline on mobile so they're always reachable */}
        <Separator className="my-3 md:hidden" />
        <div className="space-y-1 md:hidden">{bottomItems.map(renderItem)}</div>
      </nav>

      <Separator className="hidden md:block" />
      <nav className="hidden md:block px-3 py-3">
        <div className="space-y-1">{bottomItems.map(renderItem)}</div>
      </nav>
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore()
  const [mobileHeight, setMobileHeight] = useState(0)

  useEffect(() => {
    const update = () => setMobileHeight(window.innerHeight)
    update()
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  return (
    <>
      {/* Desktop toggle button — only shows when sidebar is closed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-4 top-4 z-50 hidden md:block"
          >
            <Button variant="glass" size="icon" onClick={toggleSidebar} className="h-10 w-10 shadow-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile: drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ height: mobileHeight || undefined }}
            className="fixed left-0 top-0 z-50 h-screen w-[256px] border-r border-border bg-sidebar md:hidden"
          >
            <div className="absolute right-2 top-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop: always-mounted sidebar with width transition */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden md:block h-screen supports-[height:100dvh]:h-dvh border-r border-border bg-sidebar overflow-hidden transition-[width] duration-200 ease-in-out",
          sidebarOpen ? "w-[256px]" : "w-0"
        )}
      >
        <div className="absolute right-2 top-3 z-10">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("w-[256px]", !sidebarOpen && "pointer-events-none")}>
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}
