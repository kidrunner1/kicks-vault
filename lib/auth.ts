import { cookies } from "next/headers"
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} from "./jwt"
import { prisma } from "@/lib/prisma"
import { AuthError } from "@/lib/errors/auth-error"

export async function getCurrentUser() {
  const cookieStore = await cookies()

  const accessToken = cookieStore.get("accessToken")?.value
  const refreshToken = cookieStore.get("refreshToken")?.value

  // 🔹 ไม่มี token เลย
  if (!accessToken && !refreshToken) return null

  let userId: string | null = null

  // 🔹 ลอง verify access ก่อน
  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken)
      userId = payload.userId
    } catch {
      // access expired → fallback ไป refresh
    }
  }

  // 🔥 ถ้า access ใช้ไม่ได้ → ลอง refresh
  if (!userId && refreshToken) {
    try {
      const payload = await verifyRefreshToken(refreshToken)
      userId = payload.userId

      // ออก access token ใหม่
      const newAccessToken = await signAccessToken({
        userId: payload.userId,
        role: payload.role,
      })

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      })

    } catch {
      return null
    }
  }

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })

  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user)
    throw new AuthError("Unauthorized", 401)

  if (user.role !== "ADMIN")
    throw new AuthError("Forbidden", 403)

  return user
}