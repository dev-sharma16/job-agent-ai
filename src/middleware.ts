import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/reset-password",
    "/contact-us",
    "/privacy-policy",
    "/terms-condition",
    "/refund-policy",
    "/api/auth",
    "/api/contact",
    "/api/skills",
  ]

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (pathname.startsWith("/api/extension/")) {
    return NextResponse.next()
  }

  if (isPublic) {
    if (req.auth && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|videos/|fonts/).*)"],
}