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
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const paymentStatusLabels: Record<PaymentStatusValue, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

export const paymentMethodLabels: Record<PaymentMethodValue, string> = {
  MANUAL: "Manual",
  BANK_TRANSFER: "Bank Transfer",
  COD: "Cash on Delivery",
}

export const orderStatusTones: Record<OrderStatusValue, string> = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  PROCESSING: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  SHIPPED: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  CANCELLED: "border-red-400/30 bg-red-400/10 text-red-100",
}

export const paymentStatusTones: Record<PaymentStatusValue, string> = {
  UNPAID: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  FAILED: "border-red-400/30 bg-red-400/10 text-red-100",
  REFUNDED: "border-violet-400/30 bg-violet-400/10 text-violet-100",
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

  return new Intl.DateTimeFormat("en-US", {
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
