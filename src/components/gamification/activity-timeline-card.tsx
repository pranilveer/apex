"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, History, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SOURCE_ICONS, SOURCE_COLORS } from "./icon-map"
import type { TimelineGroup } from "@/lib/gamification"

export function ActivityTimelineCard({ timeline }: { timeline: TimelineGroup[] }) {
  const [open, setOpen] = useState(true)
  const totalEvents = timeline.reduce((sum, g) => sum + g.events.length, 0)

  return (
    <Card className="p-4 sm:p-6">
      {timeline.length === 0 ? (
        <CardContent>
          <CardTitle className="text-base flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-primary" />
            Activity Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground py-3 text-center">
            No XP activity yet. Your earning history will show up here.
          </p>
        </CardContent>
      ) : (
        <>
          <CardHeader className="pb-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="w-full flex items-center gap-2 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CardTitle className="text-base flex items-center gap-2 flex-1">
                <History className="h-4 w-4 text-primary" />
                Activity Timeline
              </CardTitle>
              <span className="text-xs text-muted-foreground shrink-0">
                {totalEvents} {totalEvents === 1 ? "activity" : "activities"} · {timeline.length} {timeline.length === 1 ? "day" : "days"}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
            </button>
          </CardHeader>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardContent>
                  <div className="max-h-[320px] sm:max-h-[360px] overflow-y-auto pr-1 -mr-1 space-y-4">
                    {timeline.map((group, gi) => (
                      <div key={group.date}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          {group.label}
                        </p>
                        <div className="space-y-1.5">
                          {group.events.map((event, ei) => {
                            const Icon = SOURCE_ICONS[event.type] ?? Plus
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: gi * 0.06 + ei * 0.04 }}
                                className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                              >
                                <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${SOURCE_COLORS[event.type] ?? "bg-secondary"}`}>
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm flex-1 min-w-0 truncate">{event.label}</span>
                                <span className="text-xs font-semibold text-green-400 shrink-0">+{event.xp} XP</span>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Card>
  )
}
