"use client"
import { useState } from "react"
import { useCartStore } from "@/app/store/cart-store"
import { AnimatePresence, motion } from "framer-motion"
import ProductGallery from "./ProductGallery"
import { toast } from "sonner"
import SizeChart from "../ui/SizeChart"
import FloatingCartButton from "../cart/FloatingCartButton"
import FavoriteButton from "../ui/FavoriteButton"

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
  isFavorited: boolean
}

export default function ProductDetail({ product, isFavorited }: Props) {
  const formattedPrice =
    product.price != null
      ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(product.price))
      : null

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false)

  const addItem = useCartStore(state => state.addItem)

  return (
    <main className="relative min-h-screen bg-black text-white pt-40 pb-40 px-8 overflow-hidden">
      {/* Noise Background */}
      <div
        className="
    pointer-events-none
    absolute inset-0
    z-0
    opacity-[0.20]
    bg-[url('/images/noise.jpg')]
    bg-repeat
  "
      />


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
          <div className="flex items-start justify-between gap-6 mb-8">

            <h1 className="
    text-5xl md:text-6xl
    leading-[1.1]
    tracking-tight
  ">
              {product.name}
            </h1>

            <FavoriteButton
              shoeId={product.id}
              initialFavorited={isFavorited}
            />

          </div>

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
          <div className="
  mb-16
  border border-white/10
  bg-white/2
  rounded-3xl
  p-10
  space-y-8
">

            <div className="flex justify-between items-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Select Size
              </p>

              {selectedSize && (
                <span className="text-xs text-white/50">
                  Selected: {selectedSize}
                </span>
              )}
            </div>

            {/* SIZE BUTTONS */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">

              {product.sizes.map(size => {

                const isOut = size.stock === 0
                const isLow = size.stock > 0 && size.stock <= 3
                const isActive = selectedSize === size.size

                return (
                  <motion.button
                    key={size.id}
                    disabled={isOut}
                    onClick={() => setSelectedSize(size.size)}
                    whileTap={{ scale: 0.96 }}
                    className={`
            relative
            py-4
            border
            rounded-xl
            text-sm
            transition-all
            duration-300

            ${isOut
                        ? "border-white/5 text-white/20 cursor-not-allowed bg-white/1"
                        : "border-white/20 hover:border-white/40 hover:bg-white/5"
                      }

            ${isActive
                        ? "bg-white text-black border-white"
                        : ""
                      }
          `}
                  >
                    {size.size}

                    {/* Low Stock Indicator */}
                    {isLow && !isOut && (
                      <span className="
              absolute
              -bottom-10
              left-1/2
              -translate-x-1/2
              text-[10px]
              text-red-400
              tracking-wide
            ">
                        Only {size.stock} left
                      </span>
                    )}
                  </motion.button>
                )
              })}

            </div>

            {/* OUT OF STOCK MESSAGE */}
            {!product.sizes.some(s => s.stock > 0) && (
              <p className="text-sm text-red-400">
                Currently out of stock
              </p>
            )}

            {/* Size Guide */}
            <button
              type="button"
              onClick={() => setIsSizeModalOpen(true)}
              className="
      relative
      text-xs
      uppercase
      tracking-[0.25em]
      text-white/40
      hover:text-white
      transition
      after:absolute
      after:left-0
      after:-bottom-1
      after:h-px
      after:w-full
      after:bg-white/30
    "
            >
              Size Guide
            </button>

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
            className="relative overflow-hidden border border-white/20 px-10 py-4 rounded-full uppercase tracking-widest text-sm transition  duration-500
     hover:bg-white hover:text-black">
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
      <AnimatePresence>
        {isSizeModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsSizeModalOpen(false)}
              className=" fixed inset-0 bg-black/70 backdrop-blur-sm  z-50 " />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          px-6
        "
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="
            w-full
            max-w-3xl
            max-h-[80vh]
            overflow-y-auto
            bg-black
            border border-white/10
            rounded-3xl
            p-10
            shadow-2xl
          "
              >
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl tracking-tight">
                    Size Guide
                  </h2>

                  <button
                    onClick={() => setIsSizeModalOpen(false)}
                    className="
                text-white/40
                hover:text-white
                transition
              "
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
      <FloatingCartButton />
    </main>
  )
}
