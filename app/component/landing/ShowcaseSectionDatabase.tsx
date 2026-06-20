"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight, PackageCheck } from "lucide-react"
import {
  availabilityLabel,
  formatCurrency,
  normalizeStockRows,
  totalStock,
} from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { uiAction } from "@/lib/ui-interactions"

type ShowcaseShoe = {
  id: string
  name: string
  slug: string
  description: string
  price: string | null
  brand: {
    name: string
  }
  images: {
    id: string
    url: string
    order: number
  }[]
  sizes: {
    id: string
    size: string
    stock: number
  }[]
  specs: {
    id: string
    label: string
    value: string
  }[]
}

interface Props {
  shoes: ShowcaseShoe[]
}

export default function ShowcaseSlider({ shoes }: Props) {
  const [index, setIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  if (shoes.length === 0) {
    return (
      <section className="bg-[#f4f3ef] px-6 py-24 text-black md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl rounded-lg border border-black/10 bg-white p-8 md:p-12">
          <PackageCheck size={28} />
          <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            The featured rotation is being prepared.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-black/62">
            Add shoes from the admin area and they will appear here with images,
            prices, and size availability.
          </p>
          <Link
            href="/admin/shoes"
            className={`mt-8 px-6 py-3 text-sm font-semibold ${uiAction.accent}`}
          >
            Manage products
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    )
  }

  const safeIndex = Math.min(index, shoes.length - 1)
  const shoe = shoes[safeIndex]
  const stockRows = normalizeStockRows(shoe.sizes)
  const availableSizes = stockRows.filter((row) => row.stock > 0).slice(0, 5)
  const stockTotal = totalStock(stockRows)
  const featuredSpecs = shoe.specs.slice(0, 2)

  const next = () => {
    setIndex((prev) => (prev + 1) % shoes.length)
  }

  const prev = () => {
    setIndex((prev) => (prev - 1 + shoes.length) % shoes.length)
  }

  return (
    <section className="relative overflow-hidden bg-[#f4f3ef] px-6 py-24 text-black md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] md:text-6xl">
              Store rotation, ready to inspect.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-black/62">
              Featured pairs now carry the same product signals as the shop:
              brand, price, size stock, and a direct path to detail.
            </p>
          </div>

          <Link
            href="/product"
            className={`shrink-0 px-6 py-3 text-sm font-semibold ${uiAction.surface}`}
          >
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-black/10 bg-black text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={shoe.id}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -50 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="grid min-h-[720px] gap-8 px-6 py-12 md:px-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center lg:px-16"
          >
            <div className="flex min-h-[300px] items-center justify-center lg:min-h-[520px]">
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                className="relative flex h-[300px] w-full max-w-[620px] items-center justify-center sm:h-[380px] lg:h-[520px]"
              >
                <Image
                  src={normalizeImagePath(shoe.images[0]?.url)}
                  alt={shoe.name}
                  fill
                  priority={safeIndex === 0}
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="object-contain drop-shadow-2xl"
                />
              </motion.div>
            </div>

            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white/72">
                  {shoe.brand.name}
                </span>
                <span className="rounded-full border border-white/12 bg-white px-4 py-2 text-sm font-semibold text-black">
                  {formatCurrency(shoe.price)}
                </span>
              </div>

              <h3 className="mt-6 text-4xl font-semibold leading-[0.95] sm:text-5xl md:text-6xl">
                {shoe.name}
              </h3>

              <p className="mt-5 text-base leading-8 text-white/66">
                {shoe.description}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                  <p className="text-sm text-white/55">Availability</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {availabilityLabel(stockRows)}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    {stockTotal === 0 ? "No size available" : `${stockTotal} pairs across sizes`}
                  </p>
                </div>

                <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                  <p className="text-sm text-white/55">Sizes ready</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableSizes.length > 0 ? (
                      availableSizes.map((row) => (
                        <span
                          key={row.size}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black"
                        >
                          {row.size}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-white/65">
                        Restock needed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {featuredSpecs.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {featuredSpecs.map((spec) => (
                    <div
                      key={spec.id}
                      className="border-t border-white/12 pt-4"
                    >
                      <p className="text-sm text-white/48">{spec.label}</p>
                      <p className="mt-1 text-sm font-medium text-white/82">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/product/${shoe.slug}`}
                  className={`px-6 py-3 text-sm font-semibold ${uiAction.accent}`}
                >
                  View featured pair
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/product"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Compare more
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-4 border-t border-white/12 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous featured product"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white transition hover:border-white/35 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next featured product"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white transition hover:border-white/35 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {shoes.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                aria-label={`Show ${item.name}`}
                aria-current={itemIndex === safeIndex}
                className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  itemIndex === safeIndex
                    ? "w-8 bg-[#d8ff6a]"
                    : "w-2 bg-white/35 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
