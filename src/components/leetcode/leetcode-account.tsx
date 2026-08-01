"use client"
import { useState, useEffect, useCallback } from "react"
import { Link2, Unlink, RefreshCw, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getLeetCodeAccount,
  saveLeetCodeAccount,
  disconnectLeetCodeAccount,
  syncLeetCodeSolutions,
} from "@/actions/leetcode-sync"
import type { LeetCodeAccount } from "@/types"

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

export function LeetCodeAccountCard() {
  const [account, setAccount] = useState<LeetCodeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const timeZone =
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined

  const load = useCallback(async () => {
    try {
      const acc = await getLeetCodeAccount()
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

  const runSync = async (uname: string) => {
    setSyncing(true)
    setMessage(null)
    try {
      const res = await syncLeetCodeSolutions(timeZone)
      setMessage({ type: "success", text: res.message })
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
      const acc = await saveLeetCodeAccount(username.trim())
      setAccount(acc)
      setMessage({ type: "success", text: `Connected as ${acc.username}` })
      await runSync(acc.username)
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to connect" })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectLeetCodeAccount()
      setAccount(null)
      setUsername("")
      setMessage(null)
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
          LeetCode Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : account ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium break-all">
                  {account.username}
                  <a
                    href={`https://leetcode.com/${account.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1.5 inline-flex align-middle text-primary hover:opacity-80"
                    aria-label="Open LeetCode profile"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">Last synced {timeAgo(account.lastSyncAt)}</p>
              </div>
              <div className="flex items-stretch gap-2 w-full sm:w-auto">
                <Button size="sm" className="flex-1 sm:flex-none" onClick={() => runSync(account.username)} disabled={busy}>
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
              Your recent solves on LeetCode will be imported automatically. Only the last ~20 submissions are
              available publicly, so past solves before connecting won&apos;t be imported.
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
              Connect your LeetCode account to auto-import solved questions into your tracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="leetcode-username" className="sr-only">
                  LeetCode username
                </Label>
                <Input
                  id="leetcode-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="LeetCode username"
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
