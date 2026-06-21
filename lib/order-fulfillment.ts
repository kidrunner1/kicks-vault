export const ORDER_FULFILLMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const ORDER_FULFILLMENT_TARGET_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const FULFILLMENT_PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export type OrderFulfillmentStatus =
  (typeof ORDER_FULFILLMENT_STATUSES)[number]

export type OrderFulfillmentTargetStatus =
  (typeof ORDER_FULFILLMENT_TARGET_STATUSES)[number]

export type FulfillmentPaymentStatus =
  (typeof FULFILLMENT_PAYMENT_STATUSES)[number]

export const USER_CANCEL_WINDOW_MINUTES = 30
export const USER_CANCEL_WINDOW_MS = USER_CANCEL_WINDOW_MINUTES * 60 * 1000

export type FulfillmentTimelineStepState =
  | "complete"
  | "current"
  | "pending"
  | "cancelled"

export interface FulfillmentTimelineInput {
  status: OrderFulfillmentStatus
  createdAt: Date
  shippedAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
}

export interface FulfillmentTimelineStep {
  key: string
  title: string
  detail: string
  state: FulfillmentTimelineStepState
  date: Date | null
}

export interface FulfillmentTransitionInput {
  currentStatus: OrderFulfillmentStatus
  nextStatus: OrderFulfillmentTargetStatus
  shippingCarrier?: string | null
  trackingNumber?: string | null
  cancelReason?: string | null
}

export type FulfillmentValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export interface UserCancelEligibilityOrder {
  status: OrderFulfillmentStatus
  createdAt: Date
  cancelledAt: Date | null
  stockRestoredAt: Date | null
}

export interface UserCancelEligibility {
  canCancel: boolean
  reason: string
  deadline: Date
  remainingMs: number
}

const allowedTransitions: Record<
  OrderFulfillmentStatus,
  OrderFulfillmentTargetStatus[]
> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CANCELLED"],
  CANCELLED: [],
}

export const orderFulfillmentStatusLabels: Record<
  OrderFulfillmentStatus,
  string
> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังเตรียมสินค้า",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิกแล้ว",
}

export function getAllowedFulfillmentTransitions(
  currentStatus: OrderFulfillmentStatus,
) {
  return allowedTransitions[currentStatus] ?? []
}

export function canTransitionOrderStatus(
  currentStatus: OrderFulfillmentStatus,
  nextStatus: OrderFulfillmentTargetStatus,
) {
  return getAllowedFulfillmentTransitions(currentStatus).includes(nextStatus)
}

export function validateFulfillmentTransition({
  currentStatus,
  nextStatus,
  shippingCarrier,
  trackingNumber,
  cancelReason,
}: FulfillmentTransitionInput): FulfillmentValidationResult {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    return {
      ok: false,
      message: "ไม่สามารถเปลี่ยนสถานะออเดอร์ด้วยลำดับนี้ได้",
    }
  }

  if (nextStatus === "SHIPPED") {
    if (!shippingCarrier?.trim()) {
      return {
        ok: false,
        message: "กรุณาระบุบริษัทขนส่ง",
      }
    }

    if (!trackingNumber?.trim()) {
      return {
        ok: false,
        message: "กรุณาระบุ Tracking number",
      }
    }
  }

  if (nextStatus === "CANCELLED" && !cancelReason?.trim()) {
    return {
      ok: false,
      message: "กรุณาระบุเหตุผลในการยกเลิก",
    }
  }

  return { ok: true }
}

export function paymentStatusAfterCancellation(
  currentStatus: FulfillmentPaymentStatus,
): FulfillmentPaymentStatus {
  return currentStatus === "PAID" ? "REFUNDED" : currentStatus
}

export function getUserCancelDeadline(createdAt: Date) {
  return new Date(createdAt.getTime() + USER_CANCEL_WINDOW_MS)
}

export function getUserCancelEligibility(
  order: UserCancelEligibilityOrder,
  now = new Date(),
): UserCancelEligibility {
  const deadline = getUserCancelDeadline(order.createdAt)
  const remainingMs = Math.max(0, deadline.getTime() - now.getTime())

  if (order.status === "CANCELLED" || order.cancelledAt) {
    return {
      canCancel: false,
      reason: "ออเดอร์นี้ถูกยกเลิกแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.stockRestoredAt) {
    return {
      canCancel: false,
      reason: "ออเดอร์นี้คืน stock แล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "PROCESSING") {
    return {
      canCancel: false,
      reason: "ออเดอร์กำลังเตรียมสินค้าแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "SHIPPED") {
    return {
      canCancel: false,
      reason: "ออเดอร์จัดส่งแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "DELIVERED") {
    return {
      canCancel: false,
      reason: "ออเดอร์ส่งสำเร็จแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (remainingMs <= 0) {
    return {
      canCancel: false,
      reason: "หมดเวลายกเลิกเองแล้ว",
      deadline,
      remainingMs,
    }
  }

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000))

  return {
    canCancel: true,
    reason: `ยกเลิกเองได้อีก ${remainingMinutes} นาที`,
    deadline,
    remainingMs,
  }
}

export function formatCustomerCancelReason(reason: string) {
  return `ลูกค้ายกเลิก: ${reason.trim()}`
}

export function buildFulfillmentTimeline(
  order: FulfillmentTimelineInput,
): FulfillmentTimelineStep[] {
  if (order.status === "CANCELLED") {
    return [
      {
        key: "created",
        title: "รับออเดอร์",
        detail: "ระบบบันทึกออเดอร์และตัด stock แล้ว",
        state: "complete",
        date: order.createdAt,
      },
      {
        key: "cancelled",
        title: "ยกเลิกออเดอร์",
        detail: order.cancelReason?.trim() || "ออเดอร์นี้ถูกยกเลิกแล้ว",
        state: "cancelled",
        date: order.cancelledAt,
      },
    ]
  }

  return [
    {
      key: "created",
      title: "รับออเดอร์",
      detail: "ระบบบันทึกออเดอร์และตัด stock แล้ว",
      state: "complete",
      date: order.createdAt,
    },
    {
      key: "processing",
      title: "กำลังเตรียมสินค้า",
      detail: "ทีมร้านค้ากำลังตรวจสอบสินค้าและแพ็กออเดอร์",
      state:
        order.status === "PROCESSING"
          ? "current"
          : order.status === "SHIPPED" || order.status === "DELIVERED"
            ? "complete"
            : "pending",
      date: null,
    },
    {
      key: "shipped",
      title: "จัดส่งแล้ว",
      detail: "ออเดอร์ออกจากร้านแล้ว",
      state:
        order.status === "SHIPPED"
          ? "current"
          : order.status === "DELIVERED"
            ? "complete"
            : "pending",
      date: order.shippedAt,
    },
    {
      key: "delivered",
      title: "ส่งสำเร็จ",
      detail: "ออเดอร์ถึงปลายทางแล้ว",
      state: order.status === "DELIVERED" ? "complete" : "pending",
      date: order.deliveredAt,
    },
  ]
}
