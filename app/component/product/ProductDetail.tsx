"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCartStore } from "@/app/store/cart-store"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  PackageCheck,
  Ruler,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react"
import { normalizeImagePath } from "@/lib/image"
import {
  availabilityLabel,
  formatCurrency,
  totalStock,
} from "@/lib/commerce"
import {
  buildDiscoveryMeta,
  type DiscoveryMeta,
  type DiscoveryShoeInput,
} from "@/lib/product-discovery"
import { filterActionClass, uiAction } from "@/lib/ui-interactions"
import FloatingCartButton from "../cart/FloatingCartButton"
import AppLogo from "../ui/AppLogo"
import SizeChart from "../ui/SizeChart"
import FavoriteButton from "../ui/FavoriteButton"

interface ProductSpec {
  id: string
  label: string
  value: string
}

interface ProductImage {
  id: string
  url: string
}

interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: string | null
  featured?: boolean
  brand: { name: string }
  images: ProductImage[]
  specs: ProductSpec[]
  sizes: { id: string; size: string; stock: number }[]
}

interface RecommendationProduct extends DiscoveryShoeInput {
  images: { url: string }[]
  meta: DiscoveryMeta
}

interface Props {
  product: Product
  isFavorited: boolean
  recommendations?: RecommendationProduct[]
}

const MotionImage = motion(Image)

const trustItems = [
  {
    label: "Checkout ปลอดภัย",
    icon: ShieldCheck,
  },
  {
    label: "จัดส่งรวดเร็ว",
    icon: Truck,
  },
  {
    label: "ยืนยัน Stock ตามไซซ์",
    icon: Check,
  },
  {
    label: "บันทึกประวัติออเดอร์",
    icon: PackageCheck,
  },
]

const fallbackSpecs = [
  { id: "style", label: "สไตล์", value: "Lifestyle" },
  { id: "cushion", label: "ซัพพอร์ต", value: "Comfort foam" },
  { id: "upper", label: "วัสดุด้านบน", value: "Mixed textile" },
  { id: "fit", label: "ฟิตติ้ง", value: "True to size" },
]

