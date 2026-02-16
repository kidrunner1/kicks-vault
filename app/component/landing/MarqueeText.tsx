"use client"

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame
} from "framer-motion"

import { useRef } from "react"

export default function MarqueeText({
  text,
  speed = 50,
}: {
  text: string
  speed?: number
}) {

  const baseX = useMotionValue(0)

  const { scrollY } = useScroll()

  const scrollVelocity = useTransform(scrollY, [0, 1000], [0, 5])

  const velocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  })

  const directionFactor = useRef(1)

  useAnimationFrame((t, delta) => {

    let moveBy = directionFactor.current * speed * (delta / 1000)

    if (velocity.get() < 0) {
      directionFactor.current = -1
    } else if (velocity.get() > 0) {
      directionFactor.current = 1
    }

    moveBy += directionFactor.current * moveBy * velocity.get()

    baseX.set(baseX.get() + moveBy)
  })

  const x = useTransform(baseX, (v) => `${v % 100}%`)

  return (

    <div className="overflow-hidden whitespace-nowrap">

      <motion.div
        style={{ x }}
        className="
          flex
          whitespace-nowrap
          font-[var(--font-bebas)]
          text-[120px]
          text-white/10
          tracking-widest
        "
      >

        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-10">
            {text}
          </span>
        ))}

      </motion.div>

    </div>

  )
}
