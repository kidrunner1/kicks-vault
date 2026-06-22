import { ACTIVE_ACCOUNT_ORDER_STATUSES } from "./account-center"

export const ACCOUNT_ORDER_HISTORY_TABS = [
  {
    key: "active",
    label: "กำลังดำเนินการ",
    description: "ออเดอร์ที่ยังรอจัดการหรืออยู่ระหว่างจัดส่ง",
  },
  {
    key: "all",
    label: "ทั้งหมด",
    description: "ประวัติออเดอร์ทุกสถานะ",
  },
  {
    key: "delivered",
    label: "ส่งสำเร็จ",
    description: "ออเดอร์ที่ส่งถึงแล้ว",
  },
  {
    key: "cancelled",
    label: "ยกเลิกแล้ว",
    description: "ออเดอร์ที่ถูกยกเลิกและคืน stock แล้ว",
  },
] as const

export type AccountOrderHistoryTab =
  (typeof ACCOUNT_ORDER_HISTORY_TABS)[number]["key"]

export interface AccountOrderStatusInput {
  status: string
}

const accountOrderTabKeys = ACCOUNT_ORDER_HISTORY_TABS.map((tab) => tab.key)

export function getAccountOrderHistoryTab(
  value: string | string[] | undefined,
): AccountOrderHistoryTab {
  const normalized = Array.isArray(value) ? value[0] : value

  return accountOrderTabKeys.includes(normalized as AccountOrderHistoryTab)
    ? (normalized as AccountOrderHistoryTab)
    : "active"
}

export function getAccountOrderStatusFilter(tab: AccountOrderHistoryTab) {
  if (tab === "active") return [...ACTIVE_ACCOUNT_ORDER_STATUSES]
  if (tab === "delivered") return ["DELIVERED"] as const
  if (tab === "cancelled") return ["CANCELLED"] as const

  return undefined
}

export function isOrderVisibleInHistoryTab(
  status: string,
  tab: AccountOrderHistoryTab,
) {
  const statuses = getAccountOrderStatusFilter(tab)

  return statuses ? (statuses as readonly string[]).includes(status) : true
}

export function getAccountOrderTabCounts(
  orders: readonly AccountOrderStatusInput[],
): Record<AccountOrderHistoryTab, number> {
  return {
    active: orders.filter((order) =>
      isOrderVisibleInHistoryTab(order.status, "active"),
    ).length,
    all: orders.length,
    delivered: orders.filter((order) =>
      isOrderVisibleInHistoryTab(order.status, "delivered"),
    ).length,
    cancelled: orders.filter((order) =>
      isOrderVisibleInHistoryTab(order.status, "cancelled"),
    ).length,
  }
}
