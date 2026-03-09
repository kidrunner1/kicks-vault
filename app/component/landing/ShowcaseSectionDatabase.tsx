"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Shoe, Brand, ShoeImage, ShoeSpec } from "@prisma/client"
import { normalizeImagePath } from "@/lib/image"

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

      <AnimatePresence mode="wait">

        <motion.div
          key={shoe.id}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center justify-center px-6 md:px-16"
        >

          <Link
            href={`/product/${shoe.slug}`}
            className="flex flex-col md:flex-row items-center gap-10 md:gap-24 group"
          >

            {/* IMAGE */}

            <motion.div
              whileHover={{ y: -8 }}
              className="w-65 sm:w-85 md:w-125 flex justify-center will-change-transform"
            >

              <Image
                src={normalizeImagePath(shoe.images[0]?.url)}
                alt={shoe.name}
                width={500}
                height={500}
                priority={index === 0}
                sizes="(max-width:768px) 80vw, 500px"
                className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
              />

            </motion.div>

            {/* TEXT */}

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

      {/* NAVIGATION */}

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

      {/* DOTS */}

      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3">

        {shoes.map((_, i) => (

          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2 bg-white/40"
              }`}
          />

        ))}

      </div>

    </section>
  )
}