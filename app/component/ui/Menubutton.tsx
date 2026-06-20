"use client"

import { motion } from "framer-motion"
import { uiAction } from "@/lib/ui-interactions"

interface Props {
  open: boolean
  toggle: () => void
}

export default function MenuButton({ open, toggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`
        group
        relative
        h-11
        w-11
        shrink-0
        p-0
        shadow-sm
        duration-200
        ${uiAction.accent}
      `}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="relative"
        aria-hidden="true"
      >
        <motion.line
          x1="6"
          y1="8"
          x2="18"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "12px 12px" }}
        />

        <motion.line
          x1="8"
          y1="12"
          x2="16"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.18 }}
        />

        <motion.line
          x1="6"
          y1="16"
          x2="18"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ transformOrigin: "12px 12px" }}
        />
      </svg>
    </motion.button>
  )
}
