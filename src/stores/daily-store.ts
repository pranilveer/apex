"use client"
import { create } from 'zustand'

export interface DailyTaskItem {
  id: string
  label: string
  completed: boolean
  timeSpent: number
  notes: string
}

interface DailyState {
  tasks: DailyTaskItem[]
  selectedDate: Date
  setTasks: (tasks: DailyTaskItem[]) => void
  toggleTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<DailyTaskItem>) => void
  setSelectedDate: (date: Date) => void
  getCompletionPercentage: () => number
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
  selectedDate: new Date(),
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  getCompletionPercentage: () => {
    const { tasks } = get()
    const completed = tasks.filter((t) => t.completed).length
    return Math.round((completed / tasks.length) * 100)
  },
}))
