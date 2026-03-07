import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { signAccessToken, signRefreshToken } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // 1️⃣ Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 400 }
      )
    }

    // 2️⃣ Find user (select only required fields)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
      },
    })

    // 3️⃣ Prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    // 4️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    // 5️⃣ Sign tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    })

    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    })

    // 6️⃣ Hash refresh token before saving (IMPORTANT)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    })

    const response = NextResponse.json(
      {
        message: "เข้าสู่ระบบสำเร็จ",
        user: {
          id: user.id,
          role: user.role,
          email: email
        },
      },
      { status: 200 }
    )

    // 7️⃣ Set secure cookies

    // Access Token (15 นาที)
    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    })

    // Refresh Token (7 วัน)
    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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