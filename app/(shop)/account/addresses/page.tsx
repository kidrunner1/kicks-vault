import { redirect } from "next/navigation"
import AddressBookClient, { type AddressView } from "./AddressBookClient"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AddressesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const addresses = await prisma.userAddress.findMany({
    where: { userId: user.id },
    orderBy: [
      { isDefault: "desc" },
      { updatedAt: "desc" },
    ],
  })

  const addressViews: AddressView[] = addresses.map((address) => ({
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
    createdAt: address.createdAt.toISOString(),
  }))

  return <AddressBookClient addresses={addressViews} />
}
