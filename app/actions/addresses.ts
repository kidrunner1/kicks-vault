"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import {
  addressInputSchema,
  normalizeAddressInput,
  type AddressInput,
} from "@/lib/address"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const addressIdSchema = z.string().uuid()

async function requireCurrentUserId() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Please sign in before managing addresses")
  }

  return user.id
}

function revalidateAddressSurfaces() {
  revalidatePath("/account")
  revalidatePath("/account/addresses")
  revalidatePath("/cart")
}

export async function createAddress(input: AddressInput) {
  const userId = await requireCurrentUserId()
  const address = normalizeAddressInput(input)

  const created = await prisma.$transaction(async (tx) => {
    const existingCount = await tx.userAddress.count({
      where: { userId },
    })
    const shouldBeDefault = existingCount === 0 || address.isDefault

    if (shouldBeDefault) {
      await tx.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    return tx.userAddress.create({
      data: {
        ...address,
        isDefault: shouldBeDefault,
        userId,
      },
    })
  })

  revalidateAddressSurfaces()

  return created.id
}

export async function updateAddress(id: string, input: AddressInput) {
  const userId = await requireCurrentUserId()
  const addressId = addressIdSchema.parse(id)
  const address = addressInputSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    const existing = await tx.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!existing) {
      throw new Error("Address was not found")
    }

    const shouldBeDefault = existing.isDefault || address.isDefault

    if (shouldBeDefault) {
      await tx.userAddress.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: addressId },
        },
        data: { isDefault: false },
      })
    }

    await tx.userAddress.update({
      where: { id: addressId },
      data: {
        ...address,
        addressLine2: address.addressLine2?.trim() || "",
        isDefault: shouldBeDefault,
      },
    })
  })

  revalidateAddressSurfaces()
}

export async function deleteAddress(id: string) {
  const userId = await requireCurrentUserId()
  const addressId = addressIdSchema.parse(id)

  await prisma.$transaction(async (tx) => {
    const existing = await tx.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!existing) {
      throw new Error("Address was not found")
    }

    await tx.userAddress.delete({
      where: { id: addressId },
    })

    if (existing.isDefault) {
      const nextDefault = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      })

      if (nextDefault) {
        await tx.userAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        })
      }
    }
  })

  revalidateAddressSurfaces()
}

export async function setDefaultAddress(id: string) {
  const userId = await requireCurrentUserId()
  const addressId = addressIdSchema.parse(id)

  await prisma.$transaction(async (tx) => {
    const existing = await tx.userAddress.findFirst({
      where: {
        id: addressId,
        userId,
      },
    })

    if (!existing) {
      throw new Error("Address was not found")
    }

    await tx.userAddress.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: { isDefault: false },
    })

    await tx.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    })
  })

  revalidateAddressSurfaces()
}
