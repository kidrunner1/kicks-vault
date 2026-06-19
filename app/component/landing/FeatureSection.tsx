"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  BadgeCheck,
  Boxes,
  PackageCheck,
  ShieldCheck,
} from "lucide-react"

const features = [
  {
    title: "Curated drops",
    description: "New pairs are presented like an archive, with the product story and primary image up front.",
    icon: BadgeCheck,
  },
  {
    title: "Size stock shown",
    description: "Availability is tied to real size rows, so shoppers know what can actually be added to cart.",
    icon: Boxes,
  },
  {
    title: "Checkout guarded",
    description: "Order totals come from database prices and stock is deducted inside the order transaction.",
    icon: ShieldCheck,
  },
  {
    title: "Orders stay reviewable",
    description: "Each order keeps the size, quantity, and price snapshot for a clean purchase history.",
    icon: PackageCheck,
  },
]

const productImages = [
  {
    src: "/images/shoes/nike-02.jpg",
    alt: "Orange Nike sneaker shown as a featured archive pair",
  },
  {
    src: "/images/shoes/nike-03.jpg",
    alt: "Vintage Nike sneaker from the KicksVault collection",
  },
  {
    src: "/images/shoes/nike-04.jpg",
    alt: "Premium Nike sneaker photographed for product discovery",
  },
]

export default function FeatureSection() {
  return (
    <section className="bg-[#f4f3ef] px-6 py-24 text-neutral-950 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="mb-5 text-sm font-medium text-neutral-500">
            Built for real checkout flow
          </p>

          <h2 className="max-w-2xl text-4xl font-semibold leading-[0.95] text-wrap-balance md:text-6xl">
            A sneaker archive that is ready to sell, not just impress.
          </h2>

          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600 md:text-lg">
            KicksVault now connects product presentation with the practical pieces that make a shop usable: size stock, protected checkout, and readable order history.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/product"
              className="inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Browse products
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-black/35 hover:text-black"
            >
              View orders
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-3">
            {productImages.map((image, index) => (
              <motion.div
                key={image.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 30vw, 220px"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-lg border border-black/10 bg-white p-5"
                >
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
