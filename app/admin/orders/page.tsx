import Link from "next/link"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { ArrowRight, RotateCcw, Search } from "lucide-react"
import { formatCurrency } from "@/lib/commerce"
import { prisma } from "@/lib/prisma"
import {
  formatAdminDate,
  isOrderStatus,
  isPaymentStatus,
  orderStatusLabels,
  orderStatusTones,
  ORDER_STATUSES,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusTones,
  PAYMENT_STATUSES,
  shortOrderId,
} from "./order-display"

type SearchValue = string | string[] | undefined

interface AdminOrdersPageProps {
  searchParams?: Promise<Record<string, SearchValue>>
}

function readParam(params: Record<string, SearchValue>, key: string) {
  const value = params[key]

  return Array.isArray(value) ? value[0] : value
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = (await searchParams) ?? {}
  const query = readParam(params, "q")?.trim() ?? ""
  const statusParam = readParam(params, "status")
  const paymentParam = readParam(params, "payment")
  const activeStatus = isOrderStatus(statusParam) ? statusParam : "all"
  const activePayment = isPaymentStatus(paymentParam) ? paymentParam : "all"

  const where: Prisma.OrderWhereInput = {}

  if (activeStatus !== "all") {
    where.status = activeStatus as OrderStatus
  }

  if (activePayment !== "all") {
    where.paymentStatus = activePayment as PaymentStatus
  }

  if (query) {
    const idSearch = query.replace(/^#/, "")

    where.OR = [
      { id: { contains: idSearch, mode: "insensitive" } },
      { user: { email: { contains: query, mode: "insensitive" } } },
      { shippingRecipientName: { contains: query, mode: "insensitive" } },
      { shippingPhone: { contains: query, mode: "insensitive" } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6 text-gray-100">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review customer, shipping, order, and mock payment state from one
            protected admin view.
          </p>
        </div>
      </header>

      <form className="grid gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4 lg:grid-cols-[1fr_180px_180px_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search orders</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={17}
          />
          <input
            name="q"
            defaultValue={query}
            aria-label="Search by id, email, name, or phone"
            className="h-11 w-full rounded-lg border border-gray-700 bg-gray-950 pl-10 pr-3 text-sm text-white outline-none transition focus:border-white"
          />
        </label>

        <select
          name="status"
          defaultValue={activeStatus}
          className="h-11 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          name="payment"
          defaultValue={activePayment}
          className="h-11 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
        >
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-black bg-[#d8ff6a] px-4 text-sm font-semibold text-black transition hover:bg-white hover:text-black"
        >
          Apply
        </button>

        <Link
          href="/admin/orders"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-4 text-sm font-medium text-gray-200 transition hover:bg-gray-800 hover:text-white"
        >
          <RotateCcw size={16} />
          Reset
        </Link>
      </form>

      <section className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-gray-200">No orders found</p>
            <p className="mt-2 text-sm text-gray-500">
              Orders will appear here after checkout, or after filters are
              cleared.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              )

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-4 p-5 transition hover:bg-gray-800/60 lg:grid-cols-[1fr_1fr_140px_140px_140px_auto] lg:items-center"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {shortOrderId(order.id)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatAdminDate(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {order.user.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {order.shippingRecipientName ?? "No recipient"} -{" "}
                      {order.shippingPhone ?? "No phone"}
                    </p>
                  </div>

                  <StatusBadge
                    className={orderStatusTones[order.status]}
                    label={orderStatusLabels[order.status]}
                  />
                  <StatusBadge
                    className={paymentStatusTones[order.paymentStatus]}
                    label={paymentStatusLabels[order.paymentStatus]}
                  />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(order.total.toString())}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {itemCount} item{itemCount === 1 ? "" : "s"} -{" "}
                      {paymentMethodLabels[order.paymentMethod]}
                    </p>
                  </div>

                  <span className="inline-flex items-center justify-end gap-1 text-sm font-medium text-[#ecff9c]">
                    Details
                    <ArrowRight size={15} />
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
