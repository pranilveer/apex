"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Coffee, Zap, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/app-store"

export function PomodoroTimer() {
  const { pomodoroActive, setPomodoroActive } = useAppStore()
  const [seconds, setSeconds] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")
  const [sessions, setSessions] = useState(0)

  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (isRunning && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000)
    } else if (seconds === 0) {
      if (mode === "work") {
        setSessions((s) => s + 1)
        setMode("break")
        setSeconds(5 * 60)
      } else {
        setMode("work")
        setSeconds(25 * 60)
      }
      setIsRunning(false)
    }
    return () => clearInterval(interval)
  }, [isRunning, seconds, mode])

  const toggle = () => setIsRunning(!isRunning)
  const reset = () => { setIsRunning(false); setSeconds(mode === "work" ? 25 * 60 : 5 * 60) }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  if (!pomodoroActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="glass border-border/50 shadow-2xl w-[280px]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {mode === "work" ? <Zap className="h-4 w-4 text-primary" /> : <Coffee className="h-4 w-4 text-green-400" />}
                <span className="text-sm font-medium capitalize">{mode} Session</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPomodoroActive(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="relative flex items-center justify-center mb-4">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={mode === "work" ? "#8b5cf6" : "#22c55e"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-mono font-bold">{formatTime(seconds)}</p>
                <p className="text-xs text-muted-foreground mt-1">Session {sessions + 1}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="lg" onClick={toggle} className="w-32">
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setMode(mode === "work" ? "break" : "work")
                setSeconds(mode === "work" ? 5 * 60 : 25 * 60)
                setIsRunning(false)
              }}>
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
