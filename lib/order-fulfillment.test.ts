import test from "node:test"
import assert from "node:assert/strict"
import {
  USER_CANCEL_WINDOW_MINUTES,
  buildFulfillmentTimeline,
  canTransitionOrderStatus,
  formatCustomerCancelReason,
  getAllowedFulfillmentTransitions,
  getUserCancelDeadline,
  getUserCancelEligibility,
  paymentStatusAfterCancellation,
  validateFulfillmentTransition,
} from "./order-fulfillment"

test("order status transitions follow the fulfillment workflow", () => {
  assert.deepEqual(getAllowedFulfillmentTransitions("PENDING"), [
    "PROCESSING",
    "CANCELLED",
  ])
  assert.equal(canTransitionOrderStatus("PENDING", "PROCESSING"), true)
  assert.equal(canTransitionOrderStatus("PROCESSING", "SHIPPED"), true)
  assert.equal(canTransitionOrderStatus("SHIPPED", "DELIVERED"), true)
  assert.equal(canTransitionOrderStatus("DELIVERED", "CANCELLED"), true)
  assert.equal(canTransitionOrderStatus("PENDING", "DELIVERED"), false)
  assert.equal(canTransitionOrderStatus("CANCELLED", "PROCESSING"), false)
})

test("shipping requires carrier and tracking number", () => {
  const missingTracking = validateFulfillmentTransition({
    currentStatus: "PROCESSING",
    nextStatus: "SHIPPED",
    shippingCarrier: "Kerry Express",
    trackingNumber: "",
  })

  assert.equal(missingTracking.ok, false)
  assert.match(missingTracking.message, /Tracking/)

  const validShipping = validateFulfillmentTransition({
    currentStatus: "PROCESSING",
    nextStatus: "SHIPPED",
    shippingCarrier: "Kerry Express",
    trackingNumber: "KRY123456",
  })

  assert.equal(validShipping.ok, true)
})

test("cancellation requires reason and paid orders become refunded", () => {
  const missingReason = validateFulfillmentTransition({
    currentStatus: "PENDING",
    nextStatus: "CANCELLED",
    cancelReason: " ",
  })

  assert.equal(missingReason.ok, false)
  assert.match(missingReason.message, /เหตุผล/)
  assert.equal(paymentStatusAfterCancellation("PAID"), "REFUNDED")
  assert.equal(paymentStatusAfterCancellation("UNPAID"), "UNPAID")
})

test("timeline shows cancelled state instead of continuing normal progress", () => {
  const createdAt = new Date("2026-06-21T08:00:00.000Z")
  const cancelledAt = new Date("2026-06-21T09:00:00.000Z")
  const timeline = buildFulfillmentTimeline({
    status: "CANCELLED",
    createdAt,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt,
    cancelReason: "ลูกค้าขอยกเลิก",
  })

  assert.deepEqual(
    timeline.map((step) => step.state),
    ["complete", "cancelled"],
  )
  assert.equal(timeline[1].title, "ยกเลิกออเดอร์")
  assert.equal(timeline[1].date, cancelledAt)
})

test("user cancellation is available only while pending within the window", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:29:00.000Z")
  const eligibility = getUserCancelEligibility(
    {
      status: "PENDING",
      createdAt,
      cancelledAt: null,
      stockRestoredAt: null,
    },
    now,
  )

  assert.equal(USER_CANCEL_WINDOW_MINUTES, 30)
  assert.equal(eligibility.canCancel, true)
  assert.equal(eligibility.reason, "ยกเลิกเองได้อีก 1 นาที")
  assert.equal(eligibility.deadline.toISOString(), "2026-06-22T10:30:00.000Z")
  assert.equal(eligibility.remainingMs, 60_000)
})

test("user cancellation closes after the thirty minute window", () => {
  const eligibility = getUserCancelEligibility(
    {
      status: "PENDING",
      createdAt: new Date("2026-06-22T10:00:00.000Z"),
      cancelledAt: null,
      stockRestoredAt: null,
    },
    new Date("2026-06-22T10:30:00.000Z"),
  )

  assert.equal(eligibility.canCancel, false)
  assert.equal(eligibility.reason, "หมดเวลายกเลิกเองแล้ว")
  assert.equal(eligibility.remainingMs, 0)
})

test("user cancellation closes when fulfillment has started", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:05:00.000Z")

  assert.deepEqual(
    getUserCancelEligibility(
      {
        status: "PROCESSING",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: null,
      },
      now,
    ),
    {
      canCancel: false,
      reason: "ออเดอร์กำลังเตรียมสินค้าแล้ว",
      deadline: getUserCancelDeadline(createdAt),
      remainingMs: 25 * 60 * 1000,
    },
  )

  assert.equal(
    getUserCancelEligibility(
      {
        status: "SHIPPED",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: null,
      },
      now,
    ).reason,
    "ออเดอร์จัดส่งแล้ว",
  )
})

test("user cancellation closes for cancelled or restored orders", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:05:00.000Z")

  assert.equal(
    getUserCancelEligibility(
      {
        status: "CANCELLED",
        createdAt,
        cancelledAt: new Date("2026-06-22T10:03:00.000Z"),
        stockRestoredAt: new Date("2026-06-22T10:03:00.000Z"),
      },
      now,
    ).reason,
    "ออเดอร์นี้ถูกยกเลิกแล้ว",
  )

  assert.equal(
    getUserCancelEligibility(
      {
        status: "PENDING",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: new Date("2026-06-22T10:03:00.000Z"),
      },
      now,
    ).reason,
    "ออเดอร์นี้คืน stock แล้ว",
  )
})

test("customer cancellation reason is prefixed for admin context", () => {
  assert.equal(
    formatCustomerCancelReason("  สั่งผิดไซซ์  "),
    "ลูกค้ายกเลิก: สั่งผิดไซซ์",
  )
})
