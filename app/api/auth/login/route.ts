import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { signAccessToken, signRefreshToken } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "อีเมลและรหัสผ่านต้องระบุ" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    // 🔐 Sign tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    })

    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    })

    // 💾 Save refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    })

    const response = NextResponse.json(
      { message: "เข้าสู่ระบบสำเร็จ" },
      { status: 200 }
    )

    // 🍪 Access token (15 นาที)
    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    })

    // 🍪 Refresh token (7 วัน)
    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    )
  }
}
