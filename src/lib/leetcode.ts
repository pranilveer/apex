const LEETCODE_GRAPHQL = "https://leetcode.com/graphql"

interface GraphQLData {
  data?: Record<string, unknown>
  errors?: { message?: string }[]
}

async function graphql(query: string, variables: Record<string, unknown>): Promise<Record<string, unknown>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "apex-tracker/1.0" },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      cache: "no-store",
    })
    if (res.status === 429) throw new Error("LeetCode is rate limiting requests, please try again in a few minutes")
    if (!res.ok) throw new Error(`LeetCode API error (${res.status})`)
    const json = (await res.json()) as GraphQLData
    if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "LeetCode API error")
    return json.data ?? {}
  } finally {
    clearTimeout(timeout)
  }
}

export interface LeetCodeRecentSubmission {
  title: string
  titleSlug: string
  timestamp: string
}

export async function fetchUserProfile(username: string): Promise<boolean> {
  const data = await graphql(
    `query userPublicProfile($username: String!) {
      matchedUser(username: $username) { username }
    }`,
    { username }
  )
  return Boolean((data.matchedUser as { username?: string } | null)?.username)
}

export async function fetchRecentAcSubmissions(username: string, limit = 20): Promise<LeetCodeRecentSubmission[]> {
  const data = await graphql(
    `query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) { title titleSlug timestamp }
    }`,
    { username, limit }
  )
  return (data.recentAcSubmissionList as LeetCodeRecentSubmission[] | null) ?? []
}

export function dateStrFromTimestamp(timestamp: string, timeZone?: string): string {
  const dt = new Date(Number(timestamp) * 1000)
  if (isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10)
  if (timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(dt)
    const get = (type: string) => parts.find((p) => p.type === type)?.value
    return `${get("year")}-${get("month")}-${get("day")}`
  }
  return dt.toISOString().slice(0, 10)
}
