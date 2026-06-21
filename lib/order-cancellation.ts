import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import {
  paymentStatusAfterCancellation,
  type FulfillmentPaymentStatus,
} from "@/lib/order-fulfillment"

export type OrderForStockRestoringCancellation = {
  id: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  cancelledAt: Date | null
  items: Array<{
    shoeId: string
    size: string | null
    quantity: number
  }>
}

export async function cancelOrderAndRestoreStock({
  tx,
  order,
  cancelReason,
  now = new Date(),
}: {
  tx: Prisma.TransactionClient
  order: OrderForStockRestoringCancellation
  cancelReason: string
  now?: Date
}) {
  const paymentStatus = paymentStatusAfterCancellation(
    order.paymentStatus as FulfillmentPaymentStatus,
  ) as PaymentStatus

  const claimed = await tx.order.updateMany({
    where: {
      id: order.id,
      status: order.status,
      stockRestoredAt: null,
    },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: order.cancelledAt ?? now,
      cancelReason,
      stockRestoredAt: now,
      paymentStatus,
    },
  })

  if (claimed.count !== 1) {
    throw new Error("ออเดอร์นี้ถูกยกเลิกหรือคืน stock ไปแล้ว")
  }

  for (const item of order.items) {
    if (!item.size) {
      throw new Error("ไม่พบ size ของสินค้าในออเดอร์ จึงคืน stock ไม่ได้")
    }

    const restored = await tx.shoeSize.updateMany({
      where: {
        shoeId: item.shoeId,
        size: item.size,
      },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    })

    if (restored.count !== 1) {
      throw new Error(`ไม่พบ stock สำหรับ size ${item.size}`)
    }
  }
}
