import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    await requireAdmin()

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const {
      name,
      slug,
      description,
      brandId,
      images,
      specs,
      price
    } = body


    // ✅ Validate brand
    if (brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId }
      })

      if (!brand) {
        return NextResponse.json(
          { error: "Invalid brandId" },
          { status: 400 }
        )
      }
    }

    // ✅ Validate + Convert price
    let decimalPrice: Prisma.Decimal | null | undefined = undefined

    if (price !== undefined) {
      const numericPrice = Number(price)

      if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          { error: "Invalid price value" },
          { status: 400 }
        )
      }

      decimalPrice = new Prisma.Decimal(numericPrice)
    }

    const updated = await prisma.shoe.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        brandId,

        ...(decimalPrice !== undefined && {
          price: decimalPrice
        }),

        images: {
          deleteMany: {},
          create:
            images?.map((url: string, index: number) => ({
              url,
              order: index
            })) || []
        },

        specs: {
          deleteMany: {},
          create: specs || []
        }
      }
    })

    return NextResponse.json(updated)

  } catch (error: any) {

    console.error("UPDATE SHOE ERROR:", error)

    return NextResponse.json(
      { error: "Update failed" },
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
        { error: "Missing id" },
        { status: 400 }
      )

    }

    const shoe = await prisma.shoe.findUnique({
      where: { id }
    })

    if (!shoe) {

      return NextResponse.json(
        { error: "Shoe not found" },
        { status: 404 }
      )

    }

    await prisma.shoe.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {

    console.error("DELETE SHOE ERROR:", error)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )

  }

}
