export interface DailyTask {
  id: string
  label: string
  completed: boolean
  timeSpent: number
  notes: string
  date: string
}

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  targetValue: number
  currentValue: number
  unit: string
  category: string
  priority: string
}

export interface HabitEntry {
  date: string
  habits: Record<string, boolean>
}

export interface LeetCodeProblem {
  id: string
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
  pattern: string
  solvedDate: string
  timeTaken: number
  needsRevision: boolean
  companyTags: string[]
  notes: string
}

export interface GitHubActivity {
  id: string
  date: string
  repository: string
  commitCount: number
  featureBuilt: string
  hoursSpent: number
}

export interface Project {
  id: string
  name: string
  description: string
  status: string
  techStack: string[]
  repoUrl: string
  liveUrl: string
  features: string[]
  tasks: ProjectTask[]
}

export interface ProjectTask {
  id: string
  title: string
  status: "todo" | "in-progress" | "done"
}

export interface JobApplication {
  id: string
  company: string
  role: string
  status: string
  appliedDate: string
  referralStatus: string
  salaryOffered: number
  expectedSalary: number
  notes: string
}

export interface Resume {
  id: string
  name: string
  version: string
  isDefault: boolean
  coverLetter: string
  createdAt: string
}

export interface ApplicationRecord {
  id: string
  company: string
  resumeUsed: string
  result: string
  date: string
  notes: string
}

export interface Resource {
  id: string
  title: string
  url: string
  type: string
  category: string[]
  notes: string
  bookmarked: boolean
}

export interface JournalEntry {
  date: string
  morningGoals: string
  eveningReflection: string
  wins: string
  mistakes: string
  tomorrowPlan: string
  mood: string
  energy: number
}

export interface InterviewTopic {
  id: string
  label: string
  icon: string
  color: string
  progress: number
  notes: string
  resources: string[]
  bookmarks: string[]
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  time: string
  read: boolean
}

export interface ReminderSetting {
  id: string
  label: string
  time: string
  enabled: boolean
}

export interface GamificationData {
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  dailyScore: number
  badges: string[]
}
