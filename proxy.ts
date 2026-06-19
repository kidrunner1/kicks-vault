import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value
  const { pathname } = request.nextUrl

  const protectedRoutes = ["/account", "/cart", "/admin"]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register"

  const hasSessionCookie = Boolean(accessToken || refreshToken)

  if (!hasSessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}
