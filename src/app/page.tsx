import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LandingNav } from "@/components/landing/landing-nav"
import { LandingHero } from "@/components/landing/landing-hero"
import { ProblemSolution } from "@/components/landing/problem-solution"
import { LandingFeatures } from "@/components/landing/landing-features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { AiCoachHighlight } from "@/components/landing/ai-coach-highlight"
import { GamificationTeaser } from "@/components/landing/gamification-teaser"
import { FinalCta } from "@/components/landing/final-cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export const metadata: Metadata = {
  title: "DailyTracker · Apex — The all-in-one job-prep system for developers",
  description:
    "LeetCode tracking, spaced repetition, habits, GitHub sync, job applications, interview prep, analytics and an AI career coach — all in one dashboard built for coding job seekers.",
  openGraph: {
    title: "DailyTracker · Apex — Turn job-seeking chaos into daily progress",
    description:
      "Track LeetCode, habits, GitHub, interviews and jobs in one place, with an AI career coach that knows your daily grind.",
    type: "website",
  },
}

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-blue-500/30">
      <LandingNav />
      <main>
        <LandingHero />
        <ProblemSolution />
        <LandingFeatures />
        <HowItWorks />
        <AiCoachHighlight />
        <GamificationTeaser />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
