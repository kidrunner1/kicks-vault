"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { cancelOrderAndRestoreStock } from "@/lib/order-cancellation"
import {
  formatCustomerCancelReason,
  getUserCancelEligibility,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
import { prisma } from "@/lib/prisma"

export interface UserCancelOrderActionState {
  ok: boolean
  message: string
}

const userCancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  cancelReason: z
    .string()
    .trim()
    .min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร")
    .max(500, "เหตุผลต้องไม่เกิน 500 ตัวอักษร"),
})

function actionError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function cancelUserOrder(
  _previousState: UserCancelOrderActionState,
  formData: FormData,
): Promise<UserCancelOrderActionState> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      message: "กรุณาเข้าสู่ระบบก่อนยกเลิกออเดอร์",
    }
  }

  const parsed = userCancelOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    cancelReason: formData.get("cancelReason"),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "กรุณาตรวจสอบข้อมูลการยกเลิกออเดอร์",
    }
  }

  const { orderId, cancelReason } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
        },
        include: {
          items: {
            select: {
              shoeId: true,
              size: true,
              quantity: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error("ไม่พบออเดอร์นี้")
      }

      const eligibility = getUserCancelEligibility({
        status: order.status as OrderFulfillmentStatus,
        createdAt: order.createdAt,
        cancelledAt: order.cancelledAt,
        stockRestoredAt: order.stockRestoredAt,
      })

      if (!eligibility.canCancel) {
        throw new Error(eligibility.reason)
      }

      await cancelOrderAndRestoreStock({
        tx,
        order,
        cancelReason: formatCustomerCancelReason(cancelReason),
      })
    })
  } catch (error) {
    return {
      ok: false,
      message: actionError(error, "ไม่สามารถยกเลิกออเดอร์ได้"),
    }
  }

  revalidatePath("/account")
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/product")

  return {
    ok: true,
    message: "ยกเลิกออเดอร์แล้ว และคืน stock กลับเข้าระบบเรียบร้อย",
  }
}
