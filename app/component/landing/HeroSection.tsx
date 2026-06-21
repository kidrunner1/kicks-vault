"use client"

import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "framer-motion"
import { Skeleton } from "@/app/component/ui/Skeleton"

const Model3D = dynamic(
  () => import("../3D/Model3D"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
        <div className="relative h-[62vmin] w-[62vmin] max-w-[720px]">
          <Skeleton tone="soft" className="absolute inset-0 rounded-full" />
          <Skeleton tone="light" className="absolute left-1/2 top-1/2 h-24 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>
      </div>
    ),
  }
)

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative h-screen overflow-hidden bg-neutral-100 text-black">
      <Model3D />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="pointer-events-none absolute left-6 top-24 z-20 max-w-sm sm:left-10 sm:max-w-md lg:left-20 lg:max-w-xl"
      >
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.35em] text-neutral-500">
          Premium Sneaker Archive
        </p>

        <h1 className="text-5xl font-bold leading-[0.9] tracking-tight text-neutral-900 sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          KICKS VAULT
        </h1>

        <div className="my-8 h-px w-20 bg-neutral-300" />

        <p className="max-w-md text-base leading-8 text-neutral-600 sm:text-lg">
          คัด sneaker สำหรับนักสะสม พร้อมรายละเอียดสินค้า Stock ตามไซซ์
          และเส้นทางเข้าสู่ Store ที่ใช้งานง่ายขึ้น
        </p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 0.9,
          duration: prefersReducedMotion ? 0 : 0.35,
        }}
        className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-xs font-medium tracking-widest text-neutral-500"
      >
        เลื่อนลง

        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mt-2 h-8 w-px bg-neutral-400"
        />
      </motion.div>
    </section>
  )
}
