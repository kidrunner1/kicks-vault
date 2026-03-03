"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCartStore } from "@/app/store/cart-store"
import { toast } from "sonner"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
import FloatingCartButton from "../cart/FloatingCartButton"
import SizeChart from "../ui/SizeChart"
import FavoriteButton from "../ui/FavoriteButton"

interface Product {
  id: string
  name: string
  description: string
  price: string | null
  brand: { name: string }
  images: { id: string; url: string }[]
  sizes: { id: string; size: string; stock: number }[]
}

interface Props {
  product: Product
  isFavorited: boolean
}

export const revalidate = 60

export default function ProductDetail({ product, isFavorited }: Props) {
  const [activeImage, setActiveImage] = useState(product.images[0]?.url)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(product.price))
      : null

  return (
    <main className="min-h-screen bg-[#f3f3f1] text-black pt-24 pb-32 px-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* ================= LEFT — GALLERY ================= */}
        <div className="flex gap-6">

          {/* Thumbnails */}
          <div className="flex flex-col gap-4">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className="w-20 h-20 bg-white rounded-xl border border-black/10 overflow-hidden"
              >
                <Image
                  src={normalizeImagePath(img.url)}
                  alt=""
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 bg-white rounded-3xl border border-black/10 p-12 flex items-center justify-center">
            {activeImage && (
              <motion.img
                key={activeImage}
                src={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-h-125 object-contain"
              />
            )}
          </div>

        </div>

        {/* ================= RIGHT — PRODUCT INFO ================= */}
        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-3">
            {product.brand.name}
          </p>

          <div className="flex items-start justify-between gap-6 mb-4">

            <h1 className="text-4xl font-semibold leading-tight">
              {product.name}
            </h1>

            <FavoriteButton
              shoeId={product.id}
              initialFavorited={isFavorited}
            />

          </div>

          {/* Rating Placeholder */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-sm text-black/50">214 reviews</span>
          </div>

          {/* Price */}
          {formattedPrice && (
            <div className="text-2xl font-semibold mb-6">
              {formattedPrice}
            </div>
          )}

          {/* Description */}
          <p className="text-black/60 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Size Selector */}
          <div className="mb-8">
            <p className="text-sm font-medium mb-3">Size</p>

            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((size) => {
                const isActive = selectedSize === size.size

                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.size)}
                    className={`
                      px-6 py-2
                      rounded-full
                      border
                      text-sm
                      transition
                      ${isActive
                        ? "bg-black text-white border-black"
                        : "bg-white border-black/20 hover:border-black"
                      }
                    `}
                  >
                    {size.size}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setIsSizeGuideOpen(true)}
            className="mt-4 mb-10 text-xs uppercase tracking-widest text-black/40 hover:text-black transition " >
            Size Guide
          </button>

          {/* Quantity + CTA */}
          <div className="flex items-center gap-4 mb-6">

            <div className="flex items-center bg-black/5 rounded-full p-1">

              {/* Minus */}
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="
      w-9 h-9
      flex items-center justify-center
      rounded-full
      text-lg
      transition
      hover:bg-black/10
      active:scale-90
      disabled:opacity-30
      disabled:cursor-not-allowed
    "
              >
                −
              </button>

              {/* Quantity */}
              <span className="w-12 text-center text-sm font-medium">
                {quantity}
              </span>

              {/* Plus */}
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="
      w-9 h-9
      flex items-center justify-center
      rounded-full
      text-lg
      transition
      hover:bg-black/10
      active:scale-90
    "
              >
                +
              </button>

            </div>

            <button
              onClick={() => {
                if (!selectedSize) {
                  toast.error("Select size first")
                  return
                }

                if (!product.price) return

                addItem({
                  shoeId: product.id,
                  name: product.name,
                  price: Number(product.price),
                  image: product.images[0]?.url ?? "",
                  size: selectedSize,
                  quantity,
                })

                toast.success("Added to cart")
              }}
              className="flex-1 bg-black text-white py-3 rounded-full text-sm uppercase tracking-widest hover:bg-black/80 transition"
            >
              Add to Cart
            </button>

          </div>

          <p className="text-xs text-black/40 mb-8">
            Free shipping this week.
          </p>

          {/* Feature Icons Row */}
          <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-8 text-sm text-black/60">
            <div>✔ Premium Materials</div>
            <div>✔ Limited Edition</div>
            <div>✔ Sustainable Packaging</div>
            <div>✔ Easy Returns</div>
          </div>

        </div>
      </div>

      {/* Detail Section */}
      <div className="max-w-4xl mx-auto mt-24 border-t border-black/10 pt-10">
        <h3 className="text-lg font-medium mb-4">Detail</h3>
        <p className="text-black/60 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Floating Cart */}
      <div className="fixed bottom-8 right-8 z-50">
        <FloatingCartButton />
      </div>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="
            w-full
            max-w-3xl
            bg-white
            text-black
            border
            border-black/10
            rounded-3xl
            p-10
            shadow-2xl
            max-h-[80vh]
            overflow-y-auto
          "
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold">
                    Size Guide
                  </h2>

                  <button
                    onClick={() => setIsSizeGuideOpen(false)}
                    className="text-black/40 hover:text-black transition"
                  >
                    Close
                  </button>
                </div>

                {/* Size Chart Component */}
                <SizeChart brand={product.brand.name} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}