"use client"

import { motion } from "framer-motion"

export default function IntroSection() {

  return (

    <section className="
      h-screen
      flex
      items-center
      justify-center
      bg-white
    ">

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center max-w-xl"
      >

        <h2 className="text-5xl font-bold text-gray-900">
          Explore the Vault
        </h2>

        <p className="mt-6 text-gray-600 text-lg">
          KicksVault is your gateway to discover iconic sneakers,
          curated collections, and the most sought-after designs.
        </p>

      </motion.div>

    </section>

  )
}
