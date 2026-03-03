import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function OrdersPage() {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-12">

      <div>
        <h1 className="text-3xl font-semibold">
          Order History
        </h1>
        <p className="text-sm text-black/50 mt-2">
          Track and review your previous purchases.
        </p>
      </div>

      {orders.length === 0 && (
        <div className="bg-white border border-black/10 rounded-3xl p-10 text-center">
          <p className="text-black/50">
            No orders yet.
          </p>
        </div>
      )}

      <div className="space-y-6">

        {orders.map(order => {

          const itemCount = order.items.length

          return (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="
                block
                bg-white
                border
                border-black/10
                rounded-3xl
                p-8
                hover:shadow-md
                transition
              "
            >

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

                {/* LEFT */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/40 mb-2">
                    Order
                  </p>
                  <p className="text-lg font-medium">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-black/50 mt-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* MIDDLE */}
                <div className="text-sm text-black/60">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-sm text-black/40 mb-2">
                    Total
                  </p>
                  <p className="text-lg font-medium">
                    ${Number(order.total).toFixed(2)}
                  </p>

                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-black text-white text-xs uppercase tracking-wider">
                    {order.status}
                  </span>
                </div>

              </div>

            </Link>
          )
        })}

      </div>

    </div>
  )
}