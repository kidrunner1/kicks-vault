import { cookies } from "next/headers"
import { verifyToken } from "./jwt"
import { prisma } from "@/lib/prisma"
import { AuthError } from "@/lib/errors/auth-error"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) return null

  try {
    const payload = await verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    return user

  } catch (error) {
    console.error("TOKEN_VERIFY_FAILED:", error)
    return null
  }
}

export async function requireAdmin() {

  const user = await getCurrentUser()

  if (!user)
    throw new AuthError("Unauthorized", 401)

  if (user.role !== "ADMIN")
    throw new AuthError("Forbidden", 403)

  return user
}