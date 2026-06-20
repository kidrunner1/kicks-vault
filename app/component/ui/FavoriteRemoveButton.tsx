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
        rounded-full
        border border-black/10
        bg-white
        p-3
        text-red-600
        shadow-sm
        transition
        hover:border-red-200
        hover:bg-red-50
        hover:text-red-700
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
        >
            <Heart size={18} className="fill-current" />
        </button>
    )
}
