"use server"

import { getDb } from "@/lib/mongodb"
import { getUserId, findMany } from "@/lib/db-actions"
import {
  fetchGitHubEvents,
  fetchGitHubRepos,
  fetchGitHubUser,
  fetchContributionCalendar as fetchCalendarFromGitHub,
} from "@/lib/github"
import type { GitHubAccount, GitHubActivity } from "@/types"
import type { GitHubRepository } from "@/lib/github"

const SYNC_INTERVAL_MS = 10 * 60 * 1000

interface SyncResult {
  added: number
  total: number
  skipped: boolean
  message: string
}

export async function getGitHubAccount(): Promise<GitHubAccount | null> {
  const userId = await getUserId()
  const db = await getDb()
  const doc = await db.collection("github_accounts").findOne({ userId })
  if (!doc) return null
  const { _id, ...rest } = doc as unknown as Record<string, unknown>
  return { ...rest, id: String(_id) } as unknown as GitHubAccount
}

export async function saveGitHubAccount(username: string): Promise<GitHubAccount> {
  const userId = await getUserId()
  const name = username.trim()
  if (!name) throw new Error("Please enter your GitHub username")
  const valid = await fetchGitHubUser(name)
  if (!valid) throw new Error("GitHub user not found. Make sure your profile is public.")

  const db = await getDb()
  await db.collection("github_accounts").updateOne(
    { userId },
    {
      $set: { username: name, lastError: "", updatedAt: new Date().toISOString() },
      $setOnInsert: { connectedAt: new Date().toISOString() },
    },
    { upsert: true }
  )
  const updated = await getGitHubAccount()
  if (!updated) throw new Error("Failed to save GitHub account")
  return updated
}

export async function disconnectGitHubAccount(): Promise<{ ok: boolean }> {
  const userId = await getUserId()
  const db = await getDb()
  await db.collection("github_accounts").deleteOne({ userId })
  return { ok: true }
}

export async function syncGitHubActivities(): Promise<SyncResult> {
  const userId = await getUserId()
  const db = await getDb()
  const account = await db.collection("github_accounts").findOne({ userId })
  if (!account) throw new Error("No GitHub account connected")

  const now = Date.now()
  const lastSyncAt = account.lastSyncAt ? new Date(account.lastSyncAt as string).getTime() : 0
  if (now - lastSyncAt < SYNC_INTERVAL_MS) {
    return { added: 0, total: 0, skipped: true, message: "Already synced recently" }
  }

  try {
    const username = account.username as string
    const events = await fetchGitHubEvents(username, 100)

    const existing = await db
      .collection("github_activities")
      .find({ userId, eventId: { $exists: true } })
      .project({ eventId: 1 })
      .toArray()
    const existingIds = new Set(existing.map((e) => e.eventId as string).filter(Boolean))
    const candidates = events.filter((e) => !existingIds.has(e.eventId))

    let added = 0
    for (const ev of candidates) {
      const date = ev.createdAt.slice(0, 10)
      await db.collection("github_activities").insertOne({
        eventId: ev.eventId,
        type: ev.type,
        repository: ev.repository,
        title: ev.title,
        url: ev.url,
        date,
        createdAt: ev.createdAt,
        userId,
      })
      added++
    }

    const [profile, repos, calendar] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
      fetchCalendarFromGitHub(username),
    ])
    const stars = repos.reduce((s, r) => s + r.stars, 0)
    const forks = repos.reduce((s, r) => s + r.forks, 0)
    const top: GitHubRepository[] = [...repos].sort((a, b) => b.stars - a.stars).slice(0, 5)

    await db.collection("github_accounts").updateOne(
      { userId },
      {
        $set: {
          lastSyncAt: new Date().toISOString(),
          lastError: "",
          avatarUrl: profile.avatarUrl,
          profileUrl: profile.url,
          displayName: profile.name,
          bio: profile.bio ?? "",
          followers: profile.followers,
          following: profile.following,
          repositories: profile.publicRepos,
          stars,
          forks,
          topRepositories: top,
          repoList: repos,
          currentStreak: calendar.currentStreak,
          longestStreak: calendar.longestStreak,
          totalContributions: calendar.totalContributions,
          contributionCalendar: calendar.days,
          syncedEventIds: candidates.map((c) => c.eventId),
          updatedAt: new Date().toISOString(),
        },
      }
    )

    return {
      added,
      total: events.length,
      skipped: false,
      message:
        added > 0
          ? `Imported ${added} ${added === 1 ? "activity" : "activities"}`
          : "No new activity found",
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed"
    await db.collection("github_accounts").updateOne(
      { userId },
      { $set: { lastError: msg, updatedAt: new Date().toISOString() } }
    )
    throw new Error(msg)
  }
}

export async function fetchGitHubProfile() {
  const account = await getGitHubAccount()
  if (!account) return null
  return {
    username: account.username,
    displayName: account.displayName ?? "",
    bio: account.bio ?? "",
    avatarUrl: account.avatarUrl ?? "",
    profileUrl: account.profileUrl ?? "",
    followers: account.followers ?? 0,
    following: account.following ?? 0,
  }
}

export async function fetchGitHubRepositories() {
  const account = await getGitHubAccount()
  if (!account) return null
  return {
    repositories: account.repositories ?? 0,
    stars: account.stars ?? 0,
    forks: account.forks ?? 0,
    top: account.topRepositories ?? [],
    list: account.repoList ?? [],
  }
}

export async function fetchContributionCalendar() {
  const account = await getGitHubAccount()
  if (!account) return null
  return {
    days: account.contributionCalendar ?? [],
    currentStreak: account.currentStreak ?? 0,
    longestStreak: account.longestStreak ?? 0,
    totalContributions: account.totalContributions ?? 0,
  }
}

export async function fetchGitHubDashboard() {
  const account = await getGitHubAccount()
  if (!account) return null
  const activities = await findMany<GitHubActivity>("github_activities")
  return {
    account,
    calendar: {
      days: account.contributionCalendar ?? [],
      currentStreak: account.currentStreak ?? 0,
      longestStreak: account.longestStreak ?? 0,
      totalContributions: account.totalContributions ?? 0,
    },
    repositories: account.repoList ?? [],
    activities,
  }
}
