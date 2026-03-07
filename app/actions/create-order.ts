"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { Decimal } from "@prisma/client/runtime/library"

interface CreateOrderInput {
  items: {
    shoeId: string
    size: string
    quantity: number
  }[]
}

export async function createOrder(data: CreateOrderInput) {

  // -----------------------------
  // 1️⃣ Validate Input
  // -----------------------------

  const OrderSchema = z.object({
    items: z.array(
      z.object({
        shoeId: z.string().uuid(),
        size: z.string().min(1),
        quantity: z.number().min(1)
      })
    ).min(1)
  })

  const parsed = OrderSchema.safeParse(data)

  if (!parsed.success) {
    throw new Error("ข้อมูลคำสั่งซื้อไม่ถูกต้อง")
  }

  const { items } = parsed.data

  // -----------------------------
  // 2️⃣ Auth Check
  // -----------------------------

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบเพื่อทำการสั่งซื้อ")
  }

  // -----------------------------
  // 3️⃣ Transaction
  // -----------------------------

  const orderId = await prisma.$transaction(async (tx) => {

    let total = 0

    const orderItems = []

    for (const item of items) {

      // fetch size
      const sizeRecord = await tx.shoeSize.findUnique({
        where: {
          shoeId_size: {
            shoeId: item.shoeId,
            size: item.size
          }
        }
      })

      if (!sizeRecord) {
        throw new Error("ไม่พบไซส์ที่เลือก")
      }

      if (sizeRecord.stock < item.quantity) {
        throw new Error("สินค้าในสต็อกไม่เพียงพอ")
      }

      // fetch shoe price
      const shoe = await tx.shoe.findUnique({
        where: { id: item.shoeId },
        select: { price: true }
      })

      if (!shoe || shoe.price === null) {
        throw new Error("ไม่พบราคาสินค้า")
      }

      const itemTotal = Number(shoe.price) * item.quantity

      total += itemTotal

      orderItems.push({
        shoeId: item.shoeId,
        quantity: item.quantity,
        size: item.size,
        price: new Decimal(shoe.price)
      })

      orderItems.push({
        shoeId: item.shoeId,
        quantity: item.quantity,
        size: item.size,
        price: new Decimal(shoe.price)
      })
    }

    // create order
    const order = await tx.order.create({
      data: {
        userId: user.id,
        total: new Decimal(total),
        items: {
          create: orderItems
        }
      }
    })

    return order.id
  })

  return orderId
}