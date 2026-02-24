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

    // ✅ Sync in case parent revalidates
    useEffect(() => {
        setIsFavorited(initialFavorited)
    }, [initialFavorited])

    const handleToggle = () => {

        if (isPending) return

        const previousState = isFavorited
        const optimisticState = !previousState

        // Optimistic update
        setIsFavorited(optimisticState)

        startTransition(async () => {

            const res = await toggleFavorite(shoeId)

            if (!res.success) {
                // Rollback safely
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

            if (res.state === "ADDED") {
                toast.success("Added to favorites.")
            }

            if (res.state === "REMOVED") {
                toast.success("Removed from favorites.")
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={isFavorited}
            className={`
        relative group
        transition
        ${isPending ? "pointer-events-none opacity-70" : ""}
      `}
        >
            <motion.div
                whileTap={{ scale: 0.85 }}
                animate={{
                    scale: isFavorited ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <Heart
                    className={`
            w-6 h-6
            transition-all duration-300
            ${isFavorited
                            ? "fill-white text-white"
                            : "text-white/40 group-hover:text-white"}
          `}
                />
            </motion.div>
        </button>
    )
}