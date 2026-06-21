import test from "node:test"
import assert from "node:assert/strict"
import {
  ACTIVE_ACCOUNT_ORDER_STATUSES,
  getAccountInitial,
  getAccountReadiness,
  getMemberSinceLabel,
  isActiveAccountOrderStatus,
} from "./account-center"

test("account center exposes active order statuses for account summaries", () => {
  assert.deepEqual(ACTIVE_ACCOUNT_ORDER_STATUSES, [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
  ])
  assert.equal(isActiveAccountOrderStatus("PENDING"), true)
  assert.equal(isActiveAccountOrderStatus("PROCESSING"), true)
  assert.equal(isActiveAccountOrderStatus("SHIPPED"), true)
  assert.equal(isActiveAccountOrderStatus("DELIVERED"), false)
  assert.equal(isActiveAccountOrderStatus("CANCELLED"), false)
})

test("account center derives a stable profile initial", () => {
  assert.equal(getAccountInitial("buyer@example.com"), "B")
  assert.equal(getAccountInitial("  collector@example.com"), "C")
  assert.equal(getAccountInitial(""), "K")
})

test("account center formats member since labels with an explicit locale", () => {
  assert.equal(
    getMemberSinceLabel(new Date("2026-06-15T00:00:00.000Z"), "en-US"),
    "Jun 2026",
  )
})

test("account center builds readiness actions from real account state", () => {
  assert.deepEqual(
    getAccountReadiness({
      hasDefaultAddress: false,
      orderCount: 0,
      favoriteCount: 2,
    }),
    [
      {
        key: "address",
        label: "บันทึกที่อยู่หลัก",
        description: "เพิ่มที่อยู่จัดส่งเพื่อ Checkout ได้เร็วขึ้น",
        complete: false,
        href: "/account/addresses",
        actionLabel: "เพิ่มที่อยู่",
      },
      {
        key: "orders",
        label: "มีประวัติออเดอร์",
        description: "เริ่มสั่งซื้อเพื่อดูสถานะและประวัติย้อนหลัง",
        complete: false,
        href: "/product",
        actionLabel: "เลือกซื้อสินค้า",
      },
      {
        key: "favorites",
        label: "บันทึกรายการโปรด",
        description: "เก็บคู่ที่สนใจไว้กลับมาดูภายหลัง",
        complete: true,
        href: "/account/favorites",
        actionLabel: "ดูรายการโปรด",
      },
    ],
  )
})
