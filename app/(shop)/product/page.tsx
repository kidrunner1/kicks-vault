import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import AppLogo from "@/app/component/ui/AppLogo"
import { normalizeImagePath } from "@/lib/image"
import type { ReactNode } from "react"
import {
  availabilityLabel,
  formatCurrency,
  normalizeStockRows,
  totalStock,
} from "@/lib/commerce"
import { filterActionClass, uiAction } from "@/lib/ui-interactions"
import {
  Check,
  Eye,
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
  { value: "stock-desc", label: "Most available" },
]

const priceRangeOptions = [
  { value: "all", label: "All", shortLabel: "All", min: null, max: null },
  { value: "0-5000", label: "Under 5,000", shortLabel: "<5k", min: 0, max: 5000 },
  { value: "5000-9000", label: "5,000 to 9,000", shortLabel: "5-9k", min: 5000, max: 9000 },
  { value: "9000-13000", label: "9,000 to 13,000", shortLabel: "9-13k", min: 9000, max: 13000 },
  { value: "13000-up", label: "13,000 and up", shortLabel: "13k+", min: 13000, max: null },
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

function priceInRange(price: string | null, rangeValue: string) {
  const range = priceRangeOptions.find((option) => option.value === rangeValue)

  if (!range || range.value === "all") return true

  const value = priceOf(price)

  if (range.min != null && value < range.min) return false
  if (range.max != null && value > range.max) return false

  return true
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) ?? {}
  const activeAudience = readParam(params, "audience") ?? "all"
  const activeCategory = readParam(params, "category")
  const activeBrand = readParam(params, "brand")
  const activeSize = readParam(params, "size")
  const activeAvailability = readParam(params, "availability") ?? "all"
  const activeSort = readParam(params, "sort") ?? "newest"
  const activePriceRangeParam = readParam(params, "price") ?? "all"
  const activePriceRange = priceRangeOptions.some(
    (option) => option.value === activePriceRangeParam
  )
    ? activePriceRangeParam
    : "all"

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
    .filter((shoe) => priceInRange(shoe.price, activePriceRange))
    .filter((shoe) => {
      const stock = totalStock(shoe.sizes)

      if (activeAvailability === "in-stock") return stock > 0
      if (activeAvailability === "low-stock") return stock > 0 && stock <= 3
      if (activeAvailability === "out-of-stock") return stock === 0

      return true
    })
    .sort((a, b) => {
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
    activePriceRange !== "all",
    activeSort !== "newest",
  ].filter(Boolean).length
  const heroImage = normalizeImagePath(heroShoe?.images[0]?.url)
  const heroAudienceLabel = heroShoe
    ? audienceOptions.find((option) => option.value === heroShoe.meta.audience)?.label
    : null
  const heroAudienceActive = heroShoe
    ? activeAudience === heroShoe.meta.audience
    : false

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-black">
      <section className="px-6 pt-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className={`text-sm ${uiAction.ghost}`}
          >
            <AppLogo compact subLabel="Back to Home" />
          </Link>
        </div>
      </section>

      <section className="px-6 pb-10 pt-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {heroShoe ? (
            <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <span className="inline-flex rounded-full border border-black bg-[#d8ff6a] px-4 py-2 text-sm font-semibold text-black">
                        Store for every rotation
                      </span>
                      <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-none md:text-6xl">
                        Find the pair that fits the whole lineup.
                      </h1>
                      <p className="mt-5 max-w-md text-sm leading-7 text-black/60 md:text-base">
                        Browse real inventory by audience, category, size, brand, and price before choosing the pair that fits.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-black">
                        Quick audience
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {audienceOptions.map((option) => (
                          <AudienceFilterLink
                            key={option.value}
                            href={createHref({ audience: option.value })}
                            active={activeAudience === option.value}
                            compact
                          >
                            {option.label}
                          </AudienceFilterLink>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <StoreStat
                        label="Products"
                        value={enrichedShoes.length}
                        tone="accent"
                      />
                      <StoreStat
                        label="Pairs"
                        value={totalAvailablePairs}
                      />
                      <StoreStat
                        label="Filters"
                        value={activeFiltersCount}
                      />
                    </div>
                  </div>

                  <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-black/10 bg-[#f4f3ef]">
                    <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-black bg-[#d8ff6a] px-3 py-1.5 font-semibold text-black">
                        {heroShoe.meta.badge}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/65">
                        {heroAudienceLabel ?? heroShoe.meta.audience}
                      </span>
                    </div>
                    <div className="absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-lg bg-[#d8ff6a]" />
                    <Image
                      src={heroImage}
                      alt={heroShoe.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 90vw, 620px"
                      className="z-10 object-contain p-8 md:p-10"
                    />
                  </div>
                </div>

                <aside className="border-t border-black/10 bg-[#f8f7f3] p-6 md:p-8 lg:border-l lg:border-t-0">
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div>
                      <p className="text-sm text-black/55">Featured from the vault</p>
                      <h2 className="mt-3 text-3xl font-semibold leading-tight">
                        {heroShoe.name}
                      </h2>
                      <p className="mt-3 text-xl font-semibold">
                        {formatCurrency(heroShoe.price)}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/65">
                          {heroShoe.meta.category}
                        </span>
                        <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-black/65">
                          {heroShoe.meta.delivery}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-5">
                      <div className="grid grid-cols-3 gap-3">
                        <StoreStat
                          label="Rating"
                          value={heroShoe.meta.rating}
                        />
                        <StoreStat
                          label="Reviews"
                          value={heroShoe.meta.reviews}
                        />
                        <StoreStat
                          label="Pairs"
                          value={totalStock(heroShoe.sizes)}
                          tone="accent"
                        />
                      </div>

                      <div className="grid gap-3">
                        <Link
                          href={`/product/${heroShoe.slug}`}
                          className={`px-6 py-3 text-sm font-semibold ${uiAction.accent}`}
                        >
                          <Eye size={16} />
                          View featured pair
                        </Link>
                        <Link
                          href={createHref({ audience: heroShoe.meta.audience })}
                          aria-current={heroAudienceActive ? true : undefined}
                          className={filterActionClass({
                            active: heroAudienceActive,
                            className: "min-h-11 justify-center px-5 py-3 font-medium",
                            shape: "rounded-full",
                          })}
                        >
                          {heroAudienceActive && (
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 rounded-full bg-black"
                            />
                          )}
                          Shop {heroAudienceLabel ?? heroShoe.meta.audience}
                        </Link>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
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
          <div className="rounded-lg border border-black/10 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-black">
                Shop by audience
              </h2>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => {
                  const isActive = activeAudience === option.value

                  return (
                    <AudienceFilterLink
                      key={option.value}
                      href={createHref({ audience: option.value })}
                      active={isActive}
                    >
                      {option.label}
                    </AudienceFilterLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[304px_1fr]">
          <aside className="h-fit rounded-lg border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <h2 className="font-semibold">Shop filters</h2>
              </div>
              {activeFiltersCount > 0 && (
                <Link href="/product" className={`text-sm ${uiAction.ghost}`}>
                  Reset
                </Link>
              )}
            </div>

            <div className="divide-y divide-black/10">
              <FilterGroup title="Price range">
                <PriceRangeFilter
                  activePriceRange={activePriceRange}
                  createHref={(value) => createHref({ price: value })}
                />
              </FilterGroup>

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
                      aria-current={activeSize === size ? true : undefined}
                      className={filterActionClass({
                        active: activeSize === size,
                        className: "h-11 justify-center px-3 text-center font-medium",
                      })}
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
                            <p className="text-sm text-black/60">
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
                  className={`mt-6 px-5 py-3 text-sm font-semibold ${uiAction.accent}`}
                >
                  <RotateCcw size={16} />
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

function AudienceFilterLink({
  href,
  active,
  compact = false,
  children,
}: {
  href: string
  active: boolean
  compact?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? true : undefined}
      className={filterActionClass({
        active,
        className: `${compact ? "min-h-10 px-4 py-2" : "min-h-11 px-5 py-2.5"} font-medium`,
        shape: "rounded-full",
      })}
    >
      {active && (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-black"
        />
      )}
      {children}
    </Link>
  )
}

function StoreStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: ReactNode
  tone?: "accent" | "neutral"
}) {
  const toneClass =
    tone === "accent"
      ? "border-black bg-[#d8ff6a] text-black"
      : "border-black/10 bg-white text-black"

  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-2xl font-semibold leading-none">
        {value}
      </p>
      <p className="mt-2 text-xs text-black/65">
        {label}
      </p>
    </div>
  )
}

function PriceRangeFilter({
  activePriceRange,
  createHref,
}: {
  activePriceRange: string
  createHref: (value: string) => string
}) {
  const activeIndex = Math.max(
    0,
    priceRangeOptions.findIndex((option) => option.value === activePriceRange)
  )
  const activeOption = priceRangeOptions[activeIndex]
  const priceProgressPercent =
    (activeIndex / (priceRangeOptions.length - 1)) * 100

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs text-black/60">
        <span>Low</span>
        <span>High</span>
      </div>
      <div className="relative px-2 pb-10 pt-4">
        <div className="absolute left-4 right-4 top-7 h-1.5 rounded-full bg-black/10" />
        <div
          className="absolute left-4 top-7 h-1.5 rounded-full bg-[#d8ff6a] ring-1 ring-inset ring-black/20"
          style={{
            right: `${100 - priceProgressPercent}%`,
          }}
        />
        <div className="relative flex items-start justify-between">
          {priceRangeOptions.map((option, optionIndex) => {
            const isActive = option.value === activeOption.value

            return (
              <Link
                key={option.value}
                href={createHref(option.value)}
                aria-current={isActive ? true : undefined}
                className="group flex w-12 flex-col items-center gap-2.5 text-center"
                aria-label={`Filter price ${option.label}`}
              >
                <span
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                    optionIndex <= activeIndex
                      ? "border-black bg-[#d8ff6a] shadow-sm"
                      : "border-black/20 bg-white group-hover:border-black/45"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-black"
                    />
                  )}
                </span>
                <span
                  className={`text-[11px] leading-tight ${
                    isActive ? "font-semibold text-black" : "text-black/60"
                  }`}
                >
                  {option.shortLabel}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      <p className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-black/60">
        {activeOption.value === "all" ? "All prices" : activeOption.label}
      </p>
    </div>
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
    <div className="py-5 first:pt-0 last:pb-0">
      <h3 className="mb-4 text-sm font-semibold text-black">
        {title}
      </h3>
      <div className="space-y-2.5">
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
      aria-current={active ? true : undefined}
      className={filterActionClass({
        active,
        className: "min-h-11 w-full justify-between px-4 py-3 font-medium",
      })}
    >
      <span>{children}</span>
      {active && <Check size={14} className="shrink-0" />}
    </Link>
  )
}
