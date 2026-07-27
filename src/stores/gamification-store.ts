"use client"
import { create } from 'zustand'

interface GamificationState {
  xp: number
  level: number
  dailyScore: number
  longestStreak: number
  currentStreak: number
  badges: string[]
  addXP: (amount: number) => void
  setLevel: (level: number) => void
  setDailyScore: (score: number) => void
  setCurrentStreak: (streak: number) => void
  addBadge: (badge: string) => void
  getXPForNextLevel: () => number
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xp: 0,
  level: 1,
  dailyScore: 0,
  longestStreak: 0,
  currentStreak: 0,
  badges: [],
  addXP: (amount) =>
    set((state) => {
      const newXP = state.xp + amount
      const xpPerLevel = 100
      const newLevel = Math.floor(newXP / xpPerLevel) + 1
      return { xp: newXP, level: newLevel }
    }),
  setLevel: (level) => set({ level }),
  setDailyScore: (score) => set({ dailyScore: score }),
  setCurrentStreak: (streak) =>
    set((state) => ({
      currentStreak: streak,
      longestStreak: Math.max(state.longestStreak, streak),
    })),
  addBadge: (badge) =>
    set((state) => ({
      badges: state.badges.includes(badge) ? state.badges : [...state.badges, badge],
    })),
  getXPForNextLevel: () => {
    const { xp, level } = get()
    return level * 100 - xp
  },
}))
