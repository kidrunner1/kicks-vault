import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const { pathname } = request.nextUrl

  const protectedRoutes = [
    "/profile",
    "/favorites",
    "/checkout",
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")

  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}