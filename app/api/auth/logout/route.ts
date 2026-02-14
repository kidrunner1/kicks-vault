import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  // 🔎 ถ้ามี refreshToken ลองล้างใน DB
  if (refreshToken) {
    try {
      const payload = await verifyToken(refreshToken)

      await prisma.user.update({
        where: { id: payload.userId },
        data: { refreshToken: null },
      })
    } catch {
      // ถ้า verify ไม่ผ่านก็ปล่อยไป
    }
  }

  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  )

  // 🍪 ลบ accessToken
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  // 🍪 ลบ refreshToken
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}
