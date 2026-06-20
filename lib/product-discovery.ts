import { totalStock, type StockRow } from "@/lib/commerce"

export interface DiscoveryShoeInput {
  id: string
  slug: string
  name: string
  description: string
  price: string | null
  featured?: boolean
  brand: { name: string }
  sizes: StockRow[]
}

export type AudienceValue = "all" | "men" | "women" | "kids"

export const audienceOptions: { value: AudienceValue; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "men", label: "ผู้ชาย" },
  { value: "women", label: "ผู้หญิง" },
  { value: "kids", label: "เด็ก" },
]

export const sortOptions = [
  { value: "newest", label: "มาใหม่ล่าสุด" },
  { value: "stock-desc", label: "Stock มากที่สุด" },
  { value: "price-asc", label: "ราคาต่ำไปสูง" },
  { value: "price-desc", label: "ราคาสูงไปต่ำ" },
]

export const priceRangeOptions = [
  { value: "all", label: "ทุกราคา", shortLabel: "ทั้งหมด", min: null, max: null },
  { value: "0-5000", label: "ต่ำกว่า 5,000", shortLabel: "<5k", min: 0, max: 5000 },
  { value: "5000-9000", label: "5,000 ถึง 9,000", shortLabel: "5-9k", min: 5000, max: 9000 },
  { value: "9000-13000", label: "9,000 ถึง 13,000", shortLabel: "9-13k", min: 9000, max: 13000 },
  { value: "13000-up", label: "13,000 ขึ้นไป", shortLabel: "13k+", min: 13000, max: null },
]

export const availabilityOptions = [
  { value: "all", label: "สินค้าทั้งหมด" },
  { value: "in-stock", label: "มีสินค้า" },
  { value: "low-stock", label: "เหลือน้อย" },
  { value: "out-of-stock", label: "สินค้าหมด" },
]

export const collectionOptions = [
  {
    value: "featured",
    label: "ทีมคัดให้",
    description: "คู่เด่นและรุ่นที่เหมาะเปิด rotation",
  },
  {
    value: "new-drops",
    label: "Drop ใหม่",
    description: "สินค้าล่าสุดจาก vault",
  },
  {
    value: "limited-stock",
    label: "เหลือน้อย",
    description: "คู่ที่ควรตัดสินใจก่อน Stock หมด",
  },
  {
    value: "under-5k",
    label: "ไม่เกิน 5,000",
    description: "คู่เริ่มต้นที่เข้าถึงง่าย",
  },
  {
    value: "family-size",
    label: "Family size",
    description: "รุ่นที่เหมาะกับเด็กและครอบครัว",
  },
] as const

export type CollectionValue = (typeof collectionOptions)[number]["value"]

export interface DiscoveryMeta {
  audience: Exclude<AudienceValue, "all">
  category: string
  badge: string
  rating: string
  reviews: number
  delivery: string
}

export function priceOf(price: string | null) {
  return price == null ? 0 : Number(price)
}

export function priceInRange(price: string | null, rangeValue: string) {
  const range = priceRangeOptions.find((option) => option.value === rangeValue)

  if (!range || range.value === "all") return true

  const value = priceOf(price)

  if (range.min != null && value < range.min) return false
  if (range.max != null && value > range.max) return false

  return true
}

