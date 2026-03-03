"use client"

import { useState, useMemo } from "react"
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

const MotionImage = motion(Image)

export default function ProductDetail({ product, isFavorited }: Props) {
  const [activeImage, setActiveImage] = useState(
    product.images[0]?.url ?? ""
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const selectedSizeObj = useMemo(() => {
    return product.sizes.find((s) => s.size === selectedSize)
  }, [selectedSize, product.sizes])

  const maxStock = selectedSizeObj?.stock ?? 1

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(product.price))
      : null

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Select size first")
      return
    }

    if (!product.price) return

    if (quantity > maxStock) {
      toast.error("Not enough stock")
      return
    }

    addItem({
      shoeId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0]?.url ?? "",
      size: selectedSize,
      quantity,
    })

    toast.success("Added to cart")
  }

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
                  alt={`${product.name} thumbnail`}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 bg-white rounded-3xl border border-black/10 p-12 flex items-center justify-center">
            {activeImage && (
              <MotionImage
                key={activeImage}
                src={normalizeImagePath(activeImage)}
                alt={product.name}
                width={800}
                height={800}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="max-h-[500px] object-contain"
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
                const isOutOfStock = size.stock === 0

                return (
                  <button
                    key={size.id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(size.size)
                      setQuantity(1)
                    }}
                    className={`
                      px-6 py-2 rounded-full border text-sm transition
                      ${isActive
                        ? "bg-black text-white border-black"
                        : "bg-white border-black/20 hover:border-black"
                      }
                      ${isOutOfStock ? "opacity-30 cursor-not-allowed" : ""}
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
            className="mt-4 mb-10 text-xs uppercase tracking-widest text-black/40 hover:text-black transition"
          >
            Size Guide
          </button>

          {/* Quantity + CTA */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center bg-black/5 rounded-full p-1">

              {/* Minus */}
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 disabled:opacity-30"
              >
                −
              </button>

              <span className="w-12 text-center text-sm font-medium">
                {quantity}
              </span>

              {/* Plus */}
              <button
                onClick={() =>
                  setQuantity(Math.min(maxStock, quantity + 1))
                }
                disabled={quantity >= maxStock}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-90 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 rounded-full text-sm uppercase tracking-widest hover:bg-black/80 transition"
            >
              Add to Cart
            </button>
          </div>

          <p className="text-xs text-black/40 mb-8">
            Free shipping this week.
          </p>
        </div>
      </div>

      {/* Floating Cart */}
      <div className="fixed bottom-8 right-8 z-50">
        <FloatingCartButton />
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl bg-white border border-black/10 rounded-3xl p-10 shadow-2xl max-h-[80vh] overflow-y-auto"
              >
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

                <SizeChart brand={product.brand.name} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}