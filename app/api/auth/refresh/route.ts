import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
    verifyRefreshToken,
    signAccessToken,
    signRefreshToken,
} from "@/lib/jwt"
import bcrypt from "bcrypt"

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get("refreshToken")?.value

        if (!refreshToken) {
            return unauthorizedResponse()
        }

        const payload = await verifyRefreshToken(refreshToken)

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                role: true,
                refreshToken: true,
            },
        })

        if (!user || !user.refreshToken) {
            return unauthorizedResponse(true)
        }

        const isValid = await bcrypt.compare(
            refreshToken,
            user.refreshToken
        )

        // 🔐 Reuse Detection
        if (!isValid) {
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            })

            return unauthorizedResponse(true)
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
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 15,
        })

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        })

        return response

    } catch {
        return unauthorizedResponse(true)
    }
}

function unauthorizedResponse(clearCookies = false) {
    const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    )

    if (clearCookies) {
        response.cookies.set("accessToken", "", { maxAge: 0 })
        response.cookies.set("refreshToken", "", { maxAge: 0 })
    }

    return response
}