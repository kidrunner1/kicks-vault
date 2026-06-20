import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetail from "@/app/component/product/ProductDetail"
import { getCurrentUser } from "@/lib/auth"
import { normalizeStockRows } from "@/lib/commerce"
import {
  buildDiscoveryMeta,
  getRecommendedProducts,
} from "@/lib/product-discovery"

interface Props {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: Props) {

  const { slug } = await params

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

  const user = await getCurrentUser()

  let isFavorited = false

  if (user) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_shoeId: {
          userId: user.id,
          shoeId: product.id
        }
      }
    })

    isFavorited = !!favorite
  }

  const safeSizes = product.sizes
    .map(size => ({
      id: size.id,
      size: size.size,
      stock: size.stock
    }))
    .sort((a, b) =>
      a.size.localeCompare(b.size, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price == null ? null : product.price.toString(),
    featured: product.featured,
    images: product.images,
    brand: product.brand,
    specs: product.specs,
    sizes: safeSizes
  }

  const recommendationCandidatesRaw = await prisma.shoe.findMany({
    where: {
      id: { not: product.id },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      featured: true,
      brand: {
        select: { name: true },
      },
      images: {
        select: { url: true },
        orderBy: { order: "asc" },
        take: 1,
      },
      sizes: {
        select: {
          size: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const currentDiscoveryProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price == null ? null : product.price.toString(),
    featured: product.featured,
    brand: { name: product.brand.name },
    sizes: safeSizes.map((size) => ({
      size: size.size,
      stock: size.stock,
    })),
  }

  const recommendationCandidates = recommendationCandidatesRaw.map((shoe) => ({
    ...shoe,
    price: shoe.price == null ? null : shoe.price.toString(),
    sizes: normalizeStockRows(shoe.sizes),
  }))

  const recommendations = getRecommendedProducts(
    currentDiscoveryProduct,
    recommendationCandidates,
    4
  ).map((shoe, index) => ({
    ...shoe,
    meta: buildDiscoveryMeta(shoe, index),
  }))

  return (
    <ProductDetail
      product={formattedProduct}
      isFavorited={isFavorited}
      recommendations={recommendations}
    />
  )
}
