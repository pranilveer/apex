const GITHUB_API = "https://api.github.com"
const GITHUB_USER_AGENT = "apex-tracker/1.0"

export interface GitHubUserProfile {
  username: string
  name?: string
  bio?: string
  avatarUrl: string
  url: string
  followers: number
  following: number
  publicRepos: number
}

export interface GitHubRepository {
  name: string
  stars: number
  forks: number
  language: string
  archived: boolean
  createdAt: string
  pushedAt: string
  url: string
  description: string
}

export interface GitHubSyncEvent {
  eventId: string
  type: string
  repository: string
  title: string
  url: string
  createdAt: string
  action?: string
  merged?: boolean
  refType?: string
  commitCount?: number
  repoFull?: string
}

export const GITHUB_INACTIVE_DAYS = 7
export const GITHUB_MILESTONES = [100, 500, 1000] as const
export const GITHUB_STREAK_WARNING_HOUR = 18
export const CODING_MINUTES_PER_COMMIT = 30

export interface GitHubCalendarDay {
  date: string
  count: number
}

export interface GitHubContributionCalendar {
  days: GitHubCalendarDay[]
  currentStreak: number
  longestStreak: number
  totalContributions: number
}

async function apiGet(path: string, extraHeaders?: Record<string, string>): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": GITHUB_USER_AGENT,
        ...extraHeaders,
      },
      signal: controller.signal,
      cache: "no-store",
    })
    if (res.status === 403 || res.status === 429) {
      throw new Error("GitHub is rate limiting requests, please try again in a few minutes")
    }
    if (res.status === 404) throw new Error("GitHub user not found. Make sure your profile is public.")
    if (!res.ok) throw new Error(`GitHub API error (${res.status})`)
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUserProfile> {
  const data = (await apiGet(`/users/${encodeURIComponent(username)}`)) as {
    login?: string
    name?: string
    bio?: string
    avatar_url?: string
    html_url?: string
    followers?: number
    following?: number
    public_repos?: number
  }
  return {
    username: data.login ?? username,
    name: data.name ?? "",
    bio: data.bio ?? "",
    avatarUrl: data.avatar_url ?? "",
    url: data.html_url ?? `https://github.com/${username}`,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    publicRepos: data.public_repos ?? 0,
  }
}

export async function fetchGitHubRepos(username: string, maxPages = 1): Promise<GitHubRepository[]> {
  const repos: GitHubRepository[] = []
  let page = 1
  let keepGoing = true
  while (keepGoing && page <= maxPages) {
    const data = (await apiGet(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&page=${page}`
    )) as {
      name?: string
      description?: string
      stargazers_count?: number
      forks_count?: number
      language?: string | null
      archived?: boolean
      created_at?: string
      pushed_at?: string
      html_url?: string
    }[]
    if (!Array.isArray(data)) break
    for (const r of data) {
      repos.push({
        name: r.name ?? "",
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        language: r.language ?? "",
        archived: r.archived ?? false,
        createdAt: r.created_at ?? "",
        pushedAt: r.pushed_at ?? "",
        url: r.html_url ?? `https://github.com/${username}/${r.name}`,
        description: r.description ?? "",
      })
    }
    if (data.length < 100) keepGoing = false
    page++
  }
  return repos
}

export async function fetchGitHubCommitCount(username: string): Promise<number> {
  try {
    const data = (await apiGet(
      `/search/commits?q=author:${encodeURIComponent(username)}&per_page=1`,
      { Accept: "application/vnd.github+json, application/vnd.github.cloak-preview" }
    )) as { total_count?: number }
    return Number(data.total_count ?? 0)
  } catch {
    return 0
  }
}

export async function fetchGitHubOpenPrs(username: string): Promise<number> {
  try {
    const data = (await apiGet(
      `/search/issues?q=author:${encodeURIComponent(username)}+type:pr+is:open&per_page=1`
    )) as { total_count?: number }
    return Number(data.total_count ?? 0)
  } catch {
    return 0
  }
}

const EVENT_TYPES: Record<string, string> = {
  PushEvent: "push",
  CreateEvent: "create",
  PullRequestEvent: "pull_request",
  PullRequestReviewEvent: "review",
  IssuesEvent: "issue",
  ReleaseEvent: "release",
  ForkEvent: "fork",
}

