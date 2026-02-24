"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function toggleFavorite(shoeId: string) {

    // ✅ Basic validation
    if (!shoeId || typeof shoeId !== "string") {
        return { success: false, error: "INVALID_ID" }
    }

    try {
        const user = await getCurrentUser()

        if (!user) {
            return { success: false, error: "UNAUTHORIZED" }
        }

        // ✅ Check shoe exists
        const shoeExists = await prisma.shoe.findUnique({
            where: { id: shoeId },
            select: { id: true }
        })

        if (!shoeExists) {
            return { success: false, error: "NOT_FOUND" }
        }

        // ✅ Use transaction (future-safe)
        const result = await prisma.$transaction(async (tx) => {

            const existing = await tx.favorite.findUnique({
                where: {
                    userId_shoeId: {
                        userId: user.id,
                        shoeId
                    }
                }
            })

            if (existing) {
                await tx.favorite.delete({
                    where: { id: existing.id }
                })

                return "REMOVED"
            }

            await tx.favorite.create({
                data: {
                    userId: user.id,
                    shoeId
                }
            })

            return "ADDED"
        })

        return {
            success: true,
            state: result
        }

    } catch (error) {
        console.error("Favorite toggle error:", error)
        return { success: false, error: "SERVER_ERROR" }
    }
}