"use client"
import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  commandOpen: boolean
  focusMode: boolean
  pomodoroActive: boolean
  pomodoroMinutes: number
  pomodoroSecondsLeft: number
  pomodoroType: 'work' | 'break'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleCommand: () => void
  setCommandOpen: (open: boolean) => void
  toggleFocusMode: () => void
  setPomodoroActive: (active: boolean) => void
  setPomodoroTime: (minutes: number, seconds: number) => void
  setPomodoroType: (type: 'work' | 'break') => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  commandOpen: false,
  focusMode: false,
  pomodoroActive: false,
  pomodoroMinutes: 25,
  pomodoroSecondsLeft: 1500,
  pomodoroType: 'work',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
  setCommandOpen: (open) => set({ commandOpen: open }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setPomodoroActive: (active) => set({ pomodoroActive: active }),
  setPomodoroTime: (minutes, seconds) => set({ pomodoroMinutes: minutes, pomodoroSecondsLeft: seconds }),
  setPomodoroType: (type) => set({ pomodoroType: type }),
}))
