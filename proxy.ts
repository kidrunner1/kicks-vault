import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} from "./lib/jwt"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/favorites")

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