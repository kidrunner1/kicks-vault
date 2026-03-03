import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyRefreshToken } from "@/lib/jwt"

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken)

      // 🔐 เช็คว่า refresh token ตรงกับใน DB
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { refreshToken: true },
      })

      if (user?.refreshToken === refreshToken) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        })
      }

    } catch {
      // ignore invalid token
    }
  }

  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 }
  )

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}