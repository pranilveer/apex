"use client"
import { useState, useEffect, useCallback } from "react"
import { Link2, Unlink, RefreshCw, Loader2, CheckCircle2, AlertCircle, ExternalLink, GitFork } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getGitHubAccount,
  saveGitHubAccount,
  disconnectGitHubAccount,
  syncGitHubActivities,
} from "@/actions/github-sync"
import type { GitHubAccount } from "@/types"

function timeAgo(ts?: string): string {
  if (!ts) return "Never"
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60_000) return "Just now"
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-3 py-2 text-center">
      <p className="text-lg font-bold leading-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

export function GithubAccountCard({ onSynced }: { onSynced?: () => void }) {
  const [account, setAccount] = useState<GitHubAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const acc = await getGitHubAccount()
      setAccount(acc)
      setUsername(acc?.username ?? "")
    } catch {
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const runSync = async () => {
    setSyncing(true)
    setMessage(null)
    try {
      const res = await syncGitHubActivities()
      setMessage({ type: "success", text: res.message })
      onSynced?.()
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Sync failed" })
    } finally {
      setSyncing(false)
      load()
    }
  }

  const handleConnect = async () => {
    if (!username.trim()) return
    setConnecting(true)
    setMessage(null)
    try {
      const acc = await saveGitHubAccount(username.trim())
      setAccount(acc)
      setMessage({ type: "success", text: `Connected as ${acc.username}` })
      await runSync()
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to connect" })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectGitHubAccount()
      setAccount(null)
      setUsername("")
      setMessage(null)
      onSynced?.()
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to disconnect" })
    }
  }

  const busy = connecting || syncing

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" />
          GitHub Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : account ? (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {account.avatarUrl ? (
                  <img
                    src={account.avatarUrl}
                    alt={account.username}
                    className="h-14 w-14 rounded-full border border-border/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                    <GitFork className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-all">
                    {account.displayName || account.username}
                    <a
                      href={account.profileUrl ?? `https://github.com/${account.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1.5 inline-flex align-middle text-primary hover:opacity-80"
                      aria-label="Open GitHub profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{account.username} · Last synced {timeAgo(account.lastSyncAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <Stat label="Followers" value={account.followers ?? 0} />
                <Stat label="Following" value={account.following ?? 0} />
                <Stat label="Repositories" value={account.repositories ?? 0} />
                <Stat label="Stars" value={account.stars ?? 0} />
                <Stat label="Streak" value={account.currentStreak ?? 0} />
              </div>

              <div className="flex items-stretch gap-2 w-full sm:w-auto">
                <Button size="sm" className="flex-1 sm:flex-none" onClick={runSync} disabled={busy}>
                  {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Sync now
                </Button>
                <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={busy}>
                  <Unlink className="h-4 w-4" />
                  <span className="sm:hidden">Disconnect</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your recent public GitHub activity will be imported automatically. Only public events are
              available, and the contribution streak is based on your public contributions graph.
            </p>
            {account.lastError && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
                <span>Last sync failed: {account.lastError}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Connect your GitHub account to auto-import your contribution activity into your tracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="github-username" className="sr-only">
                  GitHub username
                </Label>
                <Input
                  id="github-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="GitHub username"
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  disabled={busy}
                />
              </div>
              <Button className="w-full sm:w-auto" onClick={handleConnect} disabled={busy || !username.trim()}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Connect
              </Button>
            </div>
          </>
        )}
        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              message.type === "success"
                ? "border border-green-400/30 bg-green-400/10 text-green-400"
                : "border border-red-400/30 bg-red-400/10 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-px" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-px" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
