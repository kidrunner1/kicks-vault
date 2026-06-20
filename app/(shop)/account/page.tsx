import { getCurrentUser } from "@/lib/auth"
import { formatAddress } from "@/lib/address"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { uiAction } from "@/lib/ui-interactions"
import { formatCurrency } from "@/lib/commerce"

function orderStatusLabel(status: string) {
  if (status === "DELIVERED") return "ส่งสำเร็จ"
  if (status === "CANCELLED") return "ยกเลิกแล้ว"
  if (status === "SHIPPED") return "จัดส่งแล้ว"
  if (status === "PROCESSING") return "กำลังเตรียมสินค้า"

  return "รอดำเนินการ"
}

export default async function AccountPage() {

  const user = await getCurrentUser()
  if (!user) return null

  const [orders, addressCount, defaultAddress] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.userAddress.count({
      where: { userId: user.id },
    }),
    prisma.userAddress.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
    }),
  ])

  const totalOrders = orders.length
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total), 0)

  return (
    <div className="space-y-16">

      {/* ================= COVER ================= */}
      <div className="relative bg-gradient-to-r from-black/80 to-black/60 rounded-3xl p-16 text-white overflow-hidden">

        <div className="relative z-10">

          <div className="flex items-center gap-8">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center text-3xl font-semibold">
              {user.email[0].toUpperCase()}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-semibold">
                {user.email}
              </h1>
            </div>

          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-12 text-sm">

            <div>
              <p className="text-white/50 uppercase tracking-wider text-xs mb-2">
                ออเดอร์
              </p>
              <p className="text-xl font-medium">
                {totalOrders}
              </p>
            </div>

            <div>
              <p className="text-white/50 uppercase tracking-wider text-xs mb-2">
                ยอดซื้อรวม
              </p>
              <p className="text-xl font-medium">
                {formatCurrency(totalSpent)}
              </p>
            </div>

            <div>
              <p className="text-white/50 uppercase tracking-wider text-xs mb-2">
                สถานะ
              </p>
              <p className="text-xl font-medium text-green-400">
                ใช้งานอยู่
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================= GRID CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT COLUMN */}
        <div className="space-y-10">

          <div className="bg-white border border-black/10 rounded-3xl p-8">
            <h3 className="text-lg font-semibold mb-6">
              รายละเอียดบัญชี
            </h3>

            <div className="space-y-4 text-sm text-black/70">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">สมาชิกตั้งแต่:</span> 2026</p>
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-3xl p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold">
                ที่อยู่เริ่มต้น
              </h3>
              <Link
                href="/account/addresses"
                className={`text-sm ${uiAction.ghost}`}
              >
                จัดการ
              </Link>
            </div>

            {defaultAddress ? (
              <div className="space-y-3 text-sm text-black/70">
                <p className="font-medium text-black">
                  {defaultAddress.recipientName}
                </p>
                <p>{defaultAddress.phone}</p>
                <p className="leading-7">
                  {formatAddress(defaultAddress)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm leading-7 text-black/55">
                  เพิ่มที่อยู่จัดส่งก่อน Checkout
                </p>
                <Link
                  href="/account/addresses"
                  className={`mt-5 px-4 py-2 text-sm font-semibold ${uiAction.accent}`}
                >
                  เพิ่มที่อยู่
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-10">

          <div className="bg-white border border-black/10 rounded-3xl p-8">
            <h3 className="text-lg font-semibold mb-8">
              ออเดอร์ล่าสุด
            </h3>

            {orders.length === 0 && (
              <p className="text-black/60 text-sm">
                ยังไม่มีออเดอร์
              </p>
            )}

            <div className="space-y-6">

              {orders.map(order => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex justify-between items-center border-b border-black/10 pb-4 hover:opacity-80 transition"
                >
                  <div>
                    <p className="font-medium">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-black/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.total.toString())}
                    </p>
                    <p className="text-sm text-black/60">
                      {orderStatusLabel(order.status)}
                    </p>
                  </div>
                </Link>
              ))}

            </div>

          </div>

        </div>

      </div>

      <div className="text-sm text-black/60">
        บันทึกที่อยู่ไว้ {addressCount} รายการ
      </div>

    </div>
  )
}
