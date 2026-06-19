import assert from "node:assert/strict"
import {
  addressInputSchema,
  formatAddress,
  getAddressValidationErrors,
  parseAddressInput,
  toOrderShippingSnapshot,
} from "../lib/address"

const validAddress = {
  label: "Home",
  recipientName: "KicksVault Member",
  phone: "080-000-0000",
  addressLine1: "99 Sneaker Street",
  addressLine2: "Room 12",
  subdistrict: "Pathum Wan",
  district: "Pathum Wan",
  province: "Bangkok",
  postalCode: "10330",
  isDefault: true,
}

const parsed = addressInputSchema.parse(validAddress)

assert.equal(parsed.recipientName, "KicksVault Member")
assert.equal(parsed.postalCode, "10330")

assert.equal(
  formatAddress(parsed),
  "99 Sneaker Street, Room 12, Pathum Wan, Pathum Wan, Bangkok 10330"
)

assert.throws(() =>
  addressInputSchema.parse({
    ...validAddress,
    recipientName: "",
  })
)

assert.throws(() =>
  addressInputSchema.parse({
    ...validAddress,
    postalCode: "ABC",
  })
)

const fieldErrors = getAddressValidationErrors({
  ...validAddress,
  recipientName: "",
  postalCode: "ABC",
})

assert.deepEqual(fieldErrors, {
  recipientName: "Recipient name is required",
  postalCode: "Postal code must be 5 digits",
})

assert.throws(
  () =>
    parseAddressInput({
      ...validAddress,
      recipientName: "",
      postalCode: "ABC",
    }),
  /Please complete: Recipient name, Postal code/
)

assert.deepEqual(toOrderShippingSnapshot({ id: "address-1", ...parsed }), {
  shippingAddressId: "address-1",
  shippingLabel: "Home",
  shippingRecipientName: "KicksVault Member",
  shippingPhone: "080-000-0000",
  shippingAddressLine1: "99 Sneaker Street",
  shippingAddressLine2: "Room 12",
  shippingSubdistrict: "Pathum Wan",
  shippingDistrict: "Pathum Wan",
  shippingProvince: "Bangkok",
  shippingPostalCode: "10330",
})

console.log("address helpers ok")
