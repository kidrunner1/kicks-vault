"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function CTASection() {

  const router = useRouter()

  return (

    <section className="
      h-screen
      flex
      items-center
      justify-center
      bg-gray-900
      text-white
    ">

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-center"
      >

        <h2 className="text-5xl font-bold">
          Enter KicksVault
        </h2>

        <button
          onClick={() => router.push("/login")}
          className="
            mt-8
            bg-white
            text-black
            px-8 py-3
            rounded-xl
            hover:scale-105
            transition
          "
        >
          Get Started
        </button>

      </motion.div>

    </section>

  )
}
