"use client"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { confidenceLabel } from "@/lib/revision"

export function ConfidenceStars({
  value = 0,
  onChange,
  size = "md",
}: {
  value?: number
  onChange?: (v: number) => void
  size?: "sm" | "md"
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"
  return (
    <div className="flex items-center gap-0.5" title={confidenceLabel(value)}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`Confidence ${n}`}
            onClick={() => onChange(n)}
            className={cn("transition-transform hover:scale-125 cursor-pointer")}
          >
            <Star className={cn(dim, (value ?? 0) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
          </button>
        ) : (
          <span key={n} aria-label={`Confidence ${n}`}>
            <Star className={cn(dim, (value ?? 0) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
          </span>
        )
      )}
    </div>
  )
}
