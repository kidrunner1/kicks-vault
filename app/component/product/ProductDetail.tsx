"use client"

import { motion } from "framer-motion"
import ProductGallery from "./ProductGallery"

interface Product {
  id: string
  name: string
  description: string
  price: string | null
  brand: { name: string }
  images: { id: string; url: string }[]
  specs: { id: string; label: string; value: string }[]
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

          {/* CTA */}
          <button className="
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
          ">
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
