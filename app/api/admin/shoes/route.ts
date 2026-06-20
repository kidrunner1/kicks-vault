import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { normalizeStockRows } from "@/lib/commerce"

const shoeSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const shoeSizeSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
})

const createShoeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
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

export async function POST(req: Request) {

  try {

    await requireAdmin()

    const parsed = createShoeSchema.safeParse(await req.json())

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
      featured,
      brandId,
      price,
      images,
      specs,
      sizes,
    } = parsed.data

    const normalizedSizes = normalizeStockRows(sizes)

    // check brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    })

    if (!brand) {
      return NextResponse.json(
        { error: "ไม่พบแบรนด์นี้" },
        { status: 400 }
      )
    }

    const shoe = await prisma.shoe.create({

      data: {

        name,
        slug,
        description,
        featured,
        brandId,
        price: new Prisma.Decimal(price),

        images: {
          create: images.map((url, index) => ({
            url,
            order: index
          }))
        },

        specs: {
          create: specs.map((spec) => ({
            label: spec.label,
            value: spec.value
          }))
        },

        sizes: {
          create: normalizedSizes.map((size) => ({
            size: size.size,
            stock: size.stock,
          })),
        }

      },

      include: {
        brand: true,
        images: {
          orderBy: { order: "asc" }
        },
        specs: true,
        sizes: true
      }

    })

    return NextResponse.json(shoe, { status: 201 })

  } catch (error) {

    console.error("CREATE SHOE ERROR:", error)

    // handle prisma unique error
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
      { error: "ไม่สามารถสร้างสินค้าได้" },
      { status: 500 }
    )

  }

}
