import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoggedIn = !!req.auth

  if (isAdminRoute && !isLoggedIn) {
    const url = new URL('/api/auth/signin', req.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
