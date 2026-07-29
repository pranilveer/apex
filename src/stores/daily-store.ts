"use client"
import { create } from 'zustand'
import { fetchDailyTasks, saveDailyTasks, toggleDailyTask } from "@/actions"

export interface DailyTaskItem {
  id: string
  label: string
  completed: boolean
  timeSpent: number
  notes: string
}

interface DailyState {
  tasks: DailyTaskItem[]
  loaded: boolean
  selectedDate: Date
  setTasks: (tasks: DailyTaskItem[]) => void
  toggleTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<DailyTaskItem>) => void
  setSelectedDate: (date: Date) => void
  getCompletionPercentage: () => number
  loadTasks: () => Promise<void>
}

const defaultTasks: DailyTaskItem[] = [
  { id: "gym", label: "Gym", completed: false, timeSpent: 0, notes: "" },
  { id: "office", label: "Office Work", completed: false, timeSpent: 0, notes: "" },
  { id: "leetcode", label: "LeetCode", completed: false, timeSpent: 0, notes: "" },
  { id: "github", label: "GitHub", completed: false, timeSpent: 0, notes: "" },
  { id: "project", label: "Personal Project", completed: false, timeSpent: 0, notes: "" },
  { id: "javascript", label: "JavaScript", completed: false, timeSpent: 0, notes: "" },
  { id: "react", label: "React", completed: false, timeSpent: 0, notes: "" },
  { id: "nodejs", label: "Node.js", completed: false, timeSpent: 0, notes: "" },
  { id: "system-design", label: "System Design", completed: false, timeSpent: 0, notes: "" },
  { id: "reading", label: "Reading", completed: false, timeSpent: 0, notes: "" },
  { id: "journal", label: "Journal", completed: false, timeSpent: 0, notes: "" },
  { id: "water", label: "Water Intake", completed: false, timeSpent: 0, notes: "" },
  { id: "sleep", label: "Sleep", completed: false, timeSpent: 0, notes: "" },
]

export const useDailyStore = create<DailyState>((set, get) => ({
  tasks: defaultTasks,
  loaded: false,
  selectedDate: new Date(),

  loadTasks: async () => {
    try {
      const serverTasks = await fetchDailyTasks()
      if (serverTasks.length > 0) {
        const mapped: DailyTaskItem[] = serverTasks.map((t) => ({
          id: t.id,
          label: t.label,
          completed: t.completed,
          timeSpent: t.timeSpent,
          notes: t.notes,
        }))
        set({ tasks: mapped, loaded: true })
      } else {
        set({ loaded: true })
      }
    } catch {
      set({ loaded: true })
    }
  },

  setTasks: (tasks) => {
    set({ tasks })
    saveDailyTasks(tasks.map((t) => ({ ...t, date: "" })))
  },

  toggleTask: (taskId) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const completed = !task.completed
    set({
      tasks: tasks.map((t) =>
        t.id === taskId ? { ...t, completed } : t
      ),
    })
    toggleDailyTask(taskId, completed)
  },

  updateTask: (taskId, updates) => {
    const { tasks } = get()
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    )
    set({ tasks: updated })
    saveDailyTasks(updated.map((t) => ({ ...t, date: "" })))
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  getCompletionPercentage: () => {
    const { tasks } = get()
    const completed = tasks.filter((t) => t.completed).length
    return Math.round((completed / tasks.length) * 100)
  },
}))