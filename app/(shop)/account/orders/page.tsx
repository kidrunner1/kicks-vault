import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  Clock3,
  CreditCard,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import {
  ACCOUNT_ORDER_HISTORY_TABS,
  getAccountOrderHistoryTab,
  getAccountOrderStatusFilter,
  getAccountOrderTabCounts,
  type AccountOrderHistoryTab,
} from "@/lib/account-orders"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusToneClass,
} from "@/lib/payment"
import { prisma } from "@/lib/prisma"
import { filterActionClass, uiAction } from "@/lib/ui-interactions"

interface OrdersPageProps {
  searchParams?: Promise<{
    status?: string | string[]
  }>
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date)
}

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-[#eef7f0] text-[#1f6a3a]"
  if (status === "CANCELLED") return "bg-red-50 text-red-600"
  if (status === "SHIPPED") return "bg-blue-50 text-blue-700"
  if (status === "PROCESSING") return "bg-sky-50 text-sky-700"

  return "border border-black bg-[#d8ff6a] text-black"
}

function orderStatusLabel(status: string) {
  if (status === "DELIVERED") return "ส่งสำเร็จ"
  if (status === "CANCELLED") return "ยกเลิกแล้ว"
  if (status === "SHIPPED") return "จัดส่งแล้ว"
  if (status === "PROCESSING") return "กำลังเตรียมสินค้า"

  return "รอดำเนินการ"
}

function emptyOrderTitle(tab: AccountOrderHistoryTab) {
  if (tab === "cancelled") return "ยังไม่มีออเดอร์ที่ยกเลิก"
  if (tab === "delivered") return "ยังไม่มีออเดอร์ที่ส่งสำเร็จ"
  if (tab === "all") return "ยังไม่มีออเดอร์"

  return "ไม่มีออเดอร์ที่กำลังดำเนินการ"
}

function emptyOrderDescription(tab: AccountOrderHistoryTab) {
  if (tab === "cancelled") {
    return "ออเดอร์ที่ยกเลิกแล้วจะถูกเก็บไว้ที่นี่ เพื่อดูเหตุผลและตรวจสอบย้อนหลังได้"
  }

  if (tab === "delivered") {
    return "เมื่อร้านค้าจัดส่งสำเร็จ ออเดอร์จะถูกย้ายมาอยู่ในหมวดนี้"
  }

  if (tab === "all") {
    return "ใบสรุปออเดอร์จะแสดงที่นี่หลัง Checkout จากสินค้าที่มี stock พร้อมขาย"
  }

  return "เมื่อออเดอร์ถูกยกเลิกหรือส่งสำเร็จแล้ว จะไม่ปะปนอยู่ในหมวดกำลังดำเนินการ"
}

function emptyOrderAction(tab: AccountOrderHistoryTab) {
  if (tab === "active" || tab === "all") {
    return {
      href: "/product",
      label: "เลือกซื้อจาก vault",
    }
  }

  return {
    href: "/account/orders?status=active",
    label: "ดูออเดอร์ที่กำลังดำเนินการ",
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const activeTab = getAccountOrderHistoryTab(params?.status)
  const statusFilter = getAccountOrderStatusFilter(activeTab)

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

  const visibleOrders = statusFilter
    ? orders.filter((order) =>
        (statusFilter as readonly string[]).includes(order.status),
      )
    : orders
  const tabCounts = getAccountOrderTabCounts(orders)
  const activeTabMeta =
    ACCOUNT_ORDER_HISTORY_TABS.find((tab) => tab.key === activeTab) ??
    ACCOUNT_ORDER_HISTORY_TABS[0]
  const totalSpent = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + Number(order.total), 0)
  const emptyAction = emptyOrderAction(activeTab)

  return (
    <div className="space-y-10">
      <header className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm text-black/50">ประวัติการสั่งซื้อ</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">
            ออเดอร์ของคุณ
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
            ดูออเดอร์ตามสถานะ ติดตามคู่ที่กำลังจัดส่ง และเก็บออเดอร์ที่ยกเลิกไว้ตรวจสอบย้อนหลัง
          </p>
        </div>

        <Link
          href="/product"
          className={`h-11 px-5 text-sm font-semibold lg:justify-self-end ${uiAction.accent}`}
        >
          เลือกซื้อสินค้า
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <StatCard
          icon={ReceiptText}
          label="ออเดอร์ทั้งหมด"
          value={tabCounts.all.toString()}
        />
        <StatCard
          icon={Clock3}
          label="กำลังดำเนินการ"
          value={tabCounts.active.toString()}
        />
        <StatCard
          icon={PackageCheck}
          label="ส่งสำเร็จ"
          value={tabCounts.delivered.toString()}
        />
        <StatCard
          icon={XCircle}
          label="ยกเลิกแล้ว"
          value={tabCounts.cancelled.toString()}
        />
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="mb-3">
          <h2 className="font-semibold text-black">สถานะออเดอร์</h2>
          <p className="mt-1 text-sm text-black/55">
            {activeTabMeta.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCOUNT_ORDER_HISTORY_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/account/orders?status=${tab.key}`}
              className={filterActionClass({
                active: activeTab === tab.key,
                className: "h-10 px-4 text-sm font-semibold",
              })}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-black">
                {tabCounts[tab.key]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {orders.length === 0 ? (
        <section className="grid gap-6 rounded-lg border border-black/10 bg-[#f4f3ef] p-6 md:grid-cols-[1fr_240px]">
          <div>
            <h2 className="text-2xl font-semibold">ยังไม่มีออเดอร์</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/55">
              ใบสรุปออเดอร์จะแสดงที่นี่หลัง Checkout เริ่มจากเลือกสินค้าที่มี stock และไซซ์ที่พร้อมขาย
            </p>
            <Link
              href="/product"
              className={`mt-6 px-5 py-3 text-sm font-semibold ${uiAction.accent}`}
            >
              เลือกซื้อจาก vault
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
      ) : visibleOrders.length === 0 ? (
        <section className="rounded-lg border border-black/10 bg-[#f4f3ef] p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-2xl font-semibold">{emptyOrderTitle(activeTab)}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-black/55">
            {emptyOrderDescription(activeTab)}
          </p>
          <Link
            href={emptyAction.href}
            className={`mt-6 px-5 py-3 text-sm font-semibold ${uiAction.accent}`}
          >
            {emptyAction.label}
            <ArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {visibleOrders.map((order) => {
            const pairCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
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
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusClass(order.status)}`}
                        >
                          {orderStatusLabel(order.status)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-medium ${paymentStatusToneClass[order.paymentStatus]}`}
                        >
                          {paymentStatusLabels[order.paymentStatus]}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm text-black/55">
                        {previewNames}
                        {remainingNames > 0 ? `, +${remainingNames} more` : ""}
                      </p>
                      <p className="mt-1 text-sm text-black/60">
                        {formatOrderDate(order.createdAt)} / {pairCount} คู่
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-black/55">
                    <CreditCard size={16} />
                    {paymentMethodLabels[order.paymentMethod]}
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="lg:text-right">
                      <p className="text-xs text-black/60">รวมทั้งหมด</p>
                      <p className="mt-1 font-semibold">
                        {formatCurrency(order.total.toString())}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition group-hover:border-black group-hover:bg-[#d8ff6a] group-hover:text-black">
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
                ยอดซื้อสะสม
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <p className="max-w-md text-sm leading-7 text-black/55">
              ยอดนี้ไม่นับออเดอร์ที่ยกเลิกแล้ว ส่วนออเดอร์ที่ยกเลิกยังคงอยู่ในประวัติเพื่อตรวจสอบย้อนหลัง
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
