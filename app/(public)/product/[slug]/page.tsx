import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetail from "@/app/component/product/ProductDetail"

interface Props {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: Props) {

  const resolvedParams = await params
  const slug = resolvedParams.slug

  if (!slug) {
    return notFound()
  }

  const product = await prisma.shoe.findUnique({
    where: { slug },
    include: {
      brand: true,
      images: { orderBy: { order: "asc" } },
      specs: true,
      sizes: true
    }
  })

  if (!product) return notFound()

  const safeSizes = product.sizes.map(size => ({
    id: size.id,
    size: size.size,
    stock: size.stock
  }))

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price ? product.price.toString() : null,
    images: product.images,
    brand: product.brand,
    specs: product.specs,
    sizes: safeSizes
  }

  return <ProductDetail product={formattedProduct} />
}
