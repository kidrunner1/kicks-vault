export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export const PAYMENT_METHODS = ["MANUAL", "BANK_TRANSFER", "COD"] as const

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number]
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]

export const orderStatusLabels: Record<OrderStatusValue, string> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังเตรียมสินค้า",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิกแล้ว",
}

export const paymentStatusLabels: Record<PaymentStatusValue, string> = {
  UNPAID: "ยังไม่ชำระ",
  PAID: "ชำระแล้ว",
  FAILED: "ชำระไม่สำเร็จ",
  REFUNDED: "คืนเงินแล้ว",
}

export const paymentMethodLabels: Record<PaymentMethodValue, string> = {
  MANUAL: "Mock payment ทันที",
  BANK_TRANSFER: "โอนเงินผ่านธนาคาร",
  COD: "เก็บเงินปลายทาง",
}

export const orderStatusTones: Record<OrderStatusValue, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PROCESSING: "border-sky-200 bg-sky-50 text-sky-800",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
}

export const paymentStatusTones: Record<PaymentStatusValue, string> = {
  UNPAID: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-violet-200 bg-violet-50 text-violet-800",
}

type ShippingAddressSource = {
  shippingAddressLine1?: string | null
  shippingAddressLine2?: string | null
  shippingSubdistrict?: string | null
  shippingDistrict?: string | null
  shippingProvince?: string | null
  shippingPostalCode?: string | null
}

export function shortOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function formatAdminDate(date: Date | null | undefined) {
  if (!date) {
    return "-"
  }

  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function isOrderStatus(
  value: string | undefined,
): value is OrderStatusValue {
  return (
    value !== undefined &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  )
}

export function isPaymentStatus(
  value: string | undefined,
): value is PaymentStatusValue {
  return (
    value !== undefined &&
    (PAYMENT_STATUSES as readonly string[]).includes(value)
  )
}

export function isPaymentMethod(
  value: string | undefined,
): value is PaymentMethodValue {
  return (
    value !== undefined &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  )
}

export function shippingAddressLines(order: ShippingAddressSource) {
  return [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    joinAddressParts(", ", order.shippingSubdistrict, order.shippingDistrict),
    joinAddressParts(" ", order.shippingProvince, order.shippingPostalCode),
  ]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
}

function joinAddressParts(
  separator: string,
  ...parts: Array<string | null | undefined>
) {
  const line = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(separator)

  return line || undefined
}
