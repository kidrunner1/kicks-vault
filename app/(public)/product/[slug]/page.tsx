import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetail from "@/app/component/product/ProductDetail"

interface Props {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: Props) {

  const product = await prisma.shoe.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      images: { orderBy: { order: "asc" } },
      specs: true
    }
  })

  if (!product) return notFound()

  // 🔥 FIX: Convert Decimal → string
  const formattedProduct = {
    ...product,
    price: product.price ? product.price.toString() : null
  }

  return <ProductDetail product={formattedProduct} />
}
