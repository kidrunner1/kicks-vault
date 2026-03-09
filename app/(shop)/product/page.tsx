import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
import { motion } from "framer-motion"

export const dynamic = "force-dynamic"
export default async function ProductsPage() {

  const shoes = await prisma.shoe.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      brand: {
        select: { name: true }
      },
      images: {
        select: { url: true },
        orderBy: { order: "asc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const formattedShoes = shoes.map(shoe => ({
    ...shoe,
    price: shoe.price ? shoe.price.toString() : null
  }))

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">


      <section className="px-8 md:px-16 pt-32 pb-16 max-w-7xl mx-auto">

        <div className="absolute top-6 left-6 z-20">

          <Link
            href="/"
            className="
      flex
      items-center
      gap-3
      group
      select-none
    "
          >

            {/* Logo */}
            <div
              className="
        w-8
        h-8
        rounded-full
        border
        border-black/20
        flex
        items-center
        justify-center
        text-xs
        font-semibold
        tracking-widest
        group-hover:border-black
        transition
      "
            >
              KV
            </div>

            {/* Brand Text */}
            <div className="flex flex-col leading-tight">

              <span className="
        text-sm
        font-medium
        tracking-wide
      ">
                KICKS VAULT
              </span>

              <span className="
        text-xs
        text-black/50
        group-hover:text-black/80
        transition
      ">
                Back to Home
              </span>

            </div>

          </Link>

        </div>

        <h1 className="text-6xl md:text-7xl font-semibold tracking-tight">
          Get Inspired
        </h1>

        <p className="mt-6 text-lg text-black/60 max-w-2xl leading-relaxed">
          Discover the latest additions to our sneaker collection.
          From everyday essentials to statement pieces.
        </p>

      </section>

      <div className="px-8 md:px-16 max-w-7xl mx-auto mb-14">

        <div className="flex flex-wrap gap-4 items-center justify-between">

          <div className="flex flex-wrap gap-4">

            {["All Categories", "All Brands", "All Prices"].map((item) => (
              <button
                key={item}
                className="
            px-6 py-3
            rounded-full
            bg-white
            border
            border-black/10
            text-sm
            hover:border-black
            transition
          "
              >
                {item}
              </button>
            ))}

          </div>

          <button className="
      px-6 py-3
      rounded-full
      bg-white
      border
      border-black/10
      text-sm
    ">
            Sort: New In
          </button>

        </div>

      </div>

      <section className="px-8 md:px-16 pb-32 max-w-7xl mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">

          {formattedShoes.map((shoe) => {
            const imageUrl = normalizeImagePath(shoe.images[0]?.url)

            return (
              <Link
                key={shoe.id}
                href={`/product/${shoe.slug}`}
                className="group"
              >
                <div>

                  {/* IMAGE */}
                  <div className="
              relative
              aspect-[4/5]
              bg-white
              rounded-xl
              overflow-hidden
            ">

                    <Image
                      src={imageUrl}
                      alt={shoe.name}
                      fill
                      className="
                  object-contain
                  p-8
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
                    />

                  </div>

                  {/* INFO */}
                  <div className="mt-6 space-y-2">

                    <h2 className="text-base font-medium">
                      {shoe.name}
                    </h2>

                    <p className="text-sm text-black/60">
                      {shoe.brand.name}
                    </p>

                    {shoe.price && (
                      <div className="text-sm font-medium">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(shoe.price))}
                      </div>
                    )}

                  </div>

                </div>
              </Link>
            )
          })}

        </div>

      </section>

    </main>
  )
}