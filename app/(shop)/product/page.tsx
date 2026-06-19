import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
import type { ReactNode } from "react"
import {
  availabilityLabel,
  formatCurrency,
  normalizeStockRows,
  totalStock,
} from "@/lib/commerce"
import {
  Check,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Truck,
} from "lucide-react"

export const dynamic = "force-dynamic"

type SearchValue = string | string[] | undefined

interface ProductsPageProps {
  searchParams?: Promise<Record<string, SearchValue>>
}

const audienceOptions = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
]

const categoryOptions = [
  "Lifestyle",
  "Running",
  "Basketball",
  "Skate",
  "Training",
]

const sortOptions = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "stock-desc", label: "Most available" },
]

const availabilityOptions = [
  { value: "all", label: "All products" },
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low stock" },
  { value: "out-of-stock", label: "Out of stock" },
]

const badges = [
  "New Drop",
  "Best Seller",
  "Limited",
  "Verified Stock",
  "Staff Pick",
]

function readParam(params: Record<string, SearchValue>, key: string) {
  const value = params[key]

  return Array.isArray(value) ? value[0] : value
}

function createMockMeta(
  shoe: {
    name: string
    brand: { name: string }
  },
  index: number
) {
  const name = shoe.name.toLowerCase()
  const brand = shoe.brand.name.toLowerCase()
  const audience = index % 5 === 2 ? "kids" : index % 3 === 1 ? "women" : "men"
  const category = name.includes("jordan")
    ? "Basketball"
    : name.includes("sb") || name.includes("dunk")
      ? "Skate"
      : brand.includes("adidas")
        ? "Running"
        : index % 2 === 0
          ? "Lifestyle"
          : "Training"

  return {
    audience,
    category,
    badge: badges[index % badges.length],
    rating: (4.6 + (index % 4) * 0.1).toFixed(1),
    reviews: 48 + index * 19,
    delivery: index % 2 === 0 ? "Ships in 24h" : "2 day dispatch",
  }
}

