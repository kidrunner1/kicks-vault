import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
import {
  availabilityLabel,
  formatCurrency,
  normalizeStockRows,
  totalStock,
} from "@/lib/commerce"

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
      },
      sizes: {
        select: {
          size: true,
          stock: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const formattedShoes = shoes.map(shoe => ({
    ...shoe,
    price: shoe.price == null ? null : shoe.price.toString(),
    sizes: normalizeStockRows(shoe.sizes)
  }))

  const inStockShoes = formattedShoes.filter((shoe) => totalStock(shoe.sizes) > 0)
  const heroShoe = inStockShoes[0] ?? formattedShoes[0]
  const secondaryShoe = inStockShoes[1] ?? formattedShoes[1] ?? heroShoe
  const latestDrops = formattedShoes.slice(0, 4)
  const totalAvailablePairs = formattedShoes.reduce(
    (sum, shoe) => sum + totalStock(shoe.sizes),
    0
  )

  const brandSummaries = Array.from(
    formattedShoes.reduce((brands, shoe) => {
      const current = brands.get(shoe.brand.name) ?? {
        name: shoe.brand.name,
        products: 0,
        stock: 0,
      }

      brands.set(shoe.brand.name, {
        ...current,
        products: current.products + 1,
        stock: current.stock + totalStock(shoe.sizes),
      })

      return brands
    }, new Map<string, { name: string; products: number; stock: number }>())
  ).map(([, brand]) => brand).slice(0, 4)

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-black">
      <section className="px-6 pt-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm text-black/60 transition hover:text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 text-xs font-semibold tracking-widest">
              KV
            </span>
            <span className="leading-tight">
              <span className="block font-medium tracking-wide text-black">
                KICKS VAULT
              </span>
              <span className="block text-xs">
                Back to Home
              </span>
            </span>
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16 pt-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {heroShoe ? (
            <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
              <Link
                href={`/product/${heroShoe.slug}`}
                className="group relative min-h-[520px] overflow-hidden rounded-lg bg-black text-white"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(255,255,255,0.24),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />

                <div className="absolute inset-y-8 right-0 w-full md:w-[58%]">
                  <Image
                    src={normalizeImagePath(heroShoe.images[0]?.url)}
                    alt={heroShoe.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 680px"
                    className="object-contain p-8 transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="relative z-10 flex min-h-[520px] max-w-xl flex-col justify-end p-8 md:p-12">
                  <p className="mb-4 text-sm text-white/60">
                    Store discovery
                  </p>
                  <h1 className="text-5xl font-semibold leading-[0.9] md:text-7xl">
                    {heroShoe.name}
                  </h1>
                  <p className="mt-6 max-w-md text-sm leading-7 text-white/70 md:text-base">
                    Fresh from the vault with live size availability and checkout-ready pricing.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">
                      {formatCurrency(heroShoe.price)}
                    </span>
                    <span className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/75">
                      {availabilityLabel(heroShoe.sizes)}
                    </span>
                  </div>
                </div>
              </Link>

              <aside className="rounded-lg border border-black/10 bg-white p-6">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <p className="text-sm text-black/50">Latest drop</p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight">
                      {secondaryShoe.name}
                    </h2>
                    <p className="mt-3 text-sm text-black/55">
                      {secondaryShoe.brand.name} pairs currently in the store.
                    </p>
                  </div>

                  <Link href={`/product/${secondaryShoe.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f3]">
                      <Image
                        src={normalizeImagePath(secondaryShoe.images[0]?.url)}
                        alt={secondaryShoe.name}
                        fill
                        sizes="(max-width: 1024px) 90vw, 360px"
                        className="object-contain p-8 transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium">
                        {formatCurrency(secondaryShoe.price)}
                      </span>
                      <span className="text-black/50">
                        {availabilityLabel(secondaryShoe.sizes)}
                      </span>
                    </div>
                  </Link>
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-lg border border-black/10 bg-white px-8 py-16 text-center">
              <h1 className="text-4xl font-semibold">
                Store inventory is empty
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-black/50">
                Add products from the admin dashboard to turn this store into a live discovery page.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl border-y border-black/10 py-6">
          <div className="grid gap-5 md:grid-cols-4">
            <div>
              <p className="text-3xl font-semibold">{formattedShoes.length}</p>
              <p className="mt-1 text-sm text-black/50">Products in vault</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{totalAvailablePairs}</p>
              <p className="mt-1 text-sm text-black/50">Pairs available</p>
            </div>
            {brandSummaries.slice(0, 2).map((brand) => (
              <div key={brand.name}>
                <p className="text-3xl font-semibold">{brand.name}</p>
                <p className="mt-1 text-sm text-black/50">
                  {brand.products} {brand.products === 1 ? "product" : "products"}, {brand.stock} pairs
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {latestDrops.length > 0 && (
        <section className="px-6 py-16 md:px-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">
                  Latest arrivals
                </h2>
                <p className="mt-2 text-sm text-black/50">
                  Discovery picks before the full catalog.
                </p>
              </div>
              <p className="text-sm text-black/50">
                Sorted by newest arrivals
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestDrops.map((shoe) => (
                <Link
                  key={shoe.id}
                  href={`/product/${shoe.slug}`}
                  className="group rounded-lg border border-black/10 bg-white p-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f3]">
                    <Image
                      src={normalizeImagePath(shoe.images[0]?.url)}
                      alt={shoe.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 260px"
                      className="object-contain p-6 transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="font-medium">{shoe.name}</p>
                    <p className="mt-1 text-sm text-black/50">{shoe.brand.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-black/10 py-5 text-sm text-black/60">
            <p>
              Showing {formattedShoes.length} products
            </p>
            <p>
              Live availability by size
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {formattedShoes.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {formattedShoes.map((shoe) => {
                const imageUrl = normalizeImagePath(shoe.images[0]?.url)

                return (
                  <Link
                    key={shoe.id}
                    href={`/product/${shoe.slug}`}
                    className="group"
                  >
                    <div>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white">
                        <Image
                          src={imageUrl}
                          alt={shoe.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-6 space-y-2">
                        <h2 className="text-base font-medium">
                          {shoe.name}
                        </h2>

                        <p className="text-sm text-black/60">
                          {shoe.brand.name}
                        </p>

                        <p className="text-xs uppercase tracking-widest text-black/40">
                          {availabilityLabel(shoe.sizes)}
                        </p>

                        <div className="text-sm font-medium">
                          {formatCurrency(shoe.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="border border-black/10 bg-white px-8 py-12 text-center">
              <h2 className="text-lg font-medium">
                No products available
              </h2>
              <p className="mt-2 text-sm text-black/50">
                Add products and size stock from the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
