"use client"
import { create } from 'zustand'

export interface LeetcodeProblem {
  id: string
  name: string
  url?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pattern?: string
  topic?: string
  solvedDate: string
  timeTaken?: number
  needsRevision: boolean
  companyTags: string[]
  notes?: string
}

interface LeetcodeState {
  problems: LeetcodeProblem[]
  setProblems: (problems: LeetcodeProblem[]) => void
  addProblem: (problem: LeetcodeProblem) => void
  removeProblem: (id: string) => void
  updateProblem: (id: string, updates: Partial<LeetcodeProblem>) => void
  getStats: () => { total: number; easy: number; medium: number; hard: number; streak: number }
}

export const useLeetcodeStore = create<LeetcodeState>((set, get) => ({
  problems: [],
  setProblems: (problems) => set({ problems }),
  addProblem: (problem) => set((state) => ({ problems: [...state.problems, problem] })),
  removeProblem: (id) => set((state) => ({ problems: state.problems.filter((p) => p.id !== id) })),
  updateProblem: (id, updates) =>
    set((state) => ({
      problems: state.problems.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  getStats: () => {
    const { problems } = get()
    return {
      total: problems.length,
      easy: problems.filter((p) => p.difficulty === 'Easy').length,
      medium: problems.filter((p) => p.difficulty === 'Medium').length,
      hard: problems.filter((p) => p.difficulty === 'Hard').length,
      streak: 0,
    }
  },
}))
