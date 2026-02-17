// import { proxy } from 'valtio';
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"
// import { verifyToken } from "./lib/jwt"

// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl
//   const token = request.cookies.get("accessToken")?.value

//   const isProtectedRoute = pathname.startsWith("/product")
//   const isLoginPage = pathname.startsWith("/login")
//   const isRegisterPage = pathname.startsWith("/register")

//   // 🔓 ถ้าไม่ใช่ route ที่เกี่ยวกับ auth ปล่อยผ่าน
//   if (!isProtectedRoute && !isLoginPage && !isRegisterPage) {
//     return NextResponse.next()
//   }

//   // 🔐 ถ้าเข้า /dashboard แต่ไม่มี token → redirect ไป login
//   if (isProtectedRoute && !token) {
//     return NextResponse.redirect(new URL("/login", request.url))
//   }

//   // 🔎 ถ้ามี token ลอง verify
//   if (token) {
//     try {
//       await verifyToken(token)

//       // 🔁 ถ้า login แล้วพยายามเข้า /login → redirect ไป dashboard
//       if (isLoginPage) {
//         return NextResponse.redirect(
//           new URL("/", request.url)
//         )
//       }

//       return NextResponse.next()
//     } catch (error) {
//       // token ไม่ valid → ถ้าเข้า dashboard ให้ redirect
//       if (isProtectedRoute) {
//         return NextResponse.redirect(
//           new URL("/login", request.url)
//         )
//       }
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ["/","/product/:path*", "/login", "/register"],
// }
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/jwt"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("accessToken")?.value

  const isProtectedRoute =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/favorites")

  const isLoginPage = pathname.startsWith("/login")
  const isRegisterPage = pathname.startsWith("/register")

  if (!isProtectedRoute && !isLoginPage && !isRegisterPage) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    try {
      await verifyToken(token)

      if (isLoginPage || isRegisterPage) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      return NextResponse.next()
    } catch {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/favorites/:path*",
    "/login",
    "/register",
  ],
}

