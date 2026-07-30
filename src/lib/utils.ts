import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function getDaysLeft(targetDate: string): number {
  const target = new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

export function getStreakColor(streak: number): string {
  if (streak >= 30) return "text-yellow-400"
  if (streak >= 14) return "text-orange-400"
  if (streak >= 7) return "text-green-400"
  return "text-zinc-400"
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-green-400 bg-green-400/10'
    case 'medium': return 'text-yellow-400 bg-yellow-400/10'
    case 'hard': return 'text-red-400 bg-red-400/10'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-green-400 bg-green-400/10'
    case 'in-progress': case 'in progress': return 'text-blue-400 bg-blue-400/10'
    case 'pending': return 'text-yellow-400 bg-yellow-400/10'
    case 'rejected': return 'text-red-400 bg-red-400/10'
    case 'applied': return 'text-blue-400 bg-blue-400/10'
    case 'oa': return 'text-yellow-400 bg-yellow-400/10'
    case 'interview': return 'text-purple-400 bg-purple-400/10'
    case 'hr': return 'text-cyan-400 bg-cyan-400/10'
    case 'offer': return 'text-green-400 bg-green-400/10'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function getJobStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'applied': return 'FileText'
    case 'oa': return 'Clock'
    case 'interview': return 'Phone'
    case 'hr': return 'Mail'
    case 'offer': return 'CheckCircle2'
    case 'rejected': return 'XCircle'
    default: return 'FileText'
  }
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return "-"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'dream': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
    case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    case 'low': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function getWorkModeColor(mode: string): string {
  switch (mode.toLowerCase()) {
    case 'remote': return 'text-green-400 bg-green-400/10'
    case 'hybrid': return 'text-yellow-400 bg-yellow-400/10'
    case 'onsite': return 'text-blue-400 bg-blue-400/10'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function groupByDate<T extends { appliedDate: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const existing = groups.get(item.appliedDate) || []
    existing.push(item)
    groups.set(item.appliedDate, existing)
  }
  return groups
}

export function getRelativeDayLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff} days ago`
  return formatDate(date)
}

export function calculateStreak(dates: string[]): { current: number; longest: number; missedDays: number } {
  if (dates.length === 0) return { current: 0, longest: 0, missedDays: 0 }
  const sorted = [...new Set(dates)].sort().reverse()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split("T")[0]
  
  let current = 0
  let longest = 0
  let streak = 0
  let missedDays = 0
  let prevDate: Date | null = null
  
  for (const d of sorted) {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    if (prevDate) {
      const diff = (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      if (diff > 1) missedDays += diff - 1
    }
    prevDate = date
  }
  
  // current streak
  let checkDate = new Date(todayStr)
  for (const d of sorted) {
    const dateStr = checkDate.toISOString().split("T")[0]
    if (sorted.includes(dateStr)) {
      current++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  
  // longest streak
  streak = 0
  sorted.reverse()
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      streak = 1
    } else {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        streak++
      } else {
        longest = Math.max(longest, streak)
        streak = 1
      }
    }
  }
  longest = Math.max(longest, streak)
  
  return { current, longest, missedDays }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
