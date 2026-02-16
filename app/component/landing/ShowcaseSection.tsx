"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring
} from "framer-motion"

import { useRef } from "react"
import { shoes } from "@/lib/shoes"
export default function ShowcaseSection() {

  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20
  })

  const x = useTransform(
    smooth,
    [0, 1],
    ["0%", "-300%"]
  )

  return (

    <section
      ref={ref}
      className="h-[400vh] bg-black relative"
    >

      <div className="sticky top-0 h-screen overflow-hidden">

        <motion.div
          style={{ x }}
          className="flex h-full items-center"
        >

          {shoes.map((shoe, i) => {

            const start = i * 0.25

            const opacity = useTransform(
              smooth,
              [start, start + 0.15],
              [0, 1]
            )

            const leftX = useTransform(
              smooth,
              [start, start + 0.15],
              [-100, 0]
            )

            const rightX = useTransform(
              smooth,
              [start, start + 0.15],
              [100, 0]
            )

            return (

              <div
                key={i}
                className="
                  min-w-screen
                  h-full
                  flex
                  items-center
                  justify-center
                  relative
                "
              >

                {/* LEFT DETAIL */}
                <motion.div
                  style={{
                    opacity,
                    x: leftX
                  }}
                  className="
                    absolute
                    left-20
                    max-w-md
                    text-white
                  "
                >

                  <div className="
                    font-[var(--font-orbitron)]
                    text-sm
                    text-gray-400
                  ">
                    {shoe.tag}
                  </div>

                  <h2 className="
                    font-[var(--font-bebas)]
                    text-6xl
                    tracking-wide
                  ">
                    {shoe.name}
                  </h2>

                  <p className="
                    mt-4
                    text-gray-300
                  ">
                    {shoe.description}
                  </p>

                </motion.div>


                {/* CENTER IMAGE */}
                <motion.img
                  src={shoe.image}
                  className="
                    w-[600px]
                    z-10
                    rounded-2xl
                  "
                  whileHover={{
                    scale: 1.05
                  }}
                />


                {/* RIGHT SPECS */}
                <motion.div
                  style={{
                    opacity,
                    x: rightX
                  }}
                  className="
                    absolute
                    right-20
                    text-white
                  "
                >

                  {shoe.specs.map((spec, index) => (

                    <div
                      key={index}
                      className="
                        mb-3
                        font-[var(--font-orbitron)]
                        text-gray-300
                      "
                    >
                      {spec}
                    </div>

                  ))}

                </motion.div>

              </div>

            )

          })}

        </motion.div>

      </div>

    </section>

  )
}
