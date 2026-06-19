import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { prisma } from "@/lib/prisma"

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date)
}

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-[#eef7f0] text-[#1f6a3a]"
  if (status === "CANCELLED") return "bg-red-50 text-red-600"
  if (status === "SHIPPED") return "bg-blue-50 text-blue-700"

  return "bg-black text-white"
}

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
    orderBy: { createdAt: "desc" },
  })

  const totalPairs = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  )
  const activeOrders = orders.filter((order) =>
    ["PENDING", "PROCESSING", "SHIPPED"].includes(order.status)
  ).length
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0)

  return (
    <div className="space-y-10">
      <header className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm text-black/50">
            Account receipts
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">
            Order history
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
            Review confirmed pairs, totals, stock-backed sizes, and order status in one place.
          </p>
        </div>

        <Link
          href="/product"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800 lg:justify-self-end"
        >
          Browse products
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={ReceiptText} label="Orders" value={orders.length.toString()} />
        <StatCard icon={ShoppingBag} label="Pairs" value={totalPairs.toString()} />
        <StatCard icon={Clock3} label="Active" value={activeOrders.toString()} />
      </section>

      {orders.length === 0 ? (
        <section className="grid gap-6 rounded-lg border border-black/10 bg-[#f4f3ef] p-6 md:grid-cols-[1fr_240px]">
          <div>
            <h2 className="text-2xl font-semibold">
              No orders yet.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/55">
              Your receipts will appear here after checkout. Start with a live product and select an available size.
            </p>
            <Link
              href="/product"
              className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Shop the vault
            </Link>
          </div>
          <div className="relative min-h-[220px] overflow-hidden rounded-lg bg-white">
            <Image
              src="/images/shoes/mock-white-court.svg"
              alt="White sneaker mockup"
              fill
              sizes="240px"
              className="object-contain p-8"
            />
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => {
            const pairCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )
            const previewNames = order.items
              .slice(0, 2)
              .map((item) => item.shoe.name)
              .join(", ")
            const remainingNames = Math.max(0, order.items.length - 2)

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block rounded-lg border border-black/10 bg-[#f4f3ef] p-5 transition hover:border-black/25 hover:bg-white"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_auto_150px] lg:items-center">
                  <div className="flex gap-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item) => {
                        const image = normalizeImagePath(item.shoe.images[0]?.url)

                        return (
                          <div
                            key={item.id}
                            className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10 bg-white"
                          >
                            <Image
                              src={image}
                              alt={item.shoe.name}
                              fill
                              sizes="56px"
                              className="object-contain p-1.5"
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm text-black/55">
                        {previewNames}
                        {remainingNames > 0 ? `, +${remainingNames} more` : ""}
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        {formatOrderDate(order.createdAt)} / {pairCount} {pairCount === 1 ? "pair" : "pairs"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-black/55">
                    <PackageCheck size={16} />
                    Receipt ready
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="lg:text-right">
                      <p className="text-xs text-black/60">Total</p>
                      <p className="mt-1 font-semibold">
                        {formatCurrency(order.total.toString())}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black/60 transition group-hover:bg-black group-hover:text-white">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {orders.length > 0 && (
        <footer className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-black/50">
                Lifetime spend
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <p className="max-w-md text-sm leading-7 text-black/55">
              Totals are stored from database prices at the moment each order was created.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-[#f4f3ef] p-4">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white">
        <Icon size={17} />
      </div>
      <p className="text-sm text-black/50">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
