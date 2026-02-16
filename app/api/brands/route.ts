import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  try {

    const brands = await prisma.brand.findMany({

      orderBy: {
        name: "asc"
      },

      select: {
        id: true,
        name: true
      }

    })

    return NextResponse.json(brands)

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    )

  }

}