function priceOf(price: string | null) {
  return price == null ? 0 : Number(price)
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {}
  const activeAudience = readParam(params, "audience") ?? "all"
  const activeCategory = readParam(params, "category")
  const activeBrand = readParam(params, "brand")
  const activeSize = readParam(params, "size")
  const activeAvailability = readParam(params, "availability") ?? "all"
  const activeSort = readParam(params, "sort") ?? "newest"

  const createHref = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams()

    for (const [key, rawValue] of Object.entries(params)) {
      const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

      if (value) {
        nextParams.set(key, value)
      }
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "all" || value === "") {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    }

    const query = nextParams.toString()

    return query ? `/product?${query}` : "/product"
  }

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

  const enrichedShoes = shoes.map((shoe, index) => ({
    ...shoe,
    price: shoe.price == null ? null : shoe.price.toString(),
    sizes: normalizeStockRows(shoe.sizes),
    meta: createMockMeta(shoe, index),
    originalIndex: index,
  }))

  const inStockShoes = enrichedShoes.filter((shoe) => totalStock(shoe.sizes) > 0)
  const heroShoe = inStockShoes[0] ?? enrichedShoes[0]
  const brands = Array.from(new Set(enrichedShoes.map((shoe) => shoe.brand.name))).sort()
  const sizes = Array.from(
    new Set(enrichedShoes.flatMap((shoe) => shoe.sizes.map((size) => size.size)))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))

  const filteredShoes = enrichedShoes
    .filter((shoe) => activeAudience === "all" || shoe.meta.audience === activeAudience)
    .filter((shoe) => !activeCategory || shoe.meta.category === activeCategory)
    .filter((shoe) => !activeBrand || shoe.brand.name === activeBrand)
    .filter((shoe) => !activeSize || shoe.sizes.some((size) => size.size === activeSize && size.stock > 0))
    .filter((shoe) => {
      const stock = totalStock(shoe.sizes)

      if (activeAvailability === "in-stock") return stock > 0
      if (activeAvailability === "low-stock") return stock > 0 && stock <= 3
      if (activeAvailability === "out-of-stock") return stock === 0

      return true
    })
    .sort((a, b) => {
      if (activeSort === "price-desc") return priceOf(b.price) - priceOf(a.price)
      if (activeSort === "price-asc") return priceOf(a.price) - priceOf(b.price)
      if (activeSort === "stock-desc") return totalStock(b.sizes) - totalStock(a.sizes)

      return a.originalIndex - b.originalIndex
    })

  const totalAvailablePairs = enrichedShoes.reduce(
    (sum, shoe) => sum + totalStock(shoe.sizes),
    0
  )
  const activeFiltersCount = [
    activeAudience !== "all",
    Boolean(activeCategory),
    Boolean(activeBrand),
    Boolean(activeSize),
    activeAvailability !== "all",
    activeSort !== "newest",
  ].filter(Boolean).length
  const heroImage = normalizeImagePath(heroShoe?.images[0]?.url)

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-black">
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

      <section className="px-6 pb-10 pt-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {heroShoe ? (
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[500px] overflow-hidden rounded-lg bg-black text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
                <div className="absolute inset-y-8 right-0 w-full md:w-[56%]">
                  <Image
                    src={heroImage}
                    alt={heroShoe.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 660px"
                    className="object-contain p-8"
                  />
                </div>

                <div className="relative z-10 flex min-h-[500px] max-w-xl flex-col justify-end p-8 md:p-12">
                  <p className="mb-4 text-sm text-white/60">
                    Store for every rotation
                  </p>
                  <h1 className="text-5xl font-semibold leading-[0.9] md:text-7xl">
                    Men, women, kids. One live vault.
                  </h1>
                  <p className="mt-6 max-w-md text-sm leading-7 text-white/70 md:text-base">
                    Browse real inventory by audience, category, size, brand, and price before choosing the pair that fits.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white px-5 py-3 font-medium text-black">
                      {enrichedShoes.length} products
                    </span>
                    <span className="rounded-full border border-white/20 px-5 py-3 text-white/75">
                      {totalAvailablePairs} pairs available
                    </span>
                  </div>
                </div>
              </div>

              <aside className="rounded-lg border border-black/10 bg-white p-6">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <p className="text-sm text-black/50">Featured from the vault</p>
                    <h2 className="mt-3 text-3xl font-semibold leading-tight">
                      {heroShoe.name}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-black px-3 py-1.5 text-white">
                        {heroShoe.meta.badge}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1.5 text-black/60">
                        {heroShoe.meta.category}
                      </span>
                      <span className="rounded-full bg-black/5 px-3 py-1.5 text-black/60">
                        {heroShoe.meta.delivery}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-[#f4f3ef] p-4">
                        <p className="text-2xl font-semibold">{heroShoe.meta.rating}</p>
                        <p className="mt-1 text-black/50">Rating</p>
                      </div>
                      <div className="rounded-lg bg-[#f4f3ef] p-4">
                        <p className="text-2xl font-semibold">{heroShoe.meta.reviews}</p>
                        <p className="mt-1 text-black/50">Reviews</p>
                      </div>
                      <div className="rounded-lg bg-[#f4f3ef] p-4">
                        <p className="text-2xl font-semibold">{totalStock(heroShoe.sizes)}</p>
                        <p className="mt-1 text-black/50">Pairs</p>
                      </div>
                    </div>

                    <Link
                      href={`/product/${heroShoe.slug}`}
                      className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      View featured pair
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-lg border border-black/10 bg-white px-8 py-16 text-center">
              <h1 className="text-4xl font-semibold">
                Store inventory is empty
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-black/50">
                Add products from the admin dashboard to turn this page into a live store.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2 border-y border-black/10 py-4">
            {audienceOptions.map((option) => {
              const isActive = activeAudience === option.value

              return (
                <Link
                  key={option.value}
                  href={createHref({ audience: option.value })}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-white text-black/60 hover:text-black"
                  }`}
                >
                  {option.label}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-lg border border-black/10 bg-white p-5 lg:sticky lg:top-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <h2 className="font-semibold">Shop filters</h2>
              </div>
              {activeFiltersCount > 0 && (
                <Link href="/product" className="text-sm text-black/45 hover:text-black">
                  Reset
                </Link>
              )}
            </div>

            <div className="space-y-7">
              <FilterGroup title="Sort">
                {sortOptions.map((option) => (
                  <FilterLink
                    key={option.value}
                    href={createHref({ sort: option.value })}
                    active={activeSort === option.value}
                  >
                    {option.label}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Category">
                {categoryOptions.map((category) => (
                  <FilterLink
                    key={category}
                    href={createHref({
                      category: activeCategory === category ? null : category,
                    })}
                    active={activeCategory === category}
                  >
                    {category}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Brand">
                {brands.map((brand) => (
                  <FilterLink
                    key={brand}
                    href={createHref({
                      brand: activeBrand === brand ? null : brand,
                    })}
                    active={activeBrand === brand}
                  >
                    {brand}
                  </FilterLink>
                ))}
              </FilterGroup>

              <FilterGroup title="Size">
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <Link
                      key={size}
                      href={createHref({
                        size: activeSize === size ? null : size,
                      })}
                      className={`rounded-lg border px-3 py-2 text-center text-sm transition ${
                        activeSize === size
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-[#f4f3ef] text-black/60 hover:text-black"
                      }`}
                    >
                      {size}
                    </Link>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Availability">
                {availabilityOptions.map((option) => (
                  <FilterLink
                    key={option.value}
                    href={createHref({ availability: option.value })}
                    active={activeAvailability === option.value}
                  >
                    {option.label}
                  </FilterLink>
                ))}
              </FilterGroup>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">
                  Shop the vault
                </h2>
                <p className="mt-2 text-sm text-black/50">
                  Showing {filteredShoes.length} of {enrichedShoes.length} products with live stock labels.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-black/55">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <ShieldCheck size={14} />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <Truck size={14} />
                  Fast dispatch
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <RotateCcw size={14} />
                  Easy review
                </span>
              </div>
            </div>

            {filteredShoes.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredShoes.map((shoe) => {
                  const imageUrl = normalizeImagePath(shoe.images[0]?.url)
                  const stock = totalStock(shoe.sizes)

                  return (
                    <Link
                      key={shoe.id}
                      href={`/product/${shoe.slug}`}
                      className="group rounded-lg border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#f4f3ef]">
                        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                            {shoe.meta.badge}
                          </span>
                          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs text-black/60">
                            {shoe.meta.category}
                          </span>
                        </div>
                        <Image
                          src={imageUrl}
                          alt={shoe.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 360px"
                          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-black/45">
                              {shoe.brand.name}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold leading-tight">
                              {shoe.name}
                            </h3>
                          </div>
                          <p className="shrink-0 text-base font-semibold">
                            {formatCurrency(shoe.price)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/55">
                          <span className="inline-flex items-center gap-1">
                            <Star size={15} className="fill-black text-black" />
                            {shoe.meta.rating} ({shoe.meta.reviews})
                          </span>
                          <span>
                            {shoe.meta.delivery}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-4 text-sm">
                          <span className={stock > 0 ? "text-black/60" : "text-red-600"}>
                            {availabilityLabel(shoe.sizes)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-black/55">
                            <Check size={14} />
                            Size stock
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-black/10 bg-white px-8 py-16 text-center">
                <h3 className="text-2xl font-semibold">
                  No products match these filters
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
                  Try clearing a size, category, or audience filter to see more pairs from the vault.
                </p>
                <Link
                  href="/product"
                  className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-black">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        active
          ? "bg-black text-white"
          : "bg-[#f4f3ef] text-black/60 hover:text-black"
      }`}
    >
      <span>{children}</span>
      {active && <Check size={14} />}
    </Link>
  )
}
