"use client"

import { useCartStore } from "@/app/store/cart-store"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FloatingCartButton() {
  const items = useCartStore((state) => state.items)
  const router = useRouter()

  const totalItems = items.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  if (totalItems === 0) return null

  return (
    <motion.button
      onClick={() => router.push("/cart")}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="
        fixed
        bottom-8
        right-8
        z-50
        flex
        items-center
        gap-3
        px-6
        py-3
        rounded-full
        bg-white
        border
        border-black/10
        text-black
        shadow-lg
        hover:shadow-xl
        transition
      "
    >
      <div className="relative flex items-center justify-center">
        <ShoppingBag size={20} />

        {/* Badge */}
        <motion.span
          key={totalItems}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="
            absolute
            -top-2
            -right-2
            min-w-[20px]
            h-[20px]
            px-1
            bg-black
            text-white
            text-[10px]
            font-medium
            rounded-full
            flex
            items-center
            justify-center
          "
        >
          {totalItems}
        </motion.span>
      </div>

      <span className="text-xs uppercase tracking-widest">
        {totalItems} {totalItems === 1 ? "Item" : "Items"}
      </span>
    </motion.button>
  )
}