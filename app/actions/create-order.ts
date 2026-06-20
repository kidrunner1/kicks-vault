"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client"
import { toOrderShippingSnapshot } from "@/lib/address"
import { type CheckoutPaymentMethod } from "@/lib/payment"

interface CreateOrderInput {
  addressId: string
  paymentMethod?: CheckoutPaymentMethod
  items: {
    shoeId: string
    size: string
    quantity: number
  }[]
}

const orderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["MANUAL", "BANK_TRANSFER", "COD"]).default("MANUAL"),
  items: z.array(
    z.object({
      shoeId: z.string().uuid(),
      size: z.string().trim().min(1),
      quantity: z.coerce.number().int().min(1),
    })
  ).min(1),
})

function normalizeOrderItems(items: CreateOrderInput["items"]) {
  const normalizedItems = new Map<string, CreateOrderInput["items"][number]>()

  for (const item of items) {
    const key = `${item.shoeId}:${item.size.toLowerCase()}`
    const existing = normalizedItems.get(key)

    if (existing) {
      existing.quantity += item.quantity
      continue
    }

    normalizedItems.set(key, { ...item })
  }

  return Array.from(normalizedItems.values())
}

function createPaymentSnapshot(paymentMethod: PaymentMethod) {
  if (paymentMethod === PaymentMethod.MANUAL) {
    return {
      paymentStatus: PaymentStatus.PAID,
      paymentMethod,
      paidAt: new Date(),
      paymentNote:
        "Mock instant payment approved from customer checkout. No real payment was processed.",
    }
  }

  if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
    return {
      paymentStatus: PaymentStatus.UNPAID,
      paymentMethod,
      paidAt: null,
      paymentNote:
        "Customer selected bank transfer mock payment. Awaiting admin verification.",
    }
  }

  return {
    paymentStatus: PaymentStatus.UNPAID,
    paymentMethod,
    paidAt: null,
    paymentNote:
      "Customer selected cash on delivery mock payment. Payment will be confirmed later.",
  }
}

export async function createOrder(data: CreateOrderInput) {
  const parsed = orderSchema.safeParse(data)

  if (!parsed.success) {
    throw new Error("Invalid order data")
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Please sign in before checking out")
  }

  const items = normalizeOrderItems(parsed.data.items)
  const paymentSnapshot = createPaymentSnapshot(
    parsed.data.paymentMethod as PaymentMethod,
  )

  const orderId = await prisma.$transaction(async (tx) => {
    const shippingAddress = await tx.userAddress.findFirst({
      where: {
        id: parsed.data.addressId,
        userId: user.id,
      },
    })

    if (!shippingAddress) {
      throw new Error("Select a valid shipping address")
    }

    const shippingSnapshot = toOrderShippingSnapshot(shippingAddress)
    let total = new Prisma.Decimal(0)

    const orderItems: {
      shoeId: string
      quantity: number
      size: string
      price: Prisma.Decimal
    }[] = []

    for (const item of items) {
      const shoe = await tx.shoe.findUnique({
        where: { id: item.shoeId },
        select: {
          price: true,
          sizes: {
            where: { size: item.size },
            select: { id: true },
            take: 1,
          },
        },
      })

      if (!shoe || shoe.price === null) {
        throw new Error("Product price was not found")
      }

      if (shoe.sizes.length === 0) {
        throw new Error("Selected size was not found")
      }

      const stockUpdate = await tx.shoeSize.updateMany({
        where: {
          shoeId: item.shoeId,
          size: item.size,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      })

      if (stockUpdate.count !== 1) {
        throw new Error("Insufficient stock for selected size")
      }

      const price = new Prisma.Decimal(shoe.price)
      total = total.add(price.mul(item.quantity))

      orderItems.push({
        shoeId: item.shoeId,
        quantity: item.quantity,
        size: item.size,
        price,
      })
    }

    const order = await tx.order.create({
      data: {
        userId: user.id,
        ...shippingSnapshot,
        total,
        ...paymentSnapshot,
        items: {
          create: orderItems,
        },
      },
    })

    return order.id
  })

  return orderId
}
