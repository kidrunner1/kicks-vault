import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"

export const revalidate = 60
export default async function ProductsPage() {

  const shoes = await prisma.shoe.findMany({
    include: {
      brand: true,
      images: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const formattedShoes = shoes.map(shoe => ({
    ...shoe,
    price: shoe.price ? shoe.price.toString() : null
  }))

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* NOISE */}
      <div
        className="
          pointer-events-none
          absolute inset-0
          z-0
          opacity-[0.20]
          bg-[url('/images/noise.jpg')]
          bg-repeat
        "
      />

      <section className="relative z-10 px-8 md:px-16 pt-40 pb-24 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-24 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            Archive
          </p>

          <h1 className="text-6xl md:text-7xl mt-6 tracking-tight leading-[1.1]">
            The Collection
          </h1>

          <p className="text-white/50 mt-8 text-lg leading-relaxed">
            A curated selection of modern sneakers —
            blending innovation, heritage, and culture.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20">

          {formattedShoes.map((shoe) => {

            const imageUrl = normalizeImagePath(
              shoe.images[0]?.url
            )

            return (
              <Link
                key={shoe.id}
                href={`/product/${shoe.slug}`}
                className="group"
              >
                <div className="relative">

                  {/* IMAGE */}
                  <div className="relative aspect-4/5 overflow-hidden">

                    <Image
                      src={imageUrl}
                      alt={shoe.name}
                      fill
                      sizes="(max-width: 768px) 100vw,
                             (max-width: 1200px) 50vw,
                             33vw"
                      className="
                        object-cover
                        transition-transform
                        duration-[1200ms]
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:scale-105
                      "
                    />

                    <div className="
                      absolute inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-transparent
                      to-transparent
                    " />
                  </div>

                  {/* INFO */}
                  <div className="mt-8 space-y-3">

                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                      {shoe.brand.name}
                    </p>

                    <h2 className="
                      text-3xl
                      tracking-tight
                      transition-colors
                      duration-300
                      group-hover:text-white/80
                    ">
                      {shoe.name}
                    </h2>

                    {shoe.price != null && (
                      <div className="pt-2">
                        <div className="text-xs tracking-[0.3em] text-white/30 uppercase">
                          Price
                        </div>
                        <div className="text-xl font-medium mt-1">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(Number(shoe.price))}
                        </div>
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