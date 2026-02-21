"use client"

import { useCartStore } from "@/app/store/cart-store"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FloatingCartButton() {

  const items = useCartStore(state => state.items)
  const router = useRouter()

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  if (totalItems === 0) return null

  const handleClick = () => {
    router.push("/cart")
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -6, scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="
        fixed
        bottom-8
        right-8
        px-6
        py-4
        rounded-full
        bg-white/10
        backdrop-blur-md
        border border-white/20
        text-white
        flex
        items-center
        gap-3
        shadow-xl
        hover:border-white/40
        hover:bg-white/15
        transition-all
        duration-300
        z-20000
      "
    >

      <div className="relative flex items-center justify-center">

        <ShoppingBag size={20} />

        {/* Badge */}
        <motion.span
          key={totalItems}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="
            absolute
            -top-2
            -right-2
            min-w-5.5
            h-5.5
            px-1
            bg-red-500
            text-white
            text-[10px]
            font-medium
            rounded-full
            flex
            items-center
            justify-center
            shadow-md
          "
        >
          {totalItems}
        </motion.span>

      </div>

      {/* Text */}
      <span className="text-xs uppercase tracking-[0.2em]">
        {totalItems} {totalItems === 1 ? "Item" : "Items"}
      </span>

    </motion.button>
  )
}