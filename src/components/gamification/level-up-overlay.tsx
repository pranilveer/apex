"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

export function LevelUpOverlay({ level, show }: { level: number; show: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    const showTimer = setTimeout(() => setVisible(true), 30)
    const hideTimer = setTimeout(() => setVisible(false), 2600)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
        >
          <div className="bg-background/90 backdrop-blur border border-primary/30 rounded-2xl px-8 py-6 text-center shadow-2xl">
            <Zap className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">Level Up!</p>
            <p className="text-muted-foreground">You reached Level {level}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
