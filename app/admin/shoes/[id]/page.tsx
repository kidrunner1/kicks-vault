import ShoeForm, { type BrandOption, type ShoeFormValues } from "../ShoeForm"
import { prisma } from "@/lib/prisma"
import { normalizeStockRows } from "@/lib/commerce"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditShoePage({ params }: Props) {
  const { id } = await params

  const [brands, shoe] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.shoe.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true,
      },
    }),
  ])

  if (!shoe) notFound()

  const brandOptions: BrandOption[] = brands
  const initialValues: ShoeFormValues = {
    name: shoe.name,
    description: shoe.description,
    image: shoe.images[0]?.url ?? "",
    brandId: shoe.brandId,
    price: shoe.price ? shoe.price.toString() : "",
    sizes: normalizeStockRows(shoe.sizes),
  }

  return (
    <ShoeForm
      mode="edit"
      brands={brandOptions}
      initialValues={initialValues}
      shoeId={shoe.id}
    />
  )
}
