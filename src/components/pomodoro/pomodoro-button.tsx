"use client"
import { Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/app-store"

export function PomodoroButton() {
  const { pomodoroActive, setPomodoroActive } = useAppStore()

  return (
    <Button
      variant={pomodoroActive ? "default" : "ghost"}
      size="icon"
      onClick={() => setPomodoroActive(!pomodoroActive)}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
    >
      <Timer className="h-5 w-5" />
    </Button>
  )
}
