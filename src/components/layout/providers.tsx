"use client"
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"

type Theme = "dark" | "light" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", setTheme: () => {} })

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  if (t === "system") {
    const sys = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    root.classList.add(sys)
  } else {
    root.classList.add(t)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    const initial = stored || "dark"
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const handler = () => { if (theme === "system") applyTheme("system") }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme, mounted])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem("theme", t)
    applyTheme(t)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  )
}
