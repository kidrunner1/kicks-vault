"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#f6f6f4] text-black">

      {/* =============================
          BACKGROUND DECORATION
      ============================= */}

      {/* =============================
    TOP LEFT — BACK TO LANDING
        ============================= */}

      <div className="absolute top-6 left-6 z-20">

        <Link href="/">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="
        flex items-center gap-3
        px-4 py-2
        rounded-full
        bg-white/60
        backdrop-blur-xl
        border border-black/5
        shadow-sm
        hover:bg-white/80
        transition
        cursor-pointer
      "
          >

            {/* Arrow */}
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
              className="text-sm"
            >
              ←
            </motion.span>

            {/* Brand */}
            <span className="text-sm font-medium tracking-wide">
              KICKS VAULT
            </span>

          </motion.div>

        </Link>

      </div>

      {/* Soft Gradient Base */}
      <div className="absolute inset-0 bg-linear-to-br from-[#f8f8f6] via-[#f3f3f1] to-[#ececea]" />

      {/* Radial Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-175 h-175 bg-white/40 blur-[140px] rounded-full" />

      <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-white/40 blur-[120px] rounded-full" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.4\"/></svg>')",
        }}
      />

      {/* =============================
          LEFT PANEL — BRANDING
      ============================= */}

      <div className="hidden lg:flex w-1/2 relative items-center justify-center px-20">

        <div className="relative max-w-xl">

          {/* Title Animation */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[5rem] leading-none font-semibold tracking-tight"
            >
              KICKS
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{
                duration: 1,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[5rem] leading-none font-semibold tracking-tight"
            >
              VAULT
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="h-0.5 bg-black/70 mt-10"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-gray-500 text-lg mt-8 max-w-md leading-relaxed"
          >
            A curated digital archive for modern sneaker collectors.
            Discover limited releases, timeless silhouettes,
            and the culture behind every pair.
          </motion.p>

        </div>

      </div>

      {/* =============================
          RIGHT PANEL — AUTH CARD
      ============================= */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="
          w-full lg:w-1/2
          flex items-center justify-center
          px-6 lg:px-20
        "
      >

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            w-full
            max-w-md
            bg-white/70
            backdrop-blur-xl
            border border-black/5
            rounded-2xl
            p-10
            shadow-[0_20px_60px_rgba(0,0,0,0.08)]
          "
        >
          {children}
        </motion.div>

      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Kicks Vault. All Rights Reserved
      </div>

    </div>
  )
}