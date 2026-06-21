import test from "node:test"
import assert from "node:assert/strict"
import {
  buildFulfillmentTimeline,
  canTransitionOrderStatus,
  getAllowedFulfillmentTransitions,
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
