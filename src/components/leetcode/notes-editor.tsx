"use client"
import { useEffect, useRef, useState } from "react"
import { Check, Eye, Pencil, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MarkdownPreview } from "./markdown-preview"
import { cn } from "@/lib/utils"

export function NotesEditor({
  value,
  onSave,
  placeholder = "Write markdown notes... use ``` for code, | for tables, - for lists",
}: {
  value: string
  onSave: (v: string) => Promise<void> | void
  placeholder?: string
}) {
  const [draft, setDraft] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRef = useRef(value)

  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(value)
  }

  useEffect(() => {
    latestRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const onChange = (v: string) => {
    setDraft(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      if (v === latestRef.current) return
      setSaving(true)
      try {
        await onSave(v)
        latestRef.current = v
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } finally {
        setSaving(false)
      }
    }, 600)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant={!preview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPreview(false)}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            <Pencil className="h-3.5 w-3.5" />Write
          </Button>
          <Button
            variant={preview ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPreview(true)}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />Preview
          </Button>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saved && (
            <span className="flex items-center gap-1 text-green-400">
              <Check className="h-3.5 w-3.5" />Saved
            </span>
          )}
        </div>
      </div>

      {preview ? (
        <div className="min-h-[140px] rounded-lg border border-border/50 bg-background/50 p-3">
          {draft.trim() ? (
            <MarkdownPreview content={draft} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <Textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            if (timer.current) clearTimeout(timer.current)
            if (draft !== latestRef.current) {
              setSaving(true)
              Promise.resolve(onSave(draft)).finally(() => {
                latestRef.current = draft
                setSaving(false)
              })
            }
          }}
          placeholder={placeholder}
          className={cn("min-h-[140px] font-mono text-sm")}
        />
      )}
    </div>
  )
}
