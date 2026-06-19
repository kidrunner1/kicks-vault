"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCartStore } from "@/app/store/cart-store"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import {
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
import FloatingCartButton from "../cart/FloatingCartButton"
import SizeChart from "../ui/SizeChart"
import FavoriteButton from "../ui/FavoriteButton"

interface ProductSpec {
  id: string
  label: string
  value: string
}

interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: string | null
  brand: { name: string }
  images: { id: string; url: string }[]
  specs: ProductSpec[]
  sizes: { id: string; size: string; stock: number }[]
}

interface Props {
  product: Product
  isFavorited: boolean
}

const MotionImage = motion(Image)

const trustItems = [
  {
    label: "Secure checkout",
    icon: ShieldCheck,
  },
  {
    label: "Fast dispatch",
    icon: Truck,
  },
  {
    label: "Size stock verified",
    icon: Check,
  },
  {
    label: "Order history saved",
    icon: PackageCheck,
  },
]

const fallbackSpecs = [
  { id: "style", label: "Style", value: "Lifestyle" },
  { id: "cushion", label: "Cushion", value: "Comfort foam" },
  { id: "upper", label: "Upper", value: "Mixed textile" },
  { id: "fit", label: "Fit", value: "True to size" },
]

function buildProductMeta(product: Product) {
  const name = product.name.toLowerCase()
  const brand = product.brand.name.toLowerCase()
  const category = name.includes("jordan")
    ? "Basketball"
    : name.includes("sk8") || name.includes("skool") || name.includes("dunk")
      ? "Skate"
      : brand.includes("adidas") || name.includes("pegasus") || name.includes("gel")
        ? "Running"
        : name.includes("kids")
          ? "Kids"
          : "Lifestyle"

  const ratingSeed = product.slug.length % 4

  return {
    category,
    badge: totalStock(product.sizes) <= 3 ? "Limited Stock" : "Verified Drop",
    rating: (4.6 + ratingSeed * 0.1).toFixed(1),
    reviews: 68 + product.slug.length * 7,
    delivery: category === "Kids" ? "Family sizing ready" : "Ships in 24h",
  }
}

export default function ProductDetail({ product, isFavorited }: Props) {
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

  const productMeta = useMemo(() => buildProductMeta(product), [product])
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
    ? "This pair is currently out of stock."
    : selectedSizeObj
      ? `${selectedSizeObj.stock} available in size ${selectedSizeObj.size}`
      : "Select an available size."

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSizeObj) {
      toast.error("Select size first")
      return
    }

    if (selectedSizeObj.stock <= 0) {
      toast.error("Selected size is out of stock")
      return
    }

    if (!hasPrice || priceValue == null) {
      toast.error("Price is unavailable")
      return
    }

    if (quantity > selectedSizeObj.stock) {
      toast.error("Not enough stock")
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

    toast.success("Added to cart")
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/product"
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
                Back to Store
              </span>
            </span>
          </Link>

          <Link
            href="/cart"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm text-black/60 transition hover:border-black/25 hover:text-black"
          >
            View cart
          </Link>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_440px] lg:items-start">
          <div className="space-y-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-white">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                <span className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white">
                  {productMeta.badge}
                </span>
                <span className="rounded-full bg-[#f4f3ef] px-4 py-2 text-xs text-black/60">
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
                          ? "border-black"
                          : "border-black/10 hover:border-black/30"
                      }`}
                      aria-label={`View ${product.name} image`}
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
                <p className="text-sm text-black/45">Price</p>
                <p className="mt-1 text-3xl font-semibold">
                  {formattedPrice ?? "Price unavailable"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className={hasAvailableStock ? "text-black/60" : "text-red-600"}>
                  {availabilityLabel(product.sizes)}
                </p>
                <p className="mt-1 text-black/40">
                  {availablePairs} total pairs
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-black/60">
              {product.description}
            </p>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">Select size</p>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-sm text-black/45 transition hover:text-black"
                >
                  <Ruler size={15} />
                  Size guide
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
                      className={`rounded-lg border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-[#f4f3ef] text-black hover:border-black/30"
                      } ${isOutOfStock ? "cursor-not-allowed opacity-35" : ""}`}
                    >
                      <span className="block text-sm font-semibold">
                        {size.size}
                      </span>
                      <span className="mt-1 block text-xs opacity-70">
                        {isOutOfStock ? "Sold out" : `${size.stock} left`}
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
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10 disabled:opacity-30"
                >
                  -
                </button>
                <span className="text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  disabled={!selectedSizeObj || quantity >= maxStock}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canRequestAddToCart}
                className={`h-12 flex-1 rounded-full bg-black px-6 text-sm font-medium text-white transition ${
                  canRequestAddToCart
                    ? "hover:bg-neutral-800"
                    : "cursor-not-allowed opacity-40"
                }`}
              >
                {hasAvailableStock ? "Add to cart" : "Out of stock"}
              </button>
            </div>

            {selectedSizeObj && (
              <p className="mt-3 text-xs text-black/45">
                Max {selectedSizeObj.stock} pairs available for size {selectedSizeObj.size}.
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
            <h2 className="text-2xl font-semibold">Product details</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
              {product.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {displaySpecs.map((spec) => (
                <div key={spec.id} className="rounded-lg bg-[#f4f3ef] p-4">
                  <p className="text-xs text-black/45">
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
            <h2 className="text-xl font-semibold">Stock snapshot</h2>
            <div className="mt-5 space-y-3">
              {product.sizes.map((size) => (
                <div key={size.id} className="flex items-center justify-between text-sm">
                  <span className="text-black/60">Size {size.size}</span>
                  <span className={size.stock > 0 ? "font-medium" : "text-red-600"}>
                    {size.stock > 0 ? `${size.stock} pairs` : "Sold out"}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/product"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-medium text-black/60 transition hover:border-black/30 hover:text-black"
            >
              Continue browsing
            </Link>
          </div>
        </section>
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
                    Size guide
                  </h2>

                  <button
                    onClick={() => setIsSizeGuideOpen(false)}
                    className="text-sm text-black/45 transition hover:text-black"
                  >
                    Close
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
