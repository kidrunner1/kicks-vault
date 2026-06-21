export const ACTIVE_ACCOUNT_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
] as const

export type AccountReadinessKey = "address" | "orders" | "favorites"

export interface AccountReadinessInput {
  hasDefaultAddress: boolean
  orderCount: number
  favoriteCount: number
}

export interface AccountReadinessItem {
  key: AccountReadinessKey
  label: string
  description: string
  complete: boolean
  href: string
  actionLabel: string
}

export function isActiveAccountOrderStatus(status: string) {
  return (ACTIVE_ACCOUNT_ORDER_STATUSES as readonly string[]).includes(status)
}

export function getAccountInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "K"
}

export function getMemberSinceLabel(date: Date, locale = "th-TH") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date)
}

export function getAccountReadiness({
  hasDefaultAddress,
  orderCount,
  favoriteCount,
}: AccountReadinessInput): AccountReadinessItem[] {
  return [
    {
      key: "address",
      label: "บันทึกที่อยู่หลัก",
      description: hasDefaultAddress
        ? "พร้อมใช้ที่อยู่หลักใน Checkout"
        : "เพิ่มที่อยู่จัดส่งเพื่อ Checkout ได้เร็วขึ้น",
      complete: hasDefaultAddress,
      href: "/account/addresses",
      actionLabel: hasDefaultAddress ? "จัดการที่อยู่" : "เพิ่มที่อยู่",
    },
    {
      key: "orders",
      label: "มีประวัติออเดอร์",
      description:
        orderCount > 0
          ? "ติดตามคำสั่งซื้อและดูประวัติย้อนหลังได้"
          : "เริ่มสั่งซื้อเพื่อดูสถานะและประวัติย้อนหลัง",
      complete: orderCount > 0,
      href: orderCount > 0 ? "/account/orders" : "/product",
      actionLabel: orderCount > 0 ? "ดูออเดอร์" : "เลือกซื้อสินค้า",
    },
    {
      key: "favorites",
      label: "บันทึกรายการโปรด",
      description: "เก็บคู่ที่สนใจไว้กลับมาดูภายหลัง",
      complete: favoriteCount > 0,
      href: favoriteCount > 0 ? "/account/favorites" : "/product",
      actionLabel: favoriteCount > 0 ? "ดูรายการโปรด" : "เลือกดูสินค้า",
    },
  ]
}
