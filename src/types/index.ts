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

export type MistakeType =
  | "Pattern not recognized"
  | "Binary Search Logic"
  | "Sliding Window Logic"
  | "Off by One"
  | "Wrong Condition"
  | "Edge Case"
  | "Overflow"
  | "Wrong Complexity"
  | "Forgot Formula"
  | "Implementation Bug"
  | "Other"

export interface AttemptRecord {
  type: "solved" | "revision"
  date: string // YYYY-MM-DD
  confidence?: number
}

export type BookmarkKey = "isFavorite" | "isMustRevise" | "isInterviewFavorite" | "isCompanyFavorite"

export type RevisionMode = "solved" | "revision" | "combined"

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
  slug?: string
  frontendId?: number
  // Spaced repetition
  nextRevisionDate?: string
  revisionCount?: number
  lastRevisionDate?: string
  confidence?: number
  mistakes?: MistakeType[]
  attemptHistory?: AttemptRecord[]
  // Bookmarks
  isFavorite?: boolean
  isMustRevise?: boolean
  isInterviewFavorite?: boolean
  isCompanyFavorite?: boolean
}

export interface LeetCodeAccount {
  id: string
  username: string
  lastSyncAt?: string
  syncedSlugs?: string[]
  lastError?: string
}

export type JournalMood = "Great" | "Good" | "Okay" | "Tired" | "Stressed"

export interface LeetCodeJournal {
  id: string
  date: string // YYYY-MM-DD
  learned: string
  mistakes: string
  interviewLearnings: string
  tomorrowPlan: string
  mood: JournalMood
  energy: number // 1-5
}

export interface LeetCodeQuestion {
  id: string
  frontendId: number
  title: string
  slug: string
  difficulty: "Easy" | "Medium" | "Hard"
  topics: string[]
  url: string
  isPremium?: boolean
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

export interface StatusHistoryEntry {
  status: string
  date: string
  notes?: string
}

export interface Interview {
  id: string
  date: string
  time: string
  type: string
  mode: "online" | "offline"
  meetingLink: string
  roundNumber: number
  interviewerName: string
  reminder: boolean
  notes: string
}

export interface FollowUp {
  id: string
  date: string
  notes: string
  completed: boolean
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
  location: string
  workMode: "remote" | "hybrid" | "onsite" | ""
  source: string
  jobUrl: string
  recruiterName: string
  recruiterEmail: string
  recruiterLinkedIn: string
  resumeVersion: string
  coverLetter: string
  portfolioUrl: string
  githubUrl: string
  linkedInUrl: string
  interviewNotes: string
  archived: boolean
  statusHistory: StatusHistoryEntry[]
  interviews: Interview[]
  followUps: FollowUp[]
}

export interface WishlistCompany {
  id: string
  company: string
  role: string
  priority: "low" | "medium" | "high" | "dream"
  notes: string
  applicationDeadline: string
  applied: boolean
  jobLink: string
}

export interface JobGoal {
  id: string
  type: "daily" | "weekly" | "monthly"
  target: number
  current: number
}

export interface InterviewLearning {
  id: string
  jobId: string
  questionsAsked: string
  mistakes: string
  topicsToRevise: string
  difficulty: "easy" | "medium" | "hard"
  confidenceRating: number
  date: string
}

export interface ApplicationStreak {
  currentStreak: number
  longestStreak: number
  missedDays: number
  heatmapData: { date: string; count: number }[]
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
