export const APP_NAME = "DailyTracker"
export const APP_DESCRIPTION = "Your all-in-one productivity tracker for cracking product companies"

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Goals", href: "/goals", icon: "Target" },
  { title: "LeetCode", href: "/leetcode", icon: "Code2" },
  { title: "GitHub", href: "/github", icon: "Github" },
  { title: "Projects", href: "/projects", icon: "FolderKanban" },
  { title: "Interview Prep", href: "/interview", icon: "BookOpen" },
  { title: "Journal", href: "/journal", icon: "PenLine" },
  { title: "Habits", href: "/habits", icon: "CheckCircle2" },
  { title: "Job Switch", href: "/jobs", icon: "Briefcase" },
  { title: "Resumes", href: "/resumes", icon: "FileText" },
  { title: "Resources", href: "/resources", icon: "Bookmark" },
  { title: "Analytics", href: "/analytics", icon: "BarChart3" },
  { title: "Notifications", href: "/notifications", icon: "Bell" },
  { title: "Gamification", href: "/gamification", icon: "Trophy" },
  { title: "AI Coach", href: "/ai-coach", icon: "Brain" },
  { title: "Settings", href: "/settings", icon: "Settings" },
] as const

export const DAILY_TASKS = [
  { id: "gym", label: "Gym", icon: "Dumbbell", category: "health" },
  { id: "office", label: "Office Work", icon: "Building2", category: "work" },
  { id: "leetcode", label: "LeetCode", icon: "Code2", category: "coding" },
  { id: "github", label: "GitHub", icon: "Github", category: "coding" },
  { id: "project", label: "Personal Project", icon: "FolderKanban", category: "coding" },
  { id: "javascript", label: "JavaScript", icon: "Braces", category: "learning" },
  { id: "react", label: "React", icon: "Atom", category: "learning" },
  { id: "nodejs", label: "Node.js", icon: "Server", category: "learning" },
  { id: "system-design", label: "System Design", icon: "Network", category: "learning" },
  { id: "reading", label: "Reading", icon: "BookOpen", category: "growth" },
  { id: "journal", label: "Journal", icon: "PenLine", category: "growth" },
  { id: "water", label: "Water Intake", icon: "Droplets", category: "health" },
  { id: "sleep", label: "Sleep", icon: "Moon", category: "health" },
] as const

export const INTERVIEW_TOPICS = [
  { id: "dsa", label: "DSA", icon: "Code2", color: "purple" },
  { id: "javascript", label: "JavaScript", icon: "Braces", color: "yellow" },
  { id: "react", label: "React", icon: "Atom", color: "cyan" },
  { id: "node", label: "Node.js", icon: "Server", color: "green" },
  { id: "system-design", label: "System Design", icon: "Network", color: "blue" },
  { id: "os", label: "Operating System", icon: "Monitor", color: "orange" },
  { id: "dbms", label: "DBMS", icon: "Database", color: "pink" },
  { id: "cn", label: "Computer Networks", icon: "Wifi", color: "indigo" },
  { id: "oop", label: "OOP", icon: "Boxes", color: "teal" },
  { id: "hr", label: "HR Questions", icon: "Users", color: "rose" },
  { id: "behavioral", label: "Behavioral", icon: "MessageSquare", color: "lime" },
] as const

export const RESOURCE_CATEGORIES = [
  "React", "Node", "AWS", "Docker", "Redis", "System Design", "DSA",
  "JavaScript", "TypeScript", "Next.js", "PostgreSQL", "MongoDB",
  "GraphQL", "Testing", "DevOps", "AI/ML"
] as const

export const MOOD_OPTIONS = [
  { value: "great", label: "Great", emoji: "🔥", color: "text-green-400" },
  { value: "good", label: "Good", emoji: "😊", color: "text-blue-400" },
  { value: "okay", label: "Okay", emoji: "😐", color: "text-yellow-400" },
  { value: "bad", label: "Bad", emoji: "😔", color: "text-orange-400" },
  { value: "terrible", label: "Terrible", emoji: "💀", color: "text-red-400" },
] as const

export const ENERGY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export const BADGES = [
  { id: "first-day", name: "First Day", description: "Complete your first day", icon: "🌟" },
  { id: "week-streak", name: "Week Warrior", description: "7 day streak", icon: "🔥" },
  { id: "month-streak", name: "Monthly Master", description: "30 day streak", icon: "👑" },
  { id: "hundred-leetcode", name: "Century Coder", description: "Solve 100 LeetCode problems", icon: "💯" },
  { id: "early-bird", name: "Early Bird", description: "Wake up before 6 AM for 7 days", icon: "🐦" },
  { id: "gym-rat", name: "Gym Rat", description: "30 day gym streak", icon: "💪" },
  { id: "code-monkey", name: "Code Monkey", description: "100 GitHub contributions in a month", icon: "🐙" },
  { id: "interview-ready", name: "Interview Ready", description: "Complete all interview prep topics", icon: "🎯" },
  { id: "bookworm", name: "Bookworm", description: "Read 10 books", icon: "📚" },
  { id: "hydrated", name: "Stay Hydrated", description: "30 day water intake streak", icon: "💧" },
  { id: "first-commit", name: "First Commit", description: "Make your first commit", icon: "🚀" },
  { id: "commits-10", name: "Committer", description: "Make 10 commits", icon: "🔟" },
  { id: "commits-100", name: "Century Committer", description: "Make 100 commits", icon: "🎖️" },
  { id: "commits-500", name: "Legend", description: "Make 500 commits", icon: "🏆" },
  { id: "open-source-contributor", name: "Open Source Contributor", description: "25 contributions to open source repositories", icon: "🌍" },
  { id: "repository-creator", name: "Repository Creator", description: "Create a repository", icon: "🆕" },
  { id: "stars-100", name: "Star Collector", description: "Earn 100 stars across your repositories", icon: "⭐" },
  { id: "pr-master", name: "Pull Request Master", description: "Open 25 pull requests", icon: "🔀" },
  { id: "code-reviewer", name: "Code Reviewer", description: "Review 10 pull requests", icon: "👁️" },
] as const
