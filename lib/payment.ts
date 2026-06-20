export const CHECKOUT_PAYMENT_METHODS = [
  "MANUAL",
  "BANK_TRANSFER",
  "COD",
] as const

export const CHECKOUT_PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export type CheckoutPaymentMethod = (typeof CHECKOUT_PAYMENT_METHODS)[number]
export type CheckoutPaymentStatus = (typeof CHECKOUT_PAYMENT_STATUSES)[number]

export const checkoutPaymentOptions: {
  method: CheckoutPaymentMethod
  title: string
  description: string
  badge: string
}[] = [
  {
    method: "MANUAL",
    title: "Mock instant payment",
    description: "Simulate an approved online payment without charging a card.",
    badge: "Marked paid",
  },
  {
    method: "BANK_TRANSFER",
    title: "Bank transfer",
    description: "Place the order now and let admin verify transfer details later.",
    badge: "Admin review",
  },
  {
    method: "COD",
    title: "Cash on delivery",
    description: "Pay when the order arrives. Admin can confirm payment later.",
    badge: "Pay later",
  },
]

export const paymentMethodLabels: Record<CheckoutPaymentMethod, string> = {
  MANUAL: "Mock instant payment",
  BANK_TRANSFER: "Bank transfer",
  COD: "Cash on delivery",
}

export const paymentStatusLabels: Record<CheckoutPaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

export const paymentStatusToneClass: Record<CheckoutPaymentStatus, string> = {
  UNPAID: "border border-black bg-[#d8ff6a] text-black",
  PAID: "bg-[#eef7f0] text-[#1f6a3a]",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-violet-50 text-violet-700",
}

export const paymentStatusDescriptions: Record<CheckoutPaymentStatus, string> =
  {
    UNPAID: "Payment is pending admin confirmation.",
    PAID: "Mock payment was recorded successfully.",
    FAILED: "Payment needs attention before fulfillment.",
    REFUNDED: "Payment has been marked as refunded.",
  }

export function isCheckoutPaymentMethod(
  value: string,
): value is CheckoutPaymentMethod {
  return (CHECKOUT_PAYMENT_METHODS as readonly string[]).includes(value)
}
