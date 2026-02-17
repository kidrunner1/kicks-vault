"use client"

import { motion } from "framer-motion"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-black text-white overflow-hidden">

      {/* =========================
          LEFT — CINEMATIC PANEL
      ========================== */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center px-20">

        {/* Background Image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.3 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="
            relative z-10
            bg-[url('/images/shoes/logo.jpg')]
            bg-cover bg-center
          "
        />

        {/* Dark Gradient */}
        <div className="relative z-10 bg-gradient-to-b from-black/90 via-black/80 to-black" />

        {/* Grain Texture */}
        <div className="
          relative z-10
          bg-[url('/images/noise.jpg')]
          opacity-10
          mix-blend-overlay
          pointer-events-none
        " />

        {/* Light Sweep */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2.5,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="
            relative z-10
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
            blur-3xl
          "
        />

        {/* Branding */}
        <div className="relative z-10 max-w-lg">

          {/* Split Typography */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[6rem] leading-none uppercase tracking-tight"
            >
              KICKS
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[6rem] leading-none uppercase tracking-tight"
            >
              VAULT
            </motion.h1>
          </div>

          {/* Animated Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ duration: 1, delay: 1 }}
            className="h-[2px] bg-white mt-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="text-gray-400 text-lg mt-8 max-w-md leading-relaxed"
          >
            Enter a curated digital archive of modern sneaker culture.
            Designed for collectors who value presence.
          </motion.p>

        </div>

      </div>

      {/* =========================
          RIGHT — FORM PANEL
      ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="
          w-full lg:w-1/2
          flex items-center justify-center
          px-6 lg:px-20
          bg-white
          text-black
        "
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </motion.div>

    </div>
  )
}
