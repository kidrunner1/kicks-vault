import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/jwt"

export async function POST() {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (!refreshToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const payload = await verifyToken(refreshToken)

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        })

        if (!user || user.refreshToken !== refreshToken) {
            throw new Error("Invalid refresh token")
        }

        // 🔁 Rotation: ออก token ใหม่ทั้งคู่
        const newAccessToken = await signAccessToken({
            userId: user.id,
            role: user.role,
        })

        const newRefreshToken = await signRefreshToken({
            userId: user.id,
            role: user.role,
        })

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        })

        const response = NextResponse.json({ message: "Refreshed" })

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 15,
        })

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })


        return response
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
}
