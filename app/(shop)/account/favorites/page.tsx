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
                    images: { orderBy: { order: "asc" } }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="space-y-16">

            {/* ================= HEADER ================= */}
            <div>
                <h1 className="text-3xl font-semibold">
                    Your Collection
                </h1>
                <p className="text-sm text-black/50 mt-2">
                    Sneakers you've saved for later.
                </p>
            </div>


            {/* ================= GRID ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

                {favorites.map((favorite) => {

                    const shoe = favorite.shoe
                    const image = normalizeImagePath(shoe.images[0]?.url)

                    return (
                        <div
                            key={favorite.id}
                            className="
                bg-white
                border
                border-black/10
                rounded-3xl
                overflow-hidden
                transition
                hover:shadow-md
              "
                        >

                            <Link href={`/product/${shoe.slug}`}>

                                {/* Image */}
                                <div className="relative aspect-4/5 bg-white overflow-hidden">

                                    <Image
                                        src={image}
                                        alt={shoe.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw,
                           (max-width: 1200px) 50vw,
                           33vw"
                                        className="
                      object-contain
                      p-6
                      transition-transform
                      duration-500
                      hover:scale-105
                    "
                                    />

                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-2">

                                    <p className="text-[10px] uppercase tracking-wider text-black/40">
                                        {shoe.brand.name}
                                    </p>

                                    <h2 className="text-lg font-medium">
                                        {shoe.name}
                                    </h2>

                                    {shoe.price && (
                                        <p className="text-sm text-black/70">
                                            ${Number(shoe.price).toFixed(2)}
                                        </p>
                                    )}

                                </div>

                            </Link>

                            {/* Remove Button */}
                            <div className="absolute top-5 right-5">
                                <FavoriteRemoveButton shoeId={shoe.id} />
                            </div>

                        </div>
                    )
                })}

            </div>

        </div>
    )
}