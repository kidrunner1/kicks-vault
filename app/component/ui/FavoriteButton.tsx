"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleFavorite } from "@/app/actions/toggle-favorite"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"

interface Props {
    shoeId: string
    initialFavorited: boolean
}

export default function FavoriteButton({
    shoeId,
    initialFavorited
}: Props) {

    const router = useRouter()

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    const [isFavorited, setIsFavorited] = useState(initialFavorited)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setIsFavorited(initialFavorited)
    }, [initialFavorited])

    const handleToggle = () => {

        // ⭐ Auth check
        if (!isAuthenticated) {
            toast.error("Please login to continue.")
            router.push("/login")
            return
        }

        if (isPending) return

        const previousState = isFavorited
        const optimisticState = !previousState

        // optimistic UI
        setIsFavorited(optimisticState)

        startTransition(async () => {

            const res = await toggleFavorite(shoeId)

            if (!res.success) {

                setIsFavorited(previousState)

                if (res.error === "NOT_FOUND") {
                    toast.error("Product not found.")
                } else {
                    toast.error("Something went wrong.")
                }

                return
            }

            toast.success(
                res.state === "ADDED"
                    ? "Added to favorites"
                    : "Removed from favorites"
            )

            // optional refresh favorites page
            router.refresh()
        })
    }

    return (
        <motion.button
            onClick={handleToggle}
            disabled={isPending}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            whileTap={{ scale: 0.9 }}
            className={`
        w-11 h-11
        rounded-full
        border
        flex items-center justify-center
        transition
        group
        ${isFavorited
                    ? "bg-black border-black"
                    : "bg-white border-black/10 hover:border-black/30"}
        ${isPending ? "opacity-60 pointer-events-none" : ""}
      `}
        >
            <motion.div
                animate={{
                    scale: isFavorited ? 1.15 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
            >
                <Heart
                    className={`
            w-5 h-5
            transition-all duration-300
            ${isFavorited
                            ? "fill-white text-white"
                            : "text-black/60 group-hover:text-black"}
          `}
                />
            </motion.div>
        </motion.button>
    )
}