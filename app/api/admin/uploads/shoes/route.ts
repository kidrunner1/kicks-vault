import { randomBytes } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  buildShoeImageFileName,
  validateShoeImageBatch,
} from "@/lib/admin-upload"
import { AuthError } from "@/lib/errors/auth-error"

export const runtime = "nodejs"

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "shoes",
)

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File)

    const validation = validateShoeImageBatch(files)

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 },
      )
    }

    await mkdir(uploadDirectory, { recursive: true })

    const uploadedPaths: string[] = []

    for (const file of files) {
      const fileName = buildShoeImageFileName({
        mimeType: file.type,
        now: new Date(),
        randomId: randomBytes(8).toString("hex"),
      })
      const filePath = path.join(uploadDirectory, fileName)
      const buffer = Buffer.from(await file.arrayBuffer())

      await writeFile(filePath, buffer)
      uploadedPaths.push(`/uploads/shoes/${fileName}`)
    }

    return NextResponse.json({ paths: uploadedPaths }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error:
            error.statusCode === 403
              ? "ไม่มีสิทธิ์อัปโหลดรูป"
              : "กรุณาเข้าสู่ระบบ",
        },
        { status: error.statusCode },
      )
    }

    console.error("UPLOAD SHOE IMAGE ERROR:", error)

    return NextResponse.json(
      { error: "ไม่สามารถอัปโหลดรูปสินค้าได้" },
      { status: 500 },
    )
  }
}
