import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function OrdersPage() {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>

      <h1 className="text-4xl mb-16 tracking-tight">
        Order History
      </h1>

      {orders.length === 0 && (
        <p className="text-white/40">
          No orders yet.
        </p>
      )}

      <div className="space-y-8">

        {orders.map(order => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="
              block
              border
              border-white/10
              rounded-2xl
              p-8
              hover:border-white/30
              transition
            "
          >

            <div className="flex justify-between items-center">

              <div>
                <p className="text-white/40 text-xs mb-2">
                  Order ID
                </p>
                <p className="text-lg">
                  {order.id}
                </p>
              </div>

              <div className="text-right">
                <p className="text-white/40 text-xs mb-2">
                  Total
                </p>
                <p className="text-lg">
                  ${order.total.toString()}
                </p>
              </div>

            </div>

          </Link>
        ))}

      </div>

    </div>
  )
}
