import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {

  try {

    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get("page") ?? "1")
    const limit = Number(searchParams.get("limit") ?? "10")

    const skip = (page - 1) * limit

    const [shoes, total] = await Promise.all([

      prisma.shoe.findMany({
        skip,
        take: limit,
        include: {
          brand: true,
          images: {
            orderBy: { order: "asc" }
          },
          specs: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }),

      prisma.shoe.count()

    ])

    // 🔥 FIX: Convert Decimal → string
    const formattedShoes = shoes.map((shoe) => ({
      ...shoe,
      price: shoe.price ? shoe.price.toString() : null
    }))

    return NextResponse.json({
      data: formattedShoes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch shoes" },
      { status: 500 }
    )

  }

}
