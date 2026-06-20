"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleFavorite } from "@/app/actions/toggle-favorite"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { uiAction } from "@/lib/ui-interactions"

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
            toast.error("กรุณาเข้าสู่ระบบก่อนดำเนินการต่อ")
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
                    toast.error("ไม่พบสินค้านี้")
                } else {
                    toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง")
                }

                return
            }

            toast.success(
                res.state === "ADDED"
                    ? "เพิ่มลงรายการโปรดแล้ว"
                    : "นำออกจากรายการโปรดแล้ว"
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
            aria-label={isFavorited ? "นำออกจากรายการโปรด" : "เพิ่มลงรายการโปรด"}
            whileTap={{ scale: 0.9 }}
            className={`
        group
        h-11 w-11 p-0
        ${isFavorited
                    ? uiAction.accent
                    : uiAction.surface}
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
                            ? "fill-black text-black"
                            : "text-black/60 group-hover:text-black"}
          `}
                />
            </motion.div>
        </motion.button>
    )
}
