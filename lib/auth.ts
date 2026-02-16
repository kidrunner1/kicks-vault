import { cookies } from "next/headers"
import { verifyToken } from "./jwt"

export async function getCurrentUser() {

    const cookieStore = await cookies()

    const token = cookieStore.get("accessToken")?.value

    if (!token)
        return null

    try {

        const payload = await verifyToken(token)

        return {
            id: payload.userId,   // ⭐ FIX ตรงนี้
            role: payload.role
        }

    } catch {

        return null

    }

}

export async function requireAdmin() {

    const user = await getCurrentUser()

    if (!user)
        throw new Error("Unauthorized")

    if (user.role !== "ADMIN")
        throw new Error("Forbidden")

    return user

}
