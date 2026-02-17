"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Shoe, Brand, ShoeImage, ShoeSpec } from "@prisma/client"

type ShoeWithRelations = Shoe & {
  brand: Brand
  images: ShoeImage[]
  specs: ShoeSpec[]
  price: string | null
}

interface Props {
  shoes: (Omit<ShoeWithRelations, "price"> & {
    price: string | null
  })[]
}


export default function ShowcaseSectionDatabase({ shoes }: Props) {

  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20
  })
  // Horizontal scroll based on scroll progress

  const x = useTransform(
    smooth,
    [0, 1],
    ["0%", `-${Math.max(shoes.length - 1, 0) * 100}%`]
  )
  // Progress bar scale
  const progressScale = useTransform(smooth, [0, 1], [0, 1])

  return (
    <section
      ref={ref}
      className="relative h-[400vh] bg-gray-500"
    >
      {/* Progress Bar */}
      <motion.div
        style={{ scaleX: progressScale }}
        className="fixed  top-0  left-0 h-0.5  w-full  origin-left  bg-linear-to-r  from-white  via-neutral-400  to-white  z-50" />

      <div className="sticky top-0 h-screen overflow-hidden">

        <motion.div
          style={{ x }}
          className="flex h-full"
        >

          {shoes.map((shoe, index) => {

            return (

              <div
                key={shoe.id}
                className="
                  min-w-screen
                  h-full
                  flex
                  items-center
                  justify-center
                  px-20
                  relative
                "
              >

                {/* Gradient Spotlight */}
                <div className="
                  absolute
                  inset-0
                  bg-linear-to-r
                  from-black
                  via-transparent
                  to-black
                  opacity-60
                  pointer-events-none
                " />

                <Link
                  href={`/product/${shoe.slug}`}
                  className="
                    flex
                    items-center
                    gap-24
                    text-white
                    z-10
                    group
                  "
                >

                  <div
                    className="  relative  w-150  h-150 flex items-center justify-center " >

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      <motion.img
                        src={shoe.images[0]?.url}
                        alt={shoe.name}
                        initial={{ scale: 0.85, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 1.2,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className=" max-w-[90%] object-contain drop-shadow-[0_80px_120px_rgba(0,0,0,0.9)] transition-transform  duration-700  group-hover:scale-105 " />

                    </motion.div>
                  </div>

                  {/* TEXT BLOCK */}
                  <div className="max-w-xl">

                    {/* Brand */}
                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className=" text-neutral-500 uppercase  tracking-[0.5em]  text-[10px]  mb-8" >
                      {shoe.brand.name}
                    </motion.div>

                    {/* Name */}
                    <motion.h2
                      initial={{ y: 60, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="text-[7rem]  leading-[0.9]  font-(--font-bebas)  tracking-tight  mb-8"  >

                      {shoe.name}
                    </motion.h2>

                    {/* Divider */}
                    <div className="w-16 h-[1px] bg-neutral-700 mb-8" />

                    {/* Description */}
                    <motion.p
                      initial={{ y: 40, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 1,
                        delay: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="  text-neutral-400 leading-relaxed text-lg "
                    >
                      {shoe.description}
                    </motion.p>

                  </div>


                </Link>

              </div>
            )
          })}

        </motion.div>

      </div>
    </section>
  )
}
