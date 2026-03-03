"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleFavorite } from "@/app/actions/toggle-favorite"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface Props {
    shoeId: string
    initialFavorited: boolean
}

export default function FavoriteButton({
    shoeId,
    initialFavorited
}: Props) {

    const [isFavorited, setIsFavorited] = useState(initialFavorited)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setIsFavorited(initialFavorited)
    }, [initialFavorited])

    const handleToggle = () => {

        if (isPending) return

        const previousState = isFavorited
        const optimisticState = !previousState

        setIsFavorited(optimisticState)

        startTransition(async () => {

            const res = await toggleFavorite(shoeId)

            if (!res.success) {
                setIsFavorited(previousState)

                if (res.error === "UNAUTHORIZED") {
                    toast.error("Please login to continue.")
                } else if (res.error === "NOT_FOUND") {
                    toast.error("Product not found.")
                } else {
                    toast.error("Something went wrong.")
                }

                return
            }

            toast.success(
                res.state === "ADDED"
                    ? "เพิ่มลงในรายการโปรดแล้ว"
                    : "ลบออกจากรายการโปรดแล้ว"
            )
        })
    }

    return (
        <motion.button
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={isFavorited}
            whileTap={{ scale: 0.9 }}
            className={`
        w-11 h-11
        rounded-full
        border
        flex items-center justify-center
        transition
        ${isFavorited
                    ? "bg-black border-black"
                    : "bg-white border-black/10 hover:border-black/30"
                }
        ${isPending ? "opacity-60 pointer-events-none" : ""}
      `}
        >
            <motion.div
                animate={{
                    scale: isFavorited ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Heart
                    className={`
            w-5 h-5
            transition-all duration-300
            ${isFavorited
                            ? "fill-white text-white"
                            : "text-black/60 group-hover:text-black"
                        }
          `}
                />
            </motion.div>
        </motion.button>
    )
}