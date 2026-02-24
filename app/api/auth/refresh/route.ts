import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/jwt"
import bcrypt from "bcrypt"

export async function POST() {

    const cookieStore = cookies()
    const refreshToken = (await cookieStore).get("refreshToken")?.value

    if (!refreshToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {

        const payload = await verifyToken(refreshToken)

        // ✅ เช็คว่าเป็น refresh token จริง
        if (payload.type !== "refresh") {
            throw new Error("Invalid token type")
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        })

        if (!user || !user.refreshToken) {
            throw new Error("Invalid refresh token")
        }

        // ✅ Compare แบบ secure (กรณี hash แล้ว)
        const isValid = await bcrypt.compare(refreshToken, user.refreshToken)

        if (!isValid) {
            throw new Error("Invalid refresh token")
        }

        // 🔁 ROTATION
        const newAccessToken = await signAccessToken({
            userId: user.id,
            role: user.role,
        })

        const newRefreshToken = await signRefreshToken({
            userId: user.id,
            role: user.role,
        })

        const hashedRefresh = await bcrypt.hash(newRefreshToken, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefresh },
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

    } catch (error) {

        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }
}