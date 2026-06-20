"use server"

import { PaymentMethod, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface PaymentActionState {
  ok: boolean
  message: string
}

const paymentUpdateSchema = z.object({
  orderId: z.string().uuid(),
  paymentStatus: z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]),
  paymentMethod: z.enum(["MANUAL", "BANK_TRANSFER", "COD"]),
  paymentNote: z.string().trim().max(500).optional(),
})

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
      message: "Payment update data is invalid.",
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
      message: "Order was not found.",
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
    message: "Payment status updated.",
  }
}
