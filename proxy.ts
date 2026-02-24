import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/jwt"

export async function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  const isHome = pathname === "/"

  const isProtectedRoute =
    isHome ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/favorites")

  const isLoginPage = pathname.startsWith("/login")
  const isRegisterPage = pathname.startsWith("/register")

  // 🔐 ถ้า protected route และไม่มี access token เลย
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (accessToken) {
    try {
      await verifyToken(accessToken)

      if (isLoginPage || isRegisterPage) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      return NextResponse.next()

    } catch {

      // 🔥 Access expired → Try refresh
      if (!refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      try {

        const refreshResponse = await fetch(
          `${request.nextUrl.origin}/api/auth/refresh`,
          {
            method: "POST",
            headers: {
              cookie: request.headers.get("cookie") ?? "",
            },
          }
        )

        if (!refreshResponse.ok) {
          return NextResponse.redirect(new URL("/login", request.url))
        }

        // ✅ สำคัญมาก: เอา cookies ใหม่จาก refreshResponse มาใส่ response
        const response = NextResponse.next()

        const setCookie = refreshResponse.headers.get("set-cookie")
        if (setCookie) {
          response.headers.set("set-cookie", setCookie)
        }

        return response

      } catch {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/favorites/:path*",
    "/login",
    "/register",
  ],
}