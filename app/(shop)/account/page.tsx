import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AccountPage() {

  const user = await getCurrentUser()
  if (!user) return null

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

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
                Orders
              </p>
              <p className="text-xl font-medium">
                {totalOrders}
              </p>
            </div>

            <div>
              <p className="text-white/50 uppercase tracking-wider text-xs mb-2">
                Total Spent
              </p>
              <p className="text-xl font-medium">
                ${totalSpent.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-white/50 uppercase tracking-wider text-xs mb-2">
                Status
              </p>
              <p className="text-xl font-medium text-green-400">
                Active
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
              Account Details
            </h3>

            <div className="space-y-4 text-sm text-black/70">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Member Since:</span> 2026</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-10">

          <div className="bg-white border border-black/10 rounded-3xl p-8">
            <h3 className="text-lg font-semibold mb-8">
              Recent Orders
            </h3>

            {orders.length === 0 && (
              <p className="text-black/50 text-sm">
                No orders yet.
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
                    <p className="text-sm text-black/50">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-black/50">
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}