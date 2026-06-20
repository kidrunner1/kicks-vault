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
    title: "Mock payment ทันที",
    description: "จำลองการชำระเงินผ่านแล้ว โดยไม่มีการตัดบัตรจริง",
    badge: "ชำระแล้ว",
  },
  {
    method: "BANK_TRANSFER",
    title: "โอนเงินผ่านธนาคาร",
    description: "สร้างออเดอร์ไว้ก่อน แล้วให้ Admin ตรวจสอบยอดโอนภายหลัง",
    badge: "รอตรวจสอบ",
  },
  {
    method: "COD",
    title: "เก็บเงินปลายทาง",
    description: "ชำระเมื่อได้รับสินค้า แล้วให้ Admin ยืนยันสถานะภายหลัง",
    badge: "จ่ายทีหลัง",
  },
]

export const paymentMethodLabels: Record<CheckoutPaymentMethod, string> = {
  MANUAL: "Mock payment ทันที",
  BANK_TRANSFER: "โอนเงินผ่านธนาคาร",
  COD: "เก็บเงินปลายทาง",
}

export const paymentStatusLabels: Record<CheckoutPaymentStatus, string> = {
  UNPAID: "ยังไม่ชำระ",
  PAID: "ชำระแล้ว",
  FAILED: "ชำระไม่สำเร็จ",
  REFUNDED: "คืนเงินแล้ว",
}

export const paymentStatusToneClass: Record<CheckoutPaymentStatus, string> = {
  UNPAID: "border border-black bg-[#d8ff6a] text-black",
  PAID: "bg-[#eef7f0] text-[#1f6a3a]",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-violet-50 text-violet-700",
}

export const paymentStatusDescriptions: Record<CheckoutPaymentStatus, string> =
  {
    UNPAID: "สถานะการชำระเงินรอ Admin ตรวจสอบ",
    PAID: "บันทึก Mock payment สำเร็จแล้ว",
    FAILED: "การชำระเงินต้องตรวจสอบก่อนดำเนินการต่อ",
    REFUNDED: "ออเดอร์นี้ถูกทำเครื่องหมายว่าคืนเงินแล้ว",
  }

export function isCheckoutPaymentMethod(
  value: string,
): value is CheckoutPaymentMethod {
  return (CHECKOUT_PAYMENT_METHODS as readonly string[]).includes(value)
}
