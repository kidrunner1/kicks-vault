import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    await requireAdmin()

    const body = await req.json()

    const {
      name,
      slug,
      description,
      featured,
      brandId,
      images,
      specs
    } = body

    // validation
    if (!name || !slug || !brandId) {
      return NextResponse.json(
        { error: "name, slug, brandId are required" },
        { status: 400 }
      )
    }

    // check brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    })

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 400 }
      )
    }

    const shoe = await prisma.shoe.create({

      data: {

        name,
        slug,
        description: description || "",
        featured: featured ?? false,
        brandId,
        price: parseFloat(body.price) || 0,

        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            order: index
          })) || []
        },

        specs: {
          create: specs?.map((spec: any) => ({
            label: spec.label,
            value: spec.value
          })) || []
        }

      },

      include: {
        brand: true,
        images: {
          orderBy: { order: "asc" }
        },
        specs: true
      }

    })

    return NextResponse.json(shoe, { status: 201 })

  } catch (error: any) {

    console.error("CREATE SHOE ERROR:", error)

    // handle prisma unique error
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create shoe" },
      { status: 500 }
    )

  }

}
