import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import FavoriteRemoveButton from "@/app/component/ui/FavoriteRemoveButton"
import { normalizeImagePath } from "@/lib/image"

export default async function FavoritesPage() {

    const user = await getCurrentUser()
    if (!user) redirect("/login")

    const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
            shoe: {
                include: {
                    brand: true,
                    images: {
                        orderBy: { order: "asc" }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-28">

            {/* Header */}
            <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                    Favorites
                </p>
                <h1 className="text-5xl tracking-tight">
                    Your Collection
                </h1>
                <div className="w-24 h-px bg-white/10" />
            </div>

            {favorites.length === 0 && (
                <div className="border border-white/10 rounded-3xl p-16 text-center space-y-6 bg-white/[0.02]">
                    <p className="text-white/60 text-lg">
                        You haven’t saved any sneakers yet.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block text-sm uppercase tracking-widest text-white border-b border-white/30 hover:border-white transition"
                    >
                        Explore Collection
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20">

                {favorites.map((favorite) => {

                    const shoe = favorite.shoe
                    const image = normalizeImagePath(
                        shoe.images[0]?.url
                    )

                    return (
                        <div
                            key={favorite.id}
                            className="
                group relative
                border border-white/10
                rounded-3xl
                overflow-hidden
                transition-all
                duration-500
                hover:border-white/20
                hover:bg-white/[0.02]
              "
                        >

                            <Link href={`/product/${shoe.slug}`}>

                                {/* Image */}
                                <div className="relative aspect-[4/5] overflow-hidden">

                                    <Image
                                        src={image}
                                        alt={shoe.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw,
                           (max-width: 1200px) 50vw,
                           33vw"
                                        className="
                      object-cover
                      transition-transform
                      duration-700
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      group-hover:scale-105
                    "
                                    />

                                    {/* Subtle gradient overlay */}
                                    <div className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/30
                    to-transparent
                    opacity-0
                    group-hover:opacity-100
                    transition
                    duration-500
                  " />

                                </div>

                                {/* Content */}
                                <div className="p-10 space-y-4">

                                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                                        {shoe.brand.name}
                                    </p>

                                    <h2 className="text-2xl tracking-tight">
                                        {shoe.name}
                                    </h2>

                                </div>

                            </Link>

                            {/* Remove Button */}
                            <div className="absolute top-6 right-6">
                                <FavoriteRemoveButton shoeId={shoe.id} />
                            </div>

                        </div>
                    )
                })}

            </div>

        </div>
    )
}