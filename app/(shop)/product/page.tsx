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
import {
  audienceOptions,
  availabilityOptions,
  collectionOptions,
  enrichDiscoveryShoe,
  matchesCollection,
  matchesProductSearch,
  priceInRange,
  priceRangeOptions,
  sortOptions,
  type CollectionValue,
} from "@/lib/product-discovery"
import { filterActionClass, uiAction } from "@/lib/ui-interactions"
import {
  Check,
  Eye,
  RotateCcw,
  Search,
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

function readParam(params: Record<string, SearchValue>, key: string) {
  const value = params[key]

  return Array.isArray(value) ? value[0] : value
}

function isCollectionValue(value: string | undefined): value is CollectionValue {
  return collectionOptions.some((option) => option.value === value)
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
  const activeQuery = (readParam(params, "q") ?? "").trim()
  const activeCollectionParam = readParam(params, "collection")
  const activeCollection = isCollectionValue(activeCollectionParam)
    ? activeCollectionParam
    : null
  const activePriceRange = priceRangeOptions.some(
    (option) => option.value === activePriceRangeParam
  )
    ? activePriceRangeParam
    : "all"

  const createHref = (updates: Record<string, string | null | undefined>) => {
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

  const enrichedShoes = shoes.map((shoe, index) =>
    enrichDiscoveryShoe(
      {
        ...shoe,
        price: shoe.price == null ? null : shoe.price.toString(),
        sizes: normalizeStockRows(shoe.sizes),
      },
      index
    )
  )

  const inStockShoes = enrichedShoes.filter((shoe) => totalStock(shoe.sizes) > 0)
  const heroShoe = inStockShoes[0] ?? enrichedShoes[0]
  const brands = Array.from(new Set(enrichedShoes.map((shoe) => shoe.brand.name))).sort()
  const categories = Array.from(new Set(enrichedShoes.map((shoe) => shoe.meta.category))).sort()
  const sizes = Array.from(
    new Set(enrichedShoes.flatMap((shoe) => shoe.sizes.map((size) => size.size)))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  const collectionCounts = Object.fromEntries(
    collectionOptions.map((option) => [
      option.value,
      enrichedShoes.filter((shoe) =>
        matchesCollection(shoe, shoe.meta, option.value, shoe.originalIndex)
      ).length,
    ])
  )

  const filteredShoes = enrichedShoes
    .filter((shoe) => activeAudience === "all" || shoe.meta.audience === activeAudience)
    .filter((shoe) => !activeCategory || shoe.meta.category === activeCategory)
    .filter((shoe) => !activeBrand || shoe.brand.name === activeBrand)
    .filter((shoe) => !activeSize || shoe.sizes.some((size) => size.size === activeSize && size.stock > 0))
    .filter((shoe) => priceInRange(shoe.price, activePriceRange))
    .filter((shoe) =>
      matchesCollection(shoe, shoe.meta, activeCollection, shoe.originalIndex)
    )
    .filter((shoe) => matchesProductSearch(shoe, shoe.meta, activeQuery))
    .filter((shoe) => {
      const stock = totalStock(shoe.sizes)

      if (activeAvailability === "in-stock") return stock > 0
      if (activeAvailability === "low-stock") return stock > 0 && stock <= 3
      if (activeAvailability === "out-of-stock") return stock === 0

      return true
    })
    .sort((a, b) => {
      if (activeSort === "stock-desc") return totalStock(b.sizes) - totalStock(a.sizes)
      if (activeSort === "price-asc") return Number(a.price ?? 0) - Number(b.price ?? 0)
      if (activeSort === "price-desc") return Number(b.price ?? 0) - Number(a.price ?? 0)

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
    Boolean(activeCollection),
    Boolean(activeQuery),
  ].filter(Boolean).length
  const heroImage = normalizeImagePath(heroShoe?.images[0]?.url)
  const heroAudienceLabel = heroShoe
    ? audienceOptions.find((option) => option.value === heroShoe.meta.audience)?.label
    : null
  const heroAudienceActive = heroShoe
    ? activeAudience === heroShoe.meta.audience
    : false
  const activeCollectionLabel = activeCollection
    ? collectionOptions.find((option) => option.value === activeCollection)?.label
    : null

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-black">
      <section className="px-6 pt-8 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className={`text-sm ${uiAction.ghost}`}
          >
            <AppLogo compact subLabel="กลับหน้าหลัก" />
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
                        Store สำหรับทุกสไตล์
                      </span>
                      <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-none md:text-6xl">
                        หา sneaker คู่ที่เข้ากับทุกวันของคุณ
                      </h1>
                      <p className="mt-5 max-w-md text-sm leading-7 text-black/60 md:text-base">
                        ค้นหาแบรนด์ รุ่น หมวดหมู่ และเลือก collection ได้ในหน้าเดียว
                        พร้อมดูราคา ไซซ์ และ Stock ก่อนตัดสินใจ
                      </p>
                    </div>

                    <form
                      action="/product"
                      className="rounded-lg border border-black/10 bg-[#f8f7f3] p-2"
                    >
                      {activeAudience !== "all" && (
                        <input type="hidden" name="audience" value={activeAudience} />
                      )}
                      {activeCollection && (
                        <input type="hidden" name="collection" value={activeCollection} />
                      )}
                      {activeCategory && (
                        <input type="hidden" name="category" value={activeCategory} />
                      )}
                      {activeBrand && (
                        <input type="hidden" name="brand" value={activeBrand} />
                      )}
                      {activeSize && (
                        <input type="hidden" name="size" value={activeSize} />
                      )}
                      {activeAvailability !== "all" && (
                        <input type="hidden" name="availability" value={activeAvailability} />
                      )}
                      {activePriceRange !== "all" && (
                        <input type="hidden" name="price" value={activePriceRange} />
                      )}
                      {activeSort !== "newest" && (
                        <input type="hidden" name="sort" value={activeSort} />
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <label className="relative flex min-h-12 flex-1 items-center">
                          <Search
                            size={18}
                            className="absolute left-4 text-black/45"
                            aria-hidden="true"
                          />
                          <span className="sr-only">ค้นหาสินค้า</span>
                          <input
                            name="q"
                            defaultValue={activeQuery}
                            placeholder="ค้นหารุ่น แบรนด์ หรือ running"
                            className="h-12 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-black/45 focus:border-black"
                          />
                        </label>
                        <button
                          type="submit"
                          className={`h-12 px-5 text-sm font-semibold ${uiAction.accent}`}
                        >
                          ค้นหา
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-3 gap-3">
                      <StoreStat
                        label="สินค้า"
                        value={enrichedShoes.length}
                        tone="accent"
                      />
                      <StoreStat
                        label="จำนวนคู่"
                        value={totalAvailablePairs}
                      />
                      <StoreStat
                        label="ตัวกรอง"
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
                      <p className="text-sm text-black/55">คู่แนะนำจาก vault</p>
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
                          label="คะแนน"
                          value={heroShoe.meta.rating}
                        />
                        <StoreStat
                          label="รีวิว"
                          value={heroShoe.meta.reviews}
                        />
                        <StoreStat
                          label="จำนวนคู่"
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
                          ดูคู่แนะนำ
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
                          เลือกดู {heroAudienceLabel ?? heroShoe.meta.audience}
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
                ยังไม่มีสินค้าใน Store
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-black/50">
                เพิ่มสินค้าจากหน้า Admin dashboard เพื่อเริ่มเปิดหน้าร้านจริง
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-10 md:px-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-black">
                เลือกตามกลุ่มผู้ใส่
              </h2>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((option) => (
                  <AudienceFilterLink
                    key={option.value}
                    href={createHref({ audience: option.value })}
                    active={activeAudience === option.value}
                  >
                    {option.label}
                  </AudienceFilterLink>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-black">Collections</h2>
                <p className="mt-1 text-xs text-black/50">
                  ทางลัดสำหรับดูคู่ที่เหมาะกับสถานการณ์ต่าง ๆ
                </p>
              </div>
              {activeCollection && (
                <Link href={createHref({ collection: null })} className={`text-sm ${uiAction.ghost}`}>
                  ล้าง collection
                </Link>
              )}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {collectionOptions.map((option) => {
                const isActive = activeCollection === option.value

                return (
                  <Link
                    key={option.value}
                    href={createHref({
                      collection: isActive ? null : option.value,
                    })}
                    aria-current={isActive ? true : undefined}
                    className={filterActionClass({
                      active: isActive,
                      className: "min-h-[88px] flex-col items-start justify-between px-4 py-3 text-left",
                      shape: "rounded-lg",
                    })}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      <span className="font-semibold">{option.label}</span>
                      <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                        {collectionCounts[option.value] ?? 0}
                      </span>
                    </span>
                    <span className="text-xs leading-5 opacity-70">
                      {option.description}
                    </span>
                  </Link>
                )
              })}
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
                <h2 className="font-semibold">ตัวกรองสินค้า</h2>
              </div>
              {activeFiltersCount > 0 && (
                <Link href="/product" className={`text-sm ${uiAction.ghost}`}>
                  รีเซ็ต
                </Link>
              )}
            </div>

            <div className="divide-y divide-black/10">
              <FilterGroup title="ช่วงราคา">
                <PriceRangeFilter
                  activePriceRange={activePriceRange}
                  createHref={(value) => createHref({ price: value })}
                />
              </FilterGroup>

              <FilterGroup title="เรียงลำดับ">
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

              <FilterGroup title="หมวดหมู่">
                {categories.map((category) => (
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

              <FilterGroup title="แบรนด์">
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

              <FilterGroup title="ไซซ์">
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

              <FilterGroup title="สถานะสินค้า">
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
                  เลือกซื้อจาก vault
                </h2>
                <p className="mt-2 text-sm text-black/50">
                  แสดง {filteredShoes.length} จาก {enrichedShoes.length} รายการ
                  {activeQuery ? ` สำหรับ "${activeQuery}"` : ""}
                  {activeCollectionLabel ? ` ใน ${activeCollectionLabel}` : ""} พร้อมป้าย Stock จริง
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-black/55">
                {activeQuery && (
                  <Link
                    href={createHref({ q: null })}
                    className={`inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 ${uiAction.ghost}`}
                  >
                    ล้างคำค้น
                  </Link>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <ShieldCheck size={14} />
                  Checkout ปลอดภัย
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <Truck size={14} />
                  จัดส่งรวดเร็ว
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2">
                  <RotateCcw size={14} />
                  ตรวจสอบง่าย
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
                            Stock ตามไซซ์
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
                  ไม่พบสินค้าที่ตรงกับเงื่อนไข
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
                  ลองล้างคำค้น collection หรือ filter บางตัว เพื่อดูสินค้ามากขึ้น
                </p>
                <Link
                  href="/product"
                  className={`mt-6 px-5 py-3 text-sm font-semibold ${uiAction.accent}`}
                >
                  <RotateCcw size={16} />
                  ล้างตัวกรอง
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
        className: "min-h-11 px-5 py-2.5 font-medium",
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
        <span>ต่ำ</span>
        <span>สูง</span>
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
                aria-label={`กรองราคา ${option.label}`}
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
        {activeOption.value === "all" ? "ทุกราคา" : activeOption.label}
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
