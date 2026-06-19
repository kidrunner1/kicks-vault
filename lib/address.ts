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
  const parsed = addressInputSchema.parse(input)

  return {
    ...parsed,
    addressLine2: parsed.addressLine2?.trim() || "",
  }
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
