import ShoeForm, { type BrandOption } from "../ShoeForm"
import { prisma } from "@/lib/prisma"

export default async function AddShoePage() {
  const brands: BrandOption[] = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  })

  return <ShoeForm mode="create" brands={brands} />
}
