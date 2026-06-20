import { z } from "zod"

export const addressInputSchema = z.object({
  label: z.string().trim().min(1, "กรุณาระบุชื่อที่อยู่").max(40),
  recipientName: z.string().trim().min(1, "กรุณาระบุชื่อผู้รับ").max(120),
  phone: z.string().trim().min(5, "กรุณาระบุเบอร์โทร").max(30),
  addressLine1: z.string().trim().min(1, "กรุณาระบุที่อยู่").max(180),
  addressLine2: z.string().trim().max(180).optional().or(z.literal("")),
  subdistrict: z.string().trim().min(1, "กรุณาระบุตำบล/แขวง").max(80),
  district: z.string().trim().min(1, "กรุณาระบุอำเภอ/เขต").max(80),
  province: z.string().trim().min(1, "กรุณาระบุจังหวัด").max(80),
  postalCode: z.string().trim().regex(/^\d{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก"),
  isDefault: z.boolean().optional().default(false),
})

export type AddressInput = z.infer<typeof addressInputSchema>
export type AddressFieldErrors = Partial<Record<keyof AddressInput, string>>

const addressFieldLabels: Record<keyof AddressInput, string> = {
  label: "ชื่อที่อยู่",
  recipientName: "ชื่อผู้รับ",
  phone: "เบอร์โทร",
  addressLine1: "ที่อยู่",
  addressLine2: "รายละเอียดเพิ่มเติม",
  subdistrict: "ตำบล/แขวง",
  district: "อำเภอ/เขต",
  province: "จังหวัด",
  postalCode: "รหัสไปรษณีย์",
  isDefault: "ที่อยู่เริ่มต้น",
}

export interface AddressRecord {
  id: string
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string | null
  subdistrict: string
  district: string
  province: string
  postalCode: string
}

export interface OrderShippingSnapshot {
  shippingAddressId: string
  shippingLabel: string
  shippingRecipientName: string
  shippingPhone: string
  shippingAddressLine1: string
  shippingAddressLine2: string | null
  shippingSubdistrict: string
  shippingDistrict: string
  shippingProvince: string
  shippingPostalCode: string
}

export function normalizeAddressInput(input: unknown): AddressInput {
  const parsed = parseAddressInput(input)

  return {
    ...parsed,
    addressLine2: parsed.addressLine2?.trim() || "",
  }
}

export function getAddressValidationErrors(input: unknown): AddressFieldErrors {
  const parsed = addressInputSchema.safeParse(input)

  if (parsed.success) return {}

  return parsed.error.issues.reduce<AddressFieldErrors>((errors, issue) => {
    const field = issue.path[0] as keyof AddressInput | undefined

    if (!field || field === "isDefault") return errors
    if (!errors[field]) errors[field] = issue.message

    return errors
  }, {})
}

export function parseAddressInput(input: unknown): AddressInput {
  const parsed = addressInputSchema.safeParse(input)

  if (parsed.success) return parsed.data

  const fieldNames = Object.keys(getAddressValidationErrors(input))
    .map((field) => addressFieldLabels[field as keyof AddressInput])
    .join(", ")

  throw new Error(
    fieldNames
      ? `กรุณากรอกข้อมูลให้ครบ: ${fieldNames}`
      : "กรุณาตรวจสอบรายละเอียดที่อยู่"
  )
}

export function formatAddress(address: {
  addressLine1: string
  addressLine2?: string | null
  subdistrict: string
  district: string
  province: string
  postalCode: string
}) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.subdistrict,
    address.district,
    `${address.province} ${address.postalCode}`,
  ]
    .filter(Boolean)
    .join(", ")
}

export function toOrderShippingSnapshot(
  address: AddressRecord
): OrderShippingSnapshot {
  return {
    shippingAddressId: address.id,
    shippingLabel: address.label,
    shippingRecipientName: address.recipientName,
    shippingPhone: address.phone,
    shippingAddressLine1: address.addressLine1,
    shippingAddressLine2: address.addressLine2 || null,
    shippingSubdistrict: address.subdistrict,
    shippingDistrict: address.district,
    shippingProvince: address.province,
    shippingPostalCode: address.postalCode,
  }
}
