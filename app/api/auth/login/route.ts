import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { signAccessToken, signRefreshToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

const invalidCredentialsMessage = "Email หรือรหัสผ่านไม่ถูกต้อง"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: invalidCredentialsMessage },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: invalidCredentialsMessage },
        { status: 401 },
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: invalidCredentialsMessage },
        { status: 401 },
      )
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
    })

    const refreshToken = await signRefreshToken({
      userId: user.id,
      role: user.role,
    })
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
          email,
        },
      },
      { status: 200 },
    )

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    })

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
      { status: 500 },
    )
  }
}
