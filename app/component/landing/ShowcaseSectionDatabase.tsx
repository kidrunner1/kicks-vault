"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Shoe, Brand, ShoeImage, ShoeSpec } from "@prisma/client"

type ShoeWithRelations = Shoe & {
  brand: Brand
  images: ShoeImage[]
  specs: ShoeSpec[]
  price: string | null
}

interface Props {
  shoes: (Omit<ShoeWithRelations, "price"> & {
    price: string | null
  })[]
}

export default function ShowcaseSlider({ shoes }: Props) {
  const [index, setIndex] = useState(0)

  const next = () => {
    setIndex((prev) => (prev + 1) % shoes.length)
  }

  const prev = () => {
    setIndex((prev) => (prev - 1 + shoes.length) % shoes.length)
  }

  const shoe = shoes[index]

  return (
    <section className="relative h-screen bg-black text-white overflow-hidden">

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={shoe.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center px-6 md:px-16"
        >

          <Link
            href={`/product/${shoe.slug}`}
            className="flex flex-col md:flex-row items-center gap-10 md:gap-24 group"
          >

            {/* Image */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-[260px] sm:w-[340px] md:w-[500px] flex justify-center"
            >
              <img
                src={shoe.images[0]?.url}
                alt={shoe.name}
                className="object-contain drop-shadow-[0_80px_120px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Text */}
            <div className="max-w-md md:max-w-xl text-center md:text-left">

              <p className="uppercase tracking-[0.4em] text-xs text-neutral-500 mb-4">
                {shoe.brand.name}
              </p>

              <h2 className="text-4xl sm:text-5xl md:text-[6rem] leading-[0.9] font-(--font-bebas) tracking-tight mb-6">
                {shoe.name}
              </h2>

              <div className="w-16 h-px bg-neutral-700 mb-6 mx-auto md:mx-0" />

              <p className="text-neutral-400 leading-relaxed text-sm md:text-lg">
                {shoe.description}
              </p>

            </div>

          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 border border-white/20 rounded-full hover:bg-white/10 transition"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 border border-white/20 rounded-full hover:bg-white/10 transition"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {shoes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index
                ? "w-8 bg-white"
                : "w-2 bg-white/40"
              }`}
          />
        ))}
      </div>

    </section>
  )
}