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
    price: number
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
        quantity: z.number().min(1),
        price: z.number().positive()
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
    throw new Error("ไม่พบผู้ใช้งาน")
  }

  // -----------------------------
  // 3️⃣ Pre-check Stock
  // -----------------------------

  for (const item of items) {

    const sizeRecord = await prisma.shoeSize.findUnique({
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
      throw new Error("จำนวนสินค้าที่สั่งมีมากกว่าจำนวนที่มีในสต็อก")
    }
  }

  // -----------------------------
  // 4️⃣ Calculate Total (validated data only)
  // -----------------------------

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  // -----------------------------
  // 5️⃣ Transaction: Decrement Stock + Create Order
  // -----------------------------

  const orderId = await prisma.$transaction(async (tx) => {

    // Decrement stock
    for (const item of items) {

      const sizeRecord = await tx.shoeSize.findUnique({
        where: {
          shoeId_size: {
            shoeId: item.shoeId,
            size: item.size
          }
        }
      })

      if (!sizeRecord || sizeRecord.stock < item.quantity) {
        throw new Error("Stock error")
      }

      await tx.shoeSize.update({
        where: { id: sizeRecord.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // Create order
    const order = await tx.order.create({
      data: {
        userId: user.id,
        total: new Decimal(total),
        items: {
          create: items.map(i => ({
            shoeId: i.shoeId,
            quantity: i.quantity,
            size: i.size,
            price: new Decimal(i.price)
          }))
        }
      }
    })

    return order.id
  })

  // -----------------------------
  // 6️⃣ Return Order ID (IMPORTANT 🔥)
  // -----------------------------

  return orderId
}
