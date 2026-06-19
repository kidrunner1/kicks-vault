import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
import { formatCurrency } from "@/lib/commerce"

export default async function OrdersPage() {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          shoe: {
            include: {
              images: {
                orderBy: { order: "asc" },
                take: 1,
              },
            },
          },
        },
      },
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
          <Link
            href="/product"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm text-white hover:bg-black/80"
          >
            Browse products
          </Link>
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
                <div className="flex flex-col gap-2 text-sm text-black/60">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => {
                      const image = normalizeImagePath(item.shoe.images[0]?.url)

                      return (
                        <div
                          key={item.id}
                          className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white"
                        >
                          <Image
                            src={image}
                            alt={item.shoe.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                      )
                    })}
                  </div>
                  <span>
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-sm text-black/40 mb-2">
                    Total
                  </p>
                  <p className="text-lg font-medium">
                    {formatCurrency(order.total.toString())}
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