export default function ProductDetail({
  product,
  isFavorited,
  recommendations = [],
}: Props) {
  const firstAvailableSize = product.sizes.find((size) => size.stock > 0)
  const [activeImage, setActiveImage] = useState(
    product.images[0]?.url ?? "/placeholder.png"
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(
    firstAvailableSize?.size ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const productMeta = useMemo(() => buildDiscoveryMeta(product, 0), [product])
  const selectedSizeObj = useMemo(() => {
    return product.sizes.find((size) => size.size === selectedSize)
  }, [selectedSize, product.sizes])
  const displaySpecs = product.specs.length > 0 ? product.specs : fallbackSpecs
  const availablePairs = totalStock(product.sizes)
  const maxStock = selectedSizeObj?.stock ?? 0
  const hasAvailableStock = availablePairs > 0
  const priceValue = product.price == null ? null : Number(product.price)
  const hasPrice = priceValue != null && Number.isFinite(priceValue)
  const formattedPrice = hasPrice ? formatCurrency(product.price) : null
  const canRequestAddToCart = Boolean(
    selectedSizeObj && selectedSizeObj.stock > 0 && quantity <= maxStock
  )

  const stockMessage = !hasAvailableStock
    ? "คู่นี้สินค้าหมดชั่วคราว"
    : selectedSizeObj
      ? `เหลือ ${selectedSizeObj.stock} คู่ในไซซ์ ${selectedSizeObj.size}`
      : "เลือกไซซ์ที่ยังมีสินค้า"

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSizeObj) {
      toast.error("กรุณาเลือกไซซ์ก่อน")
      return
    }

    if (selectedSizeObj.stock <= 0) {
      toast.error("ไซซ์ที่เลือกสินค้าหมด")
      return
    }

    if (!hasPrice || priceValue == null) {
      toast.error("ยังไม่มีราคาสินค้า")
      return
    }

    if (quantity > selectedSizeObj.stock) {
      toast.error("Stock ไม่เพียงพอ")
      return
    }

    addItem({
      shoeId: product.id,
      name: product.name,
      price: priceValue,
      image: product.images[0]?.url ?? "",
      size: selectedSize,
      quantity,
      maxStock: selectedSizeObj.stock,
    })

    toast.success("เพิ่มลงตะกร้าแล้ว")
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/product"
            className={`text-sm ${uiAction.ghost}`}
          >
            <AppLogo compact subLabel="กลับไป Store" />
          </Link>

          <Link
            href="/cart"
            className={`px-5 py-2.5 text-sm ${uiAction.surface}`}
          >
            ดูตะกร้า
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_440px] lg:items-start">
          <div className="space-y-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-white">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                <span className="rounded-full border border-black bg-[#d8ff6a] px-4 py-2 text-xs font-semibold text-black">
                  {productMeta.badge}
                </span>
                <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-black/65">
                  {productMeta.category}
                </span>
              </div>

              <MotionImage
                key={activeImage}
                src={normalizeImagePath(activeImage)}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 780px"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="object-contain p-10 md:p-16"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {product.images.map((image) => {
                  const isActive = activeImage === image.url

                  return (
                    <button
                      key={image.id}
                      onClick={() => setActiveImage(image.url)}
                      className={`relative aspect-square overflow-hidden rounded-lg border bg-white transition ${
                        isActive
                          ? "border-black bg-[#d8ff6a]"
                          : "border-black/10 hover:border-black/30 hover:bg-[#f8f7f3]"
                      }`}
                      aria-label={`ดูรูป ${product.name}`}
                    >
                      <Image
                        src={normalizeImagePath(image.url)}
                        alt={`${product.name} thumbnail`}
                        fill
                        sizes="160px"
                        className="object-contain p-4"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-black/10 bg-white p-6 lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm text-black/50">
                  {product.brand.name}
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-[0.95] md:text-5xl">
                  {product.name}
                </h1>
              </div>
              <FavoriteButton
                shoeId={product.id}
                initialFavorited={isFavorited}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-black/55">
              <span className="inline-flex items-center gap-1">
                <Star size={16} className="fill-black text-black" />
                {productMeta.rating} ({productMeta.reviews})
              </span>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <span>{productMeta.delivery}</span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-y border-black/10 py-5">
              <div>
                <p className="text-sm text-black/60">ราคา</p>
                <p className="mt-1 text-3xl font-semibold">
                  {formattedPrice ?? "ยังไม่มีราคา"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className={hasAvailableStock ? "text-black/60" : "text-red-600"}>
                  {availabilityLabel(product.sizes)}
                </p>
                <p className="mt-1 text-black/60">
                  ทั้งหมด {availablePairs} คู่
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-black/60">
              {product.description}
            </p>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">เลือกไซซ์</p>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className={`text-sm ${uiAction.ghost}`}
                >
                  <Ruler size={15} />
                  ตารางไซซ์
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isActive = selectedSize === size.size
                  const isOutOfStock = size.stock <= 0

                  return (
                    <button
                      key={size.id}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(size.size)
                        setQuantity(1)
                      }}
                      className={`${filterActionClass({
                        active: isActive,
                        className: "min-h-[72px] flex-col items-start justify-center px-3 py-3 text-left font-medium",
                      })} ${
                        isOutOfStock
                          ? "cursor-not-allowed border-black/10 bg-white text-black/35 opacity-100 hover:border-black/10 hover:bg-white hover:text-black/35"
                          : ""
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {size.size}
                      </span>
                      <span className="mt-1 block text-xs opacity-70">
                        {isOutOfStock ? "หมด" : `เหลือ ${size.stock}`}
                      </span>
                    </button>
                  )
                })}
              </div>

              <p className={`mt-3 text-sm ${hasAvailableStock ? "text-black/50" : "text-red-600"}`}>
                {stockMessage}
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center justify-between rounded-full bg-[#f4f3ef] p-1 sm:w-36">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-black/10 disabled:cursor-not-allowed disabled:text-black/45"
                  aria-label="ลดจำนวนสินค้า"
                >
                  -
                </button>
                <span className="text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  disabled={!selectedSizeObj || quantity >= maxStock}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-black/10 disabled:cursor-not-allowed disabled:text-black/45"
                  aria-label="เพิ่มจำนวนสินค้า"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canRequestAddToCart}
                className={`h-12 flex-1 px-6 text-sm font-semibold ${uiAction.accent}`}
              >
                {hasAvailableStock ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
              </button>
            </div>

            {selectedSizeObj && (
              <p className="mt-3 text-xs text-black/60">
                เลือกได้สูงสุด {selectedSizeObj.stock} คู่สำหรับไซซ์ {selectedSizeObj.size}
              </p>
            )}

            <div className="mt-7 grid grid-cols-2 gap-2">
              {trustItems.map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 rounded-lg bg-[#f4f3ef] px-3 py-3 text-xs text-black/60"
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-black/10 bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold">รายละเอียดสินค้า</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
              {product.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {displaySpecs.map((spec) => (
                <div key={spec.id} className="rounded-lg bg-[#f4f3ef] p-4">
                  <p className="text-xs text-black/60">
                    {spec.label}
                  </p>
                  <p className="mt-2 font-medium">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6">
            <h2 className="text-xl font-semibold">ภาพรวม Stock</h2>
            <div className="mt-5 space-y-3">
              {product.sizes.map((size) => (
                <div key={size.id} className="flex items-center justify-between text-sm">
                  <span className="text-black/60">ไซซ์ {size.size}</span>
                  <span className={size.stock > 0 ? "font-medium" : "text-red-600"}>
                    {size.stock > 0 ? `${size.stock} คู่` : "หมด"}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/product"
              className={`mt-6 w-full px-5 py-3 text-sm font-medium ${uiAction.surface}`}
            >
              เลือกดูสินค้าต่อ
            </Link>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">คู่ที่อาจเข้ากับคุณ</h2>
                <p className="mt-2 text-sm text-black/55">
                  แนะนำจากแบรนด์ หมวดหมู่ ราคา และ Stock ที่ใกล้เคียงกับคู่นี้
                </p>
              </div>
              <Link href="/product" className={`text-sm ${uiAction.ghost}`}>
                ดูทั้งหมด
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendations.map((item) => {
                const stock = totalStock(item.sizes)

                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    className="group rounded-lg border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f4f3ef]">
                      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                          {item.meta.badge}
                        </span>
                      </div>
                      <Image
                        src={normalizeImagePath(item.images[0]?.url)}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 280px"
                        className="object-contain p-7 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-black/55">{item.brand.name}</p>
                      <h3 className="mt-1 min-h-12 text-base font-semibold leading-tight">
                        {item.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold">
                          {formatCurrency(item.price)}
                        </span>
                        <span className={stock > 0 ? "text-black/55" : "text-red-600"}>
                          {availabilityLabel(item.sizes)}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <FloatingCartButton />
      </div>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
            >
              <div
                onClick={(event) => event.stopPropagation()}
                className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-black/10 bg-white p-8 shadow-2xl"
              >
                <div className="mb-8 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    ตารางไซซ์
                  </h2>

                  <button
                    onClick={() => setIsSizeGuideOpen(false)}
                    className={`text-sm ${uiAction.ghost}`}
                  >
                    ปิด
                  </button>
                </div>

                <SizeChart brand={product.brand.name} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
