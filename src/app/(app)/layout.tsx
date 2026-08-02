"use client"
import { useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/layout/command-palette"
import { Providers } from "@/components/layout/providers"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"
import { PomodoroButton } from "@/components/pomodoro/pomodoro-button"
import { useAppStore } from "@/stores/app-store"
import { syncNotifications } from "@/actions"
import { cn } from "@/lib/utils"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const apply = (e: MediaQueryListEvent | MediaQueryList) => setSidebarOpen(e.matches)
    apply(mq)
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [setSidebarOpen])

  useEffect(() => {
    void syncNotifications(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className={cn(
          "flex flex-1 flex-col transition-all duration-200 min-w-0",
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        )}>
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
        <CommandPalette />
        <PomodoroTimer />
        <PomodoroButton />
      </div>
    </Providers>
  )
}
