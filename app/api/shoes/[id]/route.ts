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
        specs: true
      }

    })

    if (!shoe) {
      return NextResponse.json(
        { error: "Shoe not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(shoe)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )

  }

}
