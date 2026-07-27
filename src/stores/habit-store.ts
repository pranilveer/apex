"use client"
import { create } from 'zustand'

export interface HabitEntry {
  id: string
  date: string
  habitId: string
  label: string
  completed: boolean
  value?: string
}

interface HabitState {
  entries: HabitEntry[]
  setEntries: (entries: HabitEntry[]) => void
  toggleHabit: (date: string, habitId: string) => void
  getStreak: (habitId: string) => number
  getCompletionRate: (habitId: string, days: number) => number
}

export const useHabitStore = create<HabitState>((set, get) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
  toggleHabit: (date, habitId) =>
    set((state) => {
      const existing = state.entries.find((e) => e.date === date && e.habitId === habitId)
      if (existing) {
        return {
          entries: state.entries.map((e) =>
            e.date === date && e.habitId === habitId
              ? { ...e, completed: !e.completed }
              : e
          ),
        }
      }
      return {
        entries: [...state.entries, { id: `${date}-${habitId}`, date, habitId, label: habitId, completed: true }],
      }
    }),
  getStreak: (habitId) => {
    const { entries } = get()
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const entry = entries.find((e) => e.date === dateStr && e.habitId === habitId && e.completed)
      if (entry) streak++
      else break
    }
    return streak
  },
  getCompletionRate: (habitId, days) => {
    const { entries } = get()
    const today = new Date()
    let completed = 0
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      if (entries.find((e) => e.date === dateStr && e.habitId === habitId && e.completed)) completed++
    }
    return Math.round((completed / days) * 100)
  },
}))
