import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("authjs.session-token")?.value
    ?? request.cookies.get("__Secure-authjs.session-token")?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/goals/:path*",
    "/leetcode/:path*",
    "/github/:path*",
    "/projects/:path*",
    "/interview/:path*",
    "/journal/:path*",
    "/habits/:path*",
    "/jobs/:path*",
    "/resumes/:path*",
    "/resources/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/gamification/:path*",
    "/ai-coach/:path*",
    "/settings/:path*",
  ],
}
