"use client"

import { JSX, useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function SpaceBackground(): JSX.Element | null {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ป้องกัน SSR render
  if (!mounted) return null

  const stars = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            top: `${star.top}%`,
            left: `${star.left}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  )
}
