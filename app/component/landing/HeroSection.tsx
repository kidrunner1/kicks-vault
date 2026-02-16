"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"

const Model3D = dynamic(
  () => import("../3D/Model3D"),
  { ssr: false }
)

export default function HeroSection() {

  return (

    <section className="
      relative
      h-screen
      flex
      items-center
      justify-start
      overflow-hidden
      bg-gradient-to-b
      from-gray-200
      to-gray-300
    ">

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="
          absolute
          top-32
          ml-16
          text-center
          z-10
        "
      >

        <h1 className="
          text-6xl
          font-bold
          text-gray-900
        ">
          KicksVault
        </h1>

        <p className="
          text-gray-600
          mt-4
          text-lg
        ">
          Discover the future of sneaker culture
        </p>

      </motion.div>


      {/* 3D Model */}
      <Model3D />


    </section>

  )
}
