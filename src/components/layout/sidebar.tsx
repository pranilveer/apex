"use client"
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

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
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
          })}
        </div>
      </nav>

      <Separator />

      <nav className="px-3 py-3">
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  <span>{item.title}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore()

  return (
    <>
      {/* Desktop: sidebar always starts closed, toggle button */}
      {!sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed left-4 top-4 z-40 hidden md:block"
        >
          <Button variant="glass" size="icon" onClick={toggleSidebar} className="h-10 w-10 shadow-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

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
            className="fixed left-0 top-0 z-40 h-screen w-[256px] border-r border-border bg-sidebar md:hidden"
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

      {/* Desktop: sidebar slide in/out */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-40 hidden h-screen w-[256px] border-r border-border bg-sidebar overflow-hidden md:block"
          >
            <div className="absolute right-2 top-3">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
