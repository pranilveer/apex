"use client"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  value,
  sub,
  iconBg,
  iconColor,
  gradient,
  delay = 0,
}: {
  icon: LucideIcon
  value: React.ReactNode
  sub: string
  iconBg: string
  iconColor: string
  gradient?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="min-w-0 h-full"
    >
      <Card className={cn("glass-hover h-full p-4 sm:p-5", gradient && "overflow-hidden relative")}>
        {gradient && <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent", gradient)} />}
        <CardContent className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 h-full">
          <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
          </div>
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold truncate">{value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