export function buildDiscoveryMeta(shoe: DiscoveryShoeInput, index: number): DiscoveryMeta {
  const name = shoe.name.toLowerCase()
  const brand = shoe.brand.name.toLowerCase()
  const description = shoe.description.toLowerCase()
  const numericSizes = shoe.sizes
    .map((row) => Number(row.size))
    .filter((size) => Number.isFinite(size))
  const smallestSize = numericSizes.length > 0 ? Math.min(...numericSizes) : null
  const totalPairs = totalStock(shoe.sizes)

  const audience: DiscoveryMeta["audience"] =
    name.includes("kids") || description.includes("kids") || (smallestSize != null && smallestSize <= 32)
      ? "kids"
      : index % 3 === 1
        ? "women"
        : "men"

  const category = name.includes("jordan") ||
    name.includes("blazer") ||
    name.includes("forum") ||
    name.includes("550") ||
    description.includes("basketball")
    ? "Basketball"
    : name.includes("sb") ||
      name.includes("dunk") ||
      name.includes("sk8") ||
      name.includes("skool") ||
      name.includes("vans") ||
      description.includes("skate")
      ? "Skate"
      : brand.includes("adidas") ||
        brand.includes("asics") ||
        name.includes("pegasus") ||
        name.includes("990") ||
        name.includes("530") ||
        name.includes("runner") ||
        name.includes("run") ||
        description.includes("running")
        ? "Running"
        : name.includes("kids")
          ? "Kids"
          : "Lifestyle"

  const badges = ["New Drop", "Best Seller", "Limited", "Verified Stock", "Staff Pick"]

  return {
    audience,
    category,
    badge: totalPairs === 0
      ? "Sold Out"
      : totalPairs <= 3
        ? "Low Stock"
        : shoe.featured
          ? "Featured"
          : badges[index % badges.length],
    rating: (4.6 + (index % 4) * 0.1).toFixed(1),
    reviews: 48 + index * 19,
    delivery: index % 2 === 0 ? "จัดส่งใน 24 ชม." : "จัดส่งภายใน 2 วัน",
  }
}

export function matchesProductSearch(
  shoe: DiscoveryShoeInput,
  meta: DiscoveryMeta,
  query: string | null | undefined
) {
  const normalizedQuery = query?.trim().toLowerCase()

  if (!normalizedQuery) return true

  const audienceLabel = audienceOptions.find((option) => option.value === meta.audience)?.label ?? meta.audience
  const searchableText = [
    shoe.name,
    shoe.slug,
    shoe.description,
    shoe.brand.name,
    meta.category,
    meta.badge,
    audienceLabel,
  ]
    .join(" ")
    .toLowerCase()

  return searchableText.includes(normalizedQuery)
}

export function matchesCollection(
  shoe: DiscoveryShoeInput,
  meta: DiscoveryMeta,
  collection: string | null | undefined,
  index = 0
) {
  if (!collection || collection === "all") return true

  const totalPairs = totalStock(shoe.sizes)
  const price = priceOf(shoe.price)

  if (collection === "featured") return Boolean(shoe.featured) || meta.badge === "Featured"
  if (collection === "new-drops") return index < 8 || meta.badge === "New Drop"
  if (collection === "limited-stock") return totalPairs > 0 && totalPairs <= 3
  if (collection === "under-5k") return price > 0 && price <= 5000
  if (collection === "family-size") return meta.audience === "kids" || meta.category === "Kids"

  return true
}

export function enrichDiscoveryShoe<T extends DiscoveryShoeInput>(shoe: T, index: number) {
  return {
    ...shoe,
    meta: buildDiscoveryMeta(shoe, index),
    originalIndex: index,
  }
}

export function getRecommendedProducts<TCandidate extends DiscoveryShoeInput>(
  currentProduct: DiscoveryShoeInput,
  candidates: TCandidate[],
  limit = 4
) {
  const currentMeta = buildDiscoveryMeta(currentProduct, 0)
  const currentPrice = priceOf(currentProduct.price)

  return candidates
    .filter((candidate) => candidate.id !== currentProduct.id)
    .map((candidate, index) => {
      const meta = buildDiscoveryMeta(candidate, index)
      const candidatePrice = priceOf(candidate.price)
      const priceGap = Math.abs(candidatePrice - currentPrice)
      let score = 0

      if (candidate.brand.name === currentProduct.brand.name) score += 8
      if (meta.category === currentMeta.category) score += 5
      if (meta.audience === currentMeta.audience) score += 3
      if (totalStock(candidate.sizes) > 0) score += 2
      if (candidate.featured) score += 1
      if (priceGap <= 2500) score += 3
      else if (priceGap <= 5000) score += 1

      return {
        shoe: candidate,
        score,
        stock: totalStock(candidate.sizes),
        originalIndex: index,
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.stock !== a.stock) return b.stock - a.stock

      return a.originalIndex - b.originalIndex
    })
    .slice(0, limit)
    .map((result) => result.shoe)
}
