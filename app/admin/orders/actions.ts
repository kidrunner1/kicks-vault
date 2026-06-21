"use server"

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { cancelOrderAndRestoreStock } from "@/lib/order-cancellation"
import {
  validateFulfillmentTransition,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
import { prisma } from "@/lib/prisma"

export interface PaymentActionState {
  ok: boolean
  message: string
}

export interface FulfillmentActionState {
  ok: boolean
  message: string
}

const paymentUpdateSchema = z.object({
  orderId: z.string().uuid(),
  paymentStatus: z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]),
  paymentMethod: z.enum(["MANUAL", "BANK_TRANSFER", "COD"]),
  paymentNote: z.string().trim().max(500).optional(),
})

const fulfillmentUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  shippingCarrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  cancelReason: z.string().trim().max(500).optional(),
})

function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function actionError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function updateOrderPaymentState(
  _previousState: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  await requireAdmin()

  const parsed = paymentUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
    paymentMethod: formData.get("paymentMethod"),
    paymentNote: formData.get("paymentNote") ?? undefined,
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "ข้อมูล Payment ไม่ถูกต้อง",
    }
  }

  const { orderId, paymentStatus, paymentMethod, paymentNote } = parsed.data

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      paidAt: true,
    },
  })

  if (!order) {
    return {
      ok: false,
      message: "ไม่พบออเดอร์นี้",
    }
  }

  const paidAt =
    paymentStatus === PaymentStatus.PAID
      ? order.paidAt ?? new Date()
      : paymentStatus === PaymentStatus.REFUNDED
        ? order.paidAt
        : null

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus: paymentStatus as PaymentStatus,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentNote: paymentNote?.trim() || null,
      paidAt,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return {
    ok: true,
    message: "อัปเดตสถานะ Payment แล้ว",
  }
}

export async function updateOrderFulfillmentState(
  _previousState: FulfillmentActionState,
  formData: FormData,
): Promise<FulfillmentActionState> {
  await requireAdmin()

  const parsed = fulfillmentUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    shippingCarrier: optionalText(formData.get("shippingCarrier")),
    trackingNumber: optionalText(formData.get("trackingNumber")),
    cancelReason: optionalText(formData.get("cancelReason")),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "ข้อมูล Fulfillment ไม่ถูกต้อง",
    }
  }

  const {
    orderId,
    status,
    shippingCarrier,
    trackingNumber,
    cancelReason,
  } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
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

      const validation = validateFulfillmentTransition({
        currentStatus: order.status as OrderFulfillmentStatus,
        nextStatus: status as OrderFulfillmentTargetStatus,
        shippingCarrier,
        trackingNumber,
        cancelReason,
      })

      if (!validation.ok) {
        throw new Error(validation.message)
      }

      if (status === OrderStatus.CANCELLED) {
        await cancelOrderAndRestoreStock({
          tx,
          order,
          cancelReason: cancelReason ?? "",
        })
        return
      }

      const now = new Date()
      const data: Prisma.OrderUpdateManyMutationInput = {
        status: status as OrderStatus,
      }

      if (status === OrderStatus.SHIPPED) {
        data.shippingCarrier = shippingCarrier
        data.trackingNumber = trackingNumber
        data.shippedAt = order.shippedAt ?? now
      }

      if (status === OrderStatus.DELIVERED) {
        data.deliveredAt = order.deliveredAt ?? now
      }

      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data,
      })

      if (updated.count !== 1) {
        throw new Error("สถานะออเดอร์ถูกเปลี่ยนไปแล้ว กรุณารีเฟรชหน้า")
      }
    })
  } catch (error) {
    return {
      ok: false,
      message: actionError(error, "ไม่สามารถอัปเดต Fulfillment ได้"),
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)

  return {
    ok: true,
    message: "อัปเดต Fulfillment แล้ว",
  }
}
