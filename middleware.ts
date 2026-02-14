import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("accessToken")?.value

  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isLoginPage = pathname.startsWith("/login")
  const isRegisterPage = pathname.startsWith("/register")

  // 🔓 ถ้าไม่ใช่ route ที่เกี่ยวกับ auth ปล่อยผ่าน
  if (!isProtectedRoute && !isLoginPage && !isRegisterPage) {
    return NextResponse.next()
  }

  // 🔐 ถ้าเข้า /dashboard แต่ไม่มี token → redirect ไป login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 🔎 ถ้ามี token ลอง verify
  if (token) {
    try {
      await verifyToken(token)

      // 🔁 ถ้า login แล้วพยายามเข้า /login → redirect ไป dashboard
      if (isLoginPage) {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        )
      }

      return NextResponse.next()
    } catch (error) {
      // token ไม่ valid → ถ้าเข้า dashboard ให้ redirect
      if (isProtectedRoute) {
        return NextResponse.redirect(
          new URL("/login", request.url)
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
