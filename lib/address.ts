import { z } from "zod"

export const addressInputSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(40),
  recipientName: z.string().trim().min(1, "Recipient name is required").max(120),
  phone: z.string().trim().min(5, "Phone is required").max(30),
  addressLine1: z.string().trim().min(1, "Address is required").max(180),
  addressLine2: z.string().trim().max(180).optional().or(z.literal("")),
  subdistrict: z.string().trim().min(1, "Subdistrict is required").max(80),
  district: z.string().trim().min(1, "District is required").max(80),
  province: z.string().trim().min(1, "Province is required").max(80),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  isDefault: z.boolean().optional().default(false),
})

export type AddressInput = z.infer<typeof addressInputSchema>
export type AddressFieldErrors = Partial<Record<keyof AddressInput, string>>

const addressFieldLabels: Record<keyof AddressInput, string> = {
  label: "Label",
  recipientName: "Recipient name",
  phone: "Phone",
  addressLine1: "Address",
  addressLine2: "Address line 2",
  subdistrict: "Subdistrict",
  district: "District",
  province: "Province",
  postalCode: "Postal code",
  isDefault: "Default address",
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
      ? `Please complete: ${fieldNames}`
      : "Please check the address details"
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
