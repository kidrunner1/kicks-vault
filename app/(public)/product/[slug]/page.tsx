import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetail from "../../../component/product/ProductDetail"

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>
}) {

  const { slug } = await props.params   // 👈 สำคัญมาก

  if (!slug) {
    return notFound()
  }

  const product = await prisma.shoe.findUnique({
    where: { slug },
    include: {
      brand: true,
      images: { orderBy: { order: "asc" } },
      specs: true,
    }
  })

  if (!product) return notFound()

  return <ProductDetail product={product} />
}
