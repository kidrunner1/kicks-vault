"use client"
import { useState } from "react"
import { useCartStore } from "@/app/store/cart-store"
import { motion } from "framer-motion"
import ProductGallery from "./ProductGallery"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description: string
  price: string | null
  brand: { name: string }
  images: { id: string; url: string }[]
  specs: { id: string; label: string; value: string }[]
  sizes: { id: string; size: string; stock: number }[]
}

interface Props {
  product: Product
}

export default function ProductDetail({ product }: Props) {

  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(product.price))
      : null

  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const addItem = useCartStore(state => state.addItem)


  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-40 px-8">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-28">

        {/* ================= LEFT — GALLERY ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <ProductGallery images={product.images} />
        </motion.div>


        {/* ================= RIGHT — INFO ================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="flex flex-col justify-center"
        >

          {/* Brand */}
          <p className="
            text-xs
            uppercase
            tracking-[0.4em]
            text-white/40
            mb-6
          ">
            {product.brand.name}
          </p>

          {/* Name */}
          <h1 className="
            text-5xl md:text-6xl
            leading-[1.1]
            tracking-tight
            mb-8
          ">
            {product.name}
          </h1>

          {/* Price */}
          {formattedPrice && (
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Price
              </p>
              <p className="text-3xl mt-2 font-medium">
                {formattedPrice}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="
            text-white/60
            leading-relaxed
            text-lg
            max-w-xl
            mb-16
          ">
            {product.description}
          </p>
          {/* ================= SIZE SELECTOR ================= */}
          <div className="mb-14">

            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
              Select Size
            </p>

            <div className="flex flex-wrap gap-4">

              {product.sizes.map(size => {

                const isOut = size.stock === 0
                const isActive = selectedSize === size.size
                const isLow = size.stock > 0 && size.stock <= 3

                return (
                  <button
                    key={size.id}
                    disabled={isOut}
                    onClick={() => setSelectedSize(size.size)}
                    className={`
            px-5 py-3
            border
            rounded-full
            text-sm
            tracking-wide
            transition
            duration-300

            ${isOut ? "border-white/10 text-white/20 cursor-not-allowed" : "border-white/20"}

            ${isActive ? "bg-white text-black" : ""}

            hover:bg-white hover:text-black
          `}
                  >
                    {size.size}
                  </button>
                )
              })}

            </div>

            {selectedSize && (
              <p className="text-xs text-white/40 mt-4">
                Selected size: {selectedSize}
              </p>
            )}

          </div>

          {/* CTA */}
          <button
            onClick={() => {

              if (!selectedSize) {
                toast.error("Please select a size")

                return
              }

              if (!product.price) return

              addItem({
                shoeId: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.images[0]?.url ?? "",
                size: selectedSize,
                quantity: 1
              })

              toast.success("Added to cart")
            }}
            className="
    relative
    overflow-hidden
    border
    border-white/20
    px-10 py-4
    rounded-full
    uppercase
    tracking-widest
    text-sm
    transition
    duration-500
    hover:bg-white
    hover:text-black
  "
          >
            Add to Collection
          </button>

          {/* Divider */}
          <div className="mt-20 border-t border-white/10 pt-12">

            <h3 className="
              text-sm
              uppercase
              tracking-[0.3em]
              text-white/40
              mb-10
            ">
              Specifications
            </h3>

            <div className="space-y-6">

              {product.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="
                    flex
                    justify-between
                    border-b
                    border-white/5
                    pb-4
                  "
                >
                  <span className="text-white/40">
                    {spec.label}
                  </span>

                  <span className="text-white/80">
                    {spec.value}
                  </span>
                </div>
              ))}

            </div>

          </div>

        </motion.div>

      </div>

    </main>
  )
}
