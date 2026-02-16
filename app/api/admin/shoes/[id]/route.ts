import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(
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

    const body = await req.json()

    const {
      name,
      slug,
      description,
      brandId,
      images,
      specs
    } = body


    // ⭐ FIX: validate brandId
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


    const updated = await prisma.shoe.update({

      where: { id },

      data: {

        name,
        slug,
        description,
        brandId,

        images: {
          deleteMany: {},
          create: images?.map((url: string, index: number) => ({
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
