"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"

const Model3D = dynamic(
  () => import("../3D/Model3D"),
  { ssr: false }
)

export default function HeroSection() {

  return (
    <section
      className="
        relative
        h-screen
        overflow-hidden
        bg-neutral-100
      "
    >

      {/* Ambient Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/3 w-[800px] h-[800px] bg-white/60 blur-[200px] rounded-full" />
      </div>

      {/* TEXT BLOCK */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="
          absolute
          top-24
          left-6
          sm:left-10
          lg:left-20
          z-10
          max-w-sm
          sm:max-w-md
          lg:max-w-xl
        "
      >

        {/* Small Label */}
        <div className="
          uppercase
          tracking-[0.5em]
          text-xs
          text-neutral-500
          mb-6
        ">
          Premium Sneaker Archive
        </div>

        {/* Main Heading */}
        <h1 className="
          font-bold
          tracking-tight
          text-neutral-900
          leading-[0.9]

          text-5xl
          sm:text-6xl
          md:text-7xl
          lg:text-[5.5rem]
        ">
          KICKSVAULT
        </h1>

        {/* Divider */}
        <div className="w-20 h-[1px] bg-neutral-300 my-8" />

        {/* Tagline */}
        <p className="
          text-neutral-600
          leading-relaxed
          text-base
          sm:text-lg
        ">
          Discover the future of sneaker culture —
          curated silhouettes crafted for modern collectors.
        </p>

      </motion.div>

      {/* 3D Model (unchanged) */}
      <Model3D />

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="
          absolute
          bottom-10
          left-1/2
          -translate-x-1/2
          flex
          flex-col
          items-center
          text-neutral-500
          text-xs
          tracking-widest
        "
      >
        Scroll

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="w-[1px] h-8 bg-neutral-400 mt-2"
        />
      </motion.div>

    </section>
  )
}