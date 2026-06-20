"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  PackageCheck,
  ShieldCheck,
} from "lucide-react"
import AppLogo from "@/app/component/ui/AppLogo"
import { uiAction } from "@/lib/ui-interactions"

const features = [
  {
    title: "Curated product paths",
    description:
      "Shoppers can move from store filters to product detail without losing price, size, and stock context.",
    icon: BadgeCheck,
  },
  {
    title: "Size stock is visible",
    description:
      "Availability is tied to real size rows, so every add-to-cart choice has a clear stock signal.",
    icon: Boxes,
  },
  {
    title: "Checkout uses database truth",
    description:
      "Order totals come from saved product prices, with stock decrement handled inside the order transaction.",
    icon: ShieldCheck,
  },
  {
    title: "Orders stay reviewable",
    description:
      "Each order keeps size, quantity, price snapshot, and address details for a cleaner member history.",
    icon: PackageCheck,
  },
]

const proofPoints = [
  "Audience filters",
  "Saved addresses",
  "Protected checkout",
  "Order history",
]

export default function FeatureSection() {
  const prefersReducedMotion = useReducedMotion()

  const entrance = {
    initial: prefersReducedMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: {
      duration: prefersReducedMotion ? 0 : 0.36,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }

  return (
    <section className="bg-[#f4f3ef] px-6 py-24 text-black md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-start">
          <motion.div {...entrance} className="lg:sticky lg:top-24">
            <AppLogo subLabel="Commerce system" />

            <h2 className="mt-8 max-w-2xl text-4xl font-semibold leading-[0.95] md:text-6xl">
              Built like a vault. Ready like a shop.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-black/65 md:text-lg">
              Kicks Vault now connects the front-of-store experience with the working parts shoppers expect: filters, size stock, protected checkout, saved addresses, and order history.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {proofPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/product"
                className={`px-6 py-3 text-sm font-semibold ${uiAction.accent}`}
              >
                Browse products
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/account/orders"
                className={`px-6 py-3 text-sm font-medium ${uiAction.surface}`}
              >
                View orders
              </Link>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="rounded-lg bg-black p-5 text-white md:p-7">
              <p className="text-sm font-medium text-white/65">
                Store readiness
              </p>
              <div className="mt-5 grid border-t border-white/12 sm:grid-cols-3 sm:divide-x sm:divide-white/12">
                <SystemStat label="Stock" value="Live" />
                <SystemStat label="Checkout" value="Guarded" />
                <SystemStat label="Orders" value="Saved" />
              </div>
            </div>

            <div className="divide-y divide-black/10 rounded-lg border border-black/10 bg-white p-4 shadow-sm md:p-5">
              {features.map((feature, index) => {
                const Icon = feature.icon

                return (
                  <motion.div
                    key={feature.title}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{
                      delay: prefersReducedMotion ? 0 : index * 0.04,
                      duration: prefersReducedMotion ? 0 : 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="grid gap-4 py-5 first:pt-2 last:pb-2 sm:grid-cols-[44px_1fr] sm:items-start"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#f8f7f3] text-black/70">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {feature.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/62">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SystemStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="py-4 sm:px-4">
      <p className="text-xs text-white/55">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}
