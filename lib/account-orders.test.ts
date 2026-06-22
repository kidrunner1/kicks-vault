import test from "node:test"
import assert from "node:assert/strict"
import {
  getAccountOrderHistoryTab,
  getAccountOrderStatusFilter,
  getAccountOrderTabCounts,
  isOrderVisibleInHistoryTab,
} from "./account-orders"

const sampleOrders = [
  { status: "PENDING" },
  { status: "PROCESSING" },
  { status: "SHIPPED" },
  { status: "DELIVERED" },
  { status: "CANCELLED" },
]

test("account order history defaults to the active tab", () => {
  assert.equal(getAccountOrderHistoryTab(undefined), "active")
  assert.equal(getAccountOrderHistoryTab("unknown"), "active")
  assert.equal(getAccountOrderHistoryTab(["cancelled"]), "cancelled")
})

test("account order history maps tabs to status filters", () => {
  assert.deepEqual(getAccountOrderStatusFilter("active"), [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
  ])
  assert.equal(getAccountOrderStatusFilter("all"), undefined)
  assert.deepEqual(getAccountOrderStatusFilter("delivered"), ["DELIVERED"])
  assert.deepEqual(getAccountOrderStatusFilter("cancelled"), ["CANCELLED"])
})

test("account order history hides cancelled orders from the active tab", () => {
  assert.equal(isOrderVisibleInHistoryTab("PENDING", "active"), true)
  assert.equal(isOrderVisibleInHistoryTab("SHIPPED", "active"), true)
  assert.equal(isOrderVisibleInHistoryTab("DELIVERED", "active"), false)
  assert.equal(isOrderVisibleInHistoryTab("CANCELLED", "active"), false)
  assert.equal(isOrderVisibleInHistoryTab("CANCELLED", "cancelled"), true)
  assert.equal(isOrderVisibleInHistoryTab("CANCELLED", "all"), true)
})

test("account order history derives tab counts from real statuses", () => {
  assert.deepEqual(getAccountOrderTabCounts(sampleOrders), {
    active: 3,
    all: 5,
    delivered: 1,
    cancelled: 1,
  })
})
