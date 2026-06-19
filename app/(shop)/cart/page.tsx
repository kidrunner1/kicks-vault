import CartClient, { type CheckoutAddress } from "./CartClient"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function CartPage() {
  const user = await getCurrentUser()

  const addresses = user
    ? await prisma.userAddress.findMany({
        where: { userId: user.id },
        orderBy: [
          { isDefault: "desc" },
          { updatedAt: "desc" },
        ],
      })
    : []

  const checkoutAddresses: CheckoutAddress[] = addresses.map((address) => ({
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    subdistrict: address.subdistrict,
    district: address.district,
    province: address.province,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  }))

  return (
    <CartClient
      addresses={checkoutAddresses}
      isSignedIn={Boolean(user)}
    />
  )
}