export async function fetchGitHubEvents(username: string, limit = 100): Promise<GitHubSyncEvent[]> {
  const data = (await apiGet(
    `/users/${encodeURIComponent(username)}/events/public?per_page=100`
  )) as {
    id?: string
    type?: string
    created_at?: string
    repo?: { name?: string }
    payload?: {
      ref_type?: string
      ref?: string
      commits?: { message?: string; sha?: string }[]
      action?: string
      pull_request?: { html_url?: string; merged?: boolean }
      issue?: { html_url?: string; state?: string }
      release?: { html_url?: string }
    }
  }[]
  if (!Array.isArray(data)) return []

  const events: GitHubSyncEvent[] = []
  for (const e of data) {
    if (!e.id) continue
    const repoFull = e.repo?.name ?? ""
    const repoName = repoFull.split("/").pop() ?? (repoFull || "github")
    const type = EVENT_TYPES[e.type ?? ""] ?? "activity"
    const action = e.payload?.action
    const sha = e.payload?.commits?.[0]?.sha
    const commitMessage = e.payload?.commits?.[0]?.message?.split("\n")[0]

    let title: string
    let url: string
    switch (type) {
      case "push":
        title = commitMessage || `Pushed to ${e.payload?.ref ?? "repository"}`
        url = sha ? `https://github.com/${repoFull}/commit/${sha}` : `https://github.com/${repoFull}`
        break
      case "create":
        title = `Created ${e.payload?.ref_type ?? ""} ${e.payload?.ref ?? ""}`.trim()
        url = `https://github.com/${repoFull}`
        break
      case "pull_request":
        title = e.payload?.pull_request?.html_url ? `Pull request ${action ?? ""}`.trim() : "Pull request activity"
        url = e.payload?.pull_request?.html_url ?? `https://github.com/${repoFull}`
        break
      case "review":
        title = action ? `Reviewed a pull request (${action})` : "Reviewed a pull request"
        url = `https://github.com/${repoFull}`
        break
      case "issue":
        title = e.payload?.issue?.html_url ? `Issue ${action ?? ""}`.trim() : "Issue activity"
        url = e.payload?.issue?.html_url ?? `https://github.com/${repoFull}`
        break
      case "release":
        title = "Published a release"
        url = e.payload?.release?.html_url ?? `https://github.com/${repoFull}`
        break
      default:
        title = `${type} in ${repoName}`
        url = `https://github.com/${repoFull}`
    }

    events.push({
      eventId: e.id,
      type,
      repository: repoName,
      title,
      url,
      createdAt: e.created_at ?? new Date().toISOString(),
      action,
      merged: type === "pull_request" ? e.payload?.pull_request?.merged ?? false : undefined,
      refType: type === "create" ? e.payload?.ref_type : undefined,
      commitCount: type === "push" ? e.payload?.commits?.length ?? 1 : undefined,
      repoFull,
    })
    if (events.length >= limit) break
  }
  return events
}

export async function fetchContributionCalendar(username: string): Promise<GitHubContributionCalendar> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  let html = ""
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      headers: { "User-Agent": GITHUB_USER_AGENT },
      signal: controller.signal,
      cache: "no-store",
    })
    if (res.status === 404) throw new Error("GitHub user not found. Make sure your profile is public.")
    if (!res.ok) throw new Error(`GitHub API error (${res.status})`)
    html = await res.text()
  } finally {
    clearTimeout(timeout)
  }

  const dayMap = new Map<string, number>()
  const pattern = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*?(?:data-count="(\d+)")?/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(html)) !== null) {
    const date = match[1]
    let count = Number(match[2] ?? 0)
    if (!match[2]) {
      const labelMatch = html.slice(match.index, match.index + 400).match(/(\d+)\s+contribution/)
      if (labelMatch) count = Number(labelMatch[1])
    }
    const existing = dayMap.get(date) ?? 0
    if (count > existing) dayMap.set(date, count)
  }

  const days = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const { currentStreak, longestStreak } = computeStreak(days)
  const totalContributions = days.reduce((s, d) => s + d.count, 0)

  return { days, currentStreak, longestStreak, totalContributions }
}

export function computeStreak(days: { date: string; count: number }[]): { currentStreak: number; longestStreak: number } {
  const daySet = new Set(days.filter((d) => d.count > 0).map((d) => d.date))
  const sorted = [...daySet].sort()
  if (!sorted.length) return { currentStreak: 0, longestStreak: 0 }

  const prevDay = (date: string) => {
    const dt = new Date(`${date}T00:00:00`)
    dt.setDate(dt.getDate() - 1)
    return dt.toISOString().slice(0, 10)
  }

  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (prevDay(sorted[i]) === sorted[i - 1]) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const yesterdayKey = prevDay(todayKey)
  const hasToday = daySet.has(todayKey)
  const startKey = hasToday ? todayKey : yesterdayKey
  let current = 0
  let cursor = startKey
  while (daySet.has(cursor)) {
    current++
    cursor = prevDay(cursor)
  }

  return { currentStreak: current, longestStreak: longest }
}
