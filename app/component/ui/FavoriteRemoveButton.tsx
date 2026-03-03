"use client"

import { Heart } from "lucide-react"
import { useTransition } from "react"
import { toggleFavorite } from "@/app/actions/toggle-favorite"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props {
    shoeId: string
}

export default function FavoriteRemoveButton({ shoeId }: Props) {

    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRemove = () => {
        startTransition(async () => {
            await toggleFavorite(shoeId)
            toast("ลบออกจากรายการโปรดแล้ว")
            router.refresh()
        })
    }

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="
        bg-black/60
        backdrop-blur-md
        border border-white/20
        p-3
        rounded-full
        hover:border-red-500
        transition
      "
        >
            <Heart size={18} className="fill-red-500 text-red-500" />
        </button>
    )
}