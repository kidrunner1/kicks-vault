"use client"

import { motion } from "framer-motion"

interface Props {
  open: boolean
  toggle: () => void
}

export default function MenuButton({ open, toggle }: Props) {
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="
        fixed
        top-6
        right-6
        w-14
        h-14
        rounded-2xl
        border
        border-neutral-700
        bg-neutral-900
        flex
        items-center
        justify-center
        transition-colors
        duration-300
        hover:bg-white
        group
      "
    >
      <svg width="26" height="26" viewBox="0 0 24 24" className="relative">

        <motion.line
          x1="6"
          y1="8"
          x2="18"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          initial={false}
          animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "12px 12px" }}
          className="text-white group-hover:text-black"
        />

        <motion.line
          x1="9"
          y1="12"
          x2="15"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          initial={false}
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-white group-hover:text-black"
        />

        <motion.line
          x1="6"
          y1="16"
          x2="18"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
          initial={false}
          animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "12px 12px" }}
          className="text-white group-hover:text-black"
        />

      </svg>
    </motion.button>
  )
}
