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
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
