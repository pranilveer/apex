"use client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/layout/command-palette"
import { Providers } from "@/components/layout/providers"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"
import { PomodoroButton } from "@/components/pomodoro/pomodoro-button"
import { useAppStore } from "@/stores/app-store"
import { cn } from "@/lib/utils"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore()

  return (
    <Providers>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className={cn("flex flex-1 flex-col transition-all duration-200", sidebarOpen ? "ml-64" : "ml-0")}>
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
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
