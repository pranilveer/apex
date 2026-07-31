"use client"
import { cn } from "@/lib/utils"
import { MISTAKE_TYPES } from "@/lib/revision"
import type { MistakeType } from "@/types"

export function MistakePicker({
  value = [],
  onChange,
}: {
  value?: MistakeType[]
  onChange: (v: MistakeType[]) => void
}) {
  const toggle = (m: MistakeType) => {
    onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m])
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {MISTAKE_TYPES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => toggle(m)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs transition-colors",
            value.includes(m)
              ? "border-red-400/40 bg-red-400/10 text-red-400"
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          {m}
        </button>
      ))}
    </div>
  )
}
