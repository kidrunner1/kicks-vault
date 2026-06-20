"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight,
  ClipboardCheck,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react"
import { useRef } from "react"
import { JSX } from "react/jsx-runtime"
import { uiAction } from "@/lib/ui-interactions"

const flowSteps = [
  {
    title: "Stock is part of the story",
    description:
      "Product pages show available sizes before the shopper commits to cart.",
    icon: PackageCheck,
  },
  {
    title: "Checkout stays guarded",
    description:
      "Protected routes keep account, address, and order flows behind login.",
    icon: ShieldCheck,
  },
  {
    title: "Addresses are reusable",
    description:
      "Saved delivery profiles make the next order faster without hiding required fields.",
    icon: MapPin,
  },
  {
    title: "Orders remain traceable",
    description:
      "History keeps item snapshots, quantities, sizes, and shipping details available after checkout.",
    icon: ClipboardCheck,
  },
]

export default function CinematicSection(): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -40])
  const imageScale = useTransform(scrollYProgress, [0, 1], [0.96, 1.04])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-black px-6 py-24 text-white md:px-12 lg:px-20"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
        <motion.div
          style={prefersReducedMotion ? undefined : { y: imageY, scale: imageScale }}
          className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/12 bg-white/[0.03] md:min-h-[520px]"
        >
          <Image
            src="/images/shoes/nike-02.jpg"
            alt="White and black sneaker featured in the Kicks Vault archive"
            fill
            sizes="(max-width: 1024px) 100vw, 56vw"
            className="object-contain p-8 md:p-12"
          />
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black px-4 py-2 text-sm font-medium text-white/72">
            Featured archive pair
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="lg:pl-6"
        >
          <h2 className="max-w-xl text-4xl font-semibold leading-[0.95] md:text-6xl">
            A cleaner path from pair to delivery.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/68 md:text-lg">
            The landing page now points shoppers toward the real store flow:
            browse the drop, inspect stock, choose an address, and keep the
            order visible after checkout.
          </p>

          <div className="mt-8 divide-y divide-white/12 border-y border-white/12">
            {flowSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : index * 0.04,
                    duration: prefersReducedMotion ? 0 : 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="grid gap-4 py-5 sm:grid-cols-[44px_1fr]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white text-black">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/product"
              className={`px-6 py-3 text-sm font-semibold ${uiAction.accent}`}
            >
              Shop the rotation
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/account/addresses"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Manage addresses
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
