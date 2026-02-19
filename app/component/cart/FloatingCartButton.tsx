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
      transition={{ duration: 0.4 }}
      className="
  fixed
  bottom-8
  right-8
  w-16
  h-16
  rounded-full
  bg-white
  text-black
  flex
  items-center
  justify-center
  shadow-lg
  z-20000
"
    >

      <ShoppingBag size={20} />

      {/* Badge */}
      <span className="
        absolute
        -top-2
        -right-2
        w-6
        h-6
        bg-black
        text-white
        text-xs
        rounded-full
        flex
        items-center
        justify-center
      ">
        {totalItems}
      </span>

    </motion.button>
  )
}
