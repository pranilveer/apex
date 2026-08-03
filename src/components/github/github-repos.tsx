"use client"
import { useMemo } from "react"
import { Star, GitFork, CalendarClock, Archive, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { GitHubRepoInfo } from "@/types"

function timeAgo(dateStr?: string) {
  if (!dateStr) return "never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(0, mins)}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function RepoRow({ repo }: { repo: GitHubRepoInfo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg -mx-2 px-2 py-2 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{repo.name}</span>
        <span className="flex items-center gap-2.5 shrink-0 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {repo.forks}
          </span>
        </span>
      </div>
      {repo.description ? (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{repo.description}</p>
      ) : null}
      <div className="flex items-center gap-2 mt-1.5">
        {repo.language ? <Badge variant="secondary">{repo.language}</Badge> : null}
        {repo.archived ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        ) : null}
        <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          {timeAgo(repo.pushedAt)}
        </span>
      </div>
    </a>
  )
}

export function GitHubRepos({ repositories }: { repositories: GitHubRepoInfo[] }) {
  const sections = useMemo(() => {
    const byPushed = [...repositories].sort((a, b) => (b.pushedAt || "").localeCompare(a.pushedAt || ""))
    const byStars = [...repositories].sort((a, b) => b.stars - a.stars)
    const byCreated = [...repositories].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    const archived = repositories.filter((r) => r.archived).sort((a, b) => (b.pushedAt || "").localeCompare(a.pushedAt || ""))
    return [
      { title: "Most Active", Icon: CalendarClock, color: "text-green-400", repos: byPushed.slice(0, 5) },
      { title: "Top Starred", Icon: Star, color: "text-yellow-400", repos: byStars.slice(0, 5) },
      { title: "Newest", Icon: ArrowUpRight, color: "text-blue-400", repos: byCreated.slice(0, 5) },
      { title: "Archived", Icon: Archive, color: "text-muted-foreground", repos: archived.slice(0, 5) },
    ]
  }, [repositories])

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Repositories</h3>
      {repositories.length ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {sections.map(({ title, Icon, color, repos }) => (
            <Card key={title} className="p-4 sm:p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {repos.length ? (
                  <div className="flex flex-col">
                    {repos.map((repo) => (
                      <RepoRow key={repo.name} repo={repo} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">No repositories here yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-4 sm:p-6">
          <CardContent className="text-sm text-muted-foreground">
            Sync your account to see your repositories.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
