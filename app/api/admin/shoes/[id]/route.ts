import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { normalizeStockRows } from "@/lib/commerce"
import { z } from "zod"

const shoeSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const shoeSizeSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
})

const updateShoeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  brandId: z.string().uuid(),
  price: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return Number.NaN
      }

      return value
    },
    z.coerce.number().min(0)
  ),
  images: z.array(z.string().min(1)).optional().default([]),
  specs: z.array(shoeSpecSchema).optional().default([]),
  sizes: z.array(shoeSizeSchema).optional().default([]),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    await requireAdmin()

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบรหัสสินค้า" },
        { status: 400 }
      )
    }

    const parsed = updateShoeSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ข้อมูลสินค้าไม่ถูกต้อง" },
        { status: 400 }
      )
    }

    const {
      name,
      slug,
      description,
      brandId,
      images,
      specs,
      price,
      sizes,
    } = parsed.data

    const normalizedSizes = normalizeStockRows(sizes)


    // ✅ Validate brand
    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId }
      })

      if (!brand) {
        return NextResponse.json(
          { error: "แบรนด์ไม่ถูกต้อง" },
          { status: 400 }
        )
      }
    }

    const decimalPrice = new Prisma.Decimal(price)

    const updated = await prisma.shoe.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        brandId,
        price: decimalPrice,

        images: {
          deleteMany: {},
          create: images.map((url, index) => ({
            url,
            order: index,
          })),
        },

        specs: {
          deleteMany: {},
          create: specs,
        },

        sizes: {
          deleteMany: {},
          create: normalizedSizes.map((size) => ({
            size: size.size,
            stock: size.stock,
          })),
        }
      }
    })

    return NextResponse.json(updated)

  } catch (error) {

    console.error("UPDATE SHOE ERROR:", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug นี้ถูกใช้งานแล้ว" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "อัปเดตสินค้าไม่สำเร็จ" },
      { status: 500 }
    )
  }
}





// DELETE SHOE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    await requireAdmin()

    const { id } = await params   // ⭐ FIX สำคัญ

    if (!id) {

      return NextResponse.json(
        { error: "ไม่พบรหัสสินค้า" },
        { status: 400 }
      )

    }

    const shoe = await prisma.shoe.findUnique({
      where: { id }
    })

    if (!shoe) {

      return NextResponse.json(
        { error: "ไม่พบสินค้านี้" },
        { status: 404 }
      )

    }

    await prisma.shoe.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })

  } catch (error) {

    console.error("DELETE SHOE ERROR:", error)

    return NextResponse.json(
      { error: "ลบสินค้าไม่สำเร็จ" },
      { status: 500 }
    )

  }

}
