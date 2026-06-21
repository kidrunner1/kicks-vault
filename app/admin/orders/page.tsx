import Link from "next/link"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { ArrowRight, RotateCcw, Search } from "lucide-react"
import { formatCurrency } from "@/lib/commerce"
import { prisma } from "@/lib/prisma"
import {
  AdminPageHeader,
  AdminStatusBadge,
  adminButtonClass,
  adminInputClass,
  adminSelectClass,
  cn,
} from "../admin-ui"
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
    <div className="space-y-6">
      <AdminPageHeader
        title="ออเดอร์"
        description="ตรวจสอบลูกค้า ที่อยู่จัดส่ง สถานะ fulfillment และ mock payment จากหน้าเดียว"
      />

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_auto_auto]">
        <label className="relative block">
          <span className="sr-only">ค้นหาออเดอร์</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={17}
          />
          <input
            name="q"
            defaultValue={query}
            aria-label="ค้นหาด้วย id, email, ชื่อ หรือเบอร์โทร"
            className={cn(adminInputClass, "mt-0 h-11 pl-10")}
          />
        </label>

        <select
          name="status"
          defaultValue={activeStatus}
          className={cn(adminSelectClass, "mt-0")}
        >
          <option value="all">ทุกสถานะ</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          name="payment"
          defaultValue={activePayment}
          className={cn(adminSelectClass, "mt-0")}
        >
          <option value="all">ทุกสถานะ Payment</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>

        <button type="submit" className={adminButtonClass.primary}>
          ใช้ตัวกรอง
        </button>

        <Link href="/admin/orders" className={adminButtonClass.secondary}>
          <RotateCcw size={16} />
          รีเซ็ต
        </Link>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-800">ไม่พบออเดอร์</p>
            <p className="mt-2 text-sm text-slate-500">
              ออเดอร์จะแสดงที่นี่หลัง Checkout หรือล้างตัวกรองแล้ว
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              )

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_1fr_140px_140px_140px_auto] lg:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-950">
                      {shortOrderId(order.id)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatAdminDate(order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {order.user.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.shippingRecipientName ?? "ไม่มีชื่อผู้รับ"} ·{" "}
                      {order.shippingPhone ?? "ไม่มีเบอร์โทร"}
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
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(order.total.toString())}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {itemCount} รายการ ·{" "}
                      {paymentMethodLabels[order.paymentMethod]}
                    </p>
                  </div>

                  <span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-slate-900">
                    รายละเอียด
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
  return <AdminStatusBadge className={className} label={label} />
}
