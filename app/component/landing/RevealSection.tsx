"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function RevealSection() {

  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // image scale animation
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1])

  // clip animation
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "inset(40% 40% 40% 40%)",
      "inset(0% 0% 0% 0%)"
    ]
  )

  // text animations
  const leftX = useTransform(scrollYProgress, [0, 1], [-200, 0])
  const rightX = useTransform(scrollYProgress, [0, 1], [200, 0])

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (

    <section
      ref={ref}
      className="
        h-[200vh]
        relative
        bg-black
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >

      {/* sticky container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">

        {/* IMAGE */}
        <motion.img
          src="/images/shoes/login.jpg"
          style={{
            scale,
            clipPath,
          }}
          className="
            absolute
            w-[600px]
            rounded-2xl
            shadow-2xl
          "
        />

        {/* LEFT TEXT */}
        <motion.h2
          style={{
            x: leftX,
            opacity,
          }}
          className="
            absolute
            left-20
            text-white
            text-7xl
            font-bold
            font-(--font-bebas)
            tracking-widest
          "
        >
          ENTER
        </motion.h2>


        {/* RIGHT TEXT */}
        <motion.h2
          style={{
            x: rightX,
            opacity,
          }}
          className="
            absolute
            right-20
            text-white
            text-7xl
            font-bold
            font-[var(--font-bebas)]
            tracking-widest
          "
        >
          VAULT
        </motion.h2>

      </div>

    </section>

  )
}
