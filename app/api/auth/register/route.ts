import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) {
            return NextResponse.json({ error: "อีเมลและรหัสผ่านต้องระบุ" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "มีผู้ใช้งานนี้แล้ว" }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })

        return NextResponse.json({ message: "สมัครสำเร็จ", user: { id: user.id, email: user.email } }, { status: 201 });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
    }


}