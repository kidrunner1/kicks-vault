import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      )
    }

    const shoe = await prisma.shoe.findUnique({

      where: { id },

      include: {
        brand: true,
        images: {
          orderBy: { order: "asc" }
        },
        specs: true,
        sizes: true
      }

    })

    if (!shoe) {
      return NextResponse.json(
        { error: "Shoe not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...shoe,
      price: shoe.price ? shoe.price.toString() : null,
      sizes: [...shoe.sizes].sort((a, b) =>
        a.size.localeCompare(b.size, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ),
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}
