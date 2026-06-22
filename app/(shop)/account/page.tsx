import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  Home,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"
import {
  ACTIVE_ACCOUNT_ORDER_STATUSES,
  getAccountInitial,
  getAccountReadiness,
  getMemberSinceLabel,
} from "@/lib/account-center"
import { formatAddress } from "@/lib/address"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  paymentStatusLabels,
  paymentStatusToneClass,
} from "@/lib/payment"
import { prisma } from "@/lib/prisma"
import { uiAction } from "@/lib/ui-interactions"

function formatAccountDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
  }).format(date)
}

function orderStatusLabel(status: string) {
  if (status === "DELIVERED") return "ส่งสำเร็จ"
  if (status === "CANCELLED") return "ยกเลิกแล้ว"
  if (status === "SHIPPED") return "จัดส่งแล้ว"
  if (status === "PROCESSING") return "กำลังเตรียมสินค้า"

  return "รอดำเนินการ"
}

function orderStatusClass(status: string) {
  if (status === "DELIVERED") return "bg-[#eef7f0] text-[#1f6a3a]"
  if (status === "CANCELLED") return "bg-red-50 text-red-600"
  if (status === "SHIPPED") return "bg-blue-50 text-blue-700"
  if (status === "PROCESSING") return "bg-sky-50 text-sky-700"

  return "border border-black bg-[#d8ff6a] text-black"
}

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const [
    accountOwner,
    orderSummary,
    activeOrderCount,
    latestOrders,
    addressCount,
    defaultAddress,
    favoriteCount,
    latestFavorites,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true },
    }),
    prisma.order.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        userId: user.id,
        status: { in: [...ACTIVE_ACCOUNT_ORDER_STATUSES] },
      },
    }),
    prisma.order.findMany({
      where: {
        userId: user.id,
        status: { in: [...ACTIVE_ACCOUNT_ORDER_STATUSES] },
      },
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
      orderBy: { updatedAt: "desc" },
    }),
    prisma.favorite.count({
      where: { userId: user.id },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        shoe: {
          include: {
            brand: true,
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  if (!accountOwner) redirect("/login")

  const totalOrders = orderSummary._count._all
  const totalSpent = formatCurrency(orderSummary._sum.total?.toString() ?? 0)
  const readinessItems = getAccountReadiness({
    hasDefaultAddress: Boolean(defaultAddress),
    orderCount: totalOrders,
    favoriteCount,
  })

  const stats = [
    {
      label: "ออเดอร์ทั้งหมด",
      value: totalOrders.toString(),
      helper: "ประวัติการสั่งซื้อ",
      icon: ReceiptText,
    },
    {
      label: "กำลังดำเนินการ",
      value: activeOrderCount.toString(),
      helper: "รอจัดการหรือจัดส่ง",
      icon: Clock3,
    },
    {
      label: "ที่อยู่ที่บันทึกไว้",
      value: addressCount.toString(),
      helper: "พร้อมใช้ตอน Checkout",
      icon: MapPin,
    },
    {
      label: "รายการโปรด",
      value: favoriteCount.toString(),
      helper: "คู่ที่เก็บไว้ดูต่อ",
      icon: Heart,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-xl border border-black/10 bg-[#f8f7f3]">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-8">
          <div className="min-w-0">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-black bg-black text-2xl font-semibold text-white">
                {getAccountInitial(user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-black/55">ศูนย์บัญชีของคุณ</p>
                <h1 className="mt-1 break-all text-3xl font-semibold leading-tight text-black">
                  {user.email}
                </h1>
                <p className="mt-2 text-sm text-black/60">
                  สมาชิกตั้งแต่ {getMemberSinceLabel(accountOwner.createdAt)} ·{" "}
                  {user.role === "ADMIN" ? "Admin" : "Member"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/account/orders"
                className={`h-11 px-5 text-sm font-semibold ${uiAction.accent}`}
              >
                ดูออเดอร์
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/account/addresses"
                className={`h-11 px-5 text-sm ${uiAction.surface}`}
              >
                จัดการที่อยู่
              </Link>
              <Link
                href="/product"
                className={`h-11 px-5 text-sm ${uiAction.surface}`}
              >
                เลือกซื้อสินค้า
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white px-5 py-4 md:min-w-56">
            <p className="text-sm text-black/55">ยอดซื้อรวม</p>
            <p className="mt-2 break-words text-2xl font-semibold text-black">
              {totalSpent}
            </p>
            <p className="mt-1 text-xs leading-5 text-black/50">
              คำนวณจากราคาจริงในฐานข้อมูล
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="สรุปบัญชี"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="space-y-5">
          <SectionHeader
            title="ออเดอร์ที่กำลังดำเนินการ"
            actionHref="/account/orders?status=active"
            actionLabel="ดูทั้งหมด"
          />

          {latestOrders.length === 0 ? (
            <EmptyAction
              icon={ShoppingBag}
              title={
                totalOrders > 0
                  ? "ไม่มีออเดอร์ที่กำลังดำเนินการ"
                  : "ยังไม่มีออเดอร์"
              }
              description={
                totalOrders > 0
                  ? "ออเดอร์ที่ส่งสำเร็จหรือยกเลิกแล้วถูกย้ายไปอยู่ในประวัติทั้งหมด"
                  : "เริ่มจากเลือกคู่ที่มีไซซ์พร้อมขาย แล้วประวัติการสั่งซื้อจะมาอยู่ตรงนี้"
              }
              href={totalOrders > 0 ? "/account/orders?status=all" : "/product"}
              actionLabel={totalOrders > 0 ? "ดูประวัติทั้งหมด" : "เลือกซื้อสินค้า"}
            />
          ) : (
            <div className="space-y-3">
              {latestOrders.map((order) => {
                const previewItems = order.items.slice(0, 3)
                const pairCount = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                )
                const previewNames = order.items
                  .slice(0, 2)
                  .map((item) => item.shoe.name)
                  .join(", ")
                const remainingItems = Math.max(0, order.items.length - 2)

                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="group block rounded-lg border border-black/10 bg-white p-4 transition hover:border-black/35 hover:bg-[#f8f7f3] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex shrink-0 -space-x-3">
                          {previewItems.length > 0 ? (
                            previewItems.map((item) => (
                              <div
                                key={item.id}
                                className="relative h-14 w-14 overflow-hidden rounded-full border border-black/10 bg-white"
                              >
                                <Image
                                  src={normalizeImagePath(
                                    item.shoe.images[0]?.url,
                                  )}
                                  alt={item.shoe.name}
                                  fill
                                  sizes="56px"
                                  className="object-contain p-1.5"
                                />
                              </div>
                            ))
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white">
                              <ShoppingBag size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-black">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <StatusBadge
                              label={orderStatusLabel(order.status)}
                              className={orderStatusClass(order.status)}
                            />
                            <StatusBadge
                              label={paymentStatusLabels[order.paymentStatus]}
                              className={
                                paymentStatusToneClass[order.paymentStatus]
                              }
                            />
                          </div>
                          <p className="mt-2 truncate text-sm text-black/60">
                            {previewNames || "รายละเอียดสินค้า"}
                            {remainingItems > 0
                              ? `, +${remainingItems} รายการ`
                              : ""}
                          </p>
                          <p className="mt-1 text-sm text-black/55">
                            {formatAccountDate(order.createdAt)} · {pairCount} คู่
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:justify-end">
                        <div className="md:text-right">
                          <p className="text-xs text-black/50">รวมทั้งหมด</p>
                          <p className="mt-1 font-semibold text-black">
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
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-black/10 bg-white p-5">
            <SectionHeader
              title="ที่อยู่หลัก"
              actionHref="/account/addresses"
              actionLabel="จัดการ"
              compact
            />

            {defaultAddress ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3ef]">
                    <Home size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-black">
                      {defaultAddress.label}
                    </p>
                    <p className="text-sm text-black/55">ค่าเริ่มต้น</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-black/65">
                  <p className="font-medium text-black">
                    {defaultAddress.recipientName}
                  </p>
                  <p>{defaultAddress.phone}</p>
                  <p className="leading-7">{formatAddress(defaultAddress)}</p>
                </div>
              </div>
            ) : (
              <EmptyAction
                icon={MapPin}
                title="ยังไม่มีที่อยู่หลัก"
                description="เพิ่มที่อยู่จัดส่งเพื่อให้ Checkout ครั้งต่อไปเร็วขึ้น"
                href="/account/addresses"
                actionLabel="เพิ่มที่อยู่"
                compact
              />
            )}
          </section>

          <section className="rounded-lg border border-black/10 bg-white p-5">
            <SectionHeader
              title="คู่โปรดของคุณ"
              actionHref="/account/favorites"
              actionLabel="ดูทั้งหมด"
              compact
            />

            {latestFavorites.length === 0 ? (
              <EmptyAction
                icon={Heart}
                title="ยังไม่มีรายการโปรด"
                description="กดบันทึกคู่ที่สนใจจากหน้าสินค้า แล้วกลับมาดูที่นี่"
                href="/product"
                actionLabel="เลือกดูสินค้า"
                compact
              />
            ) : (
              <div className="mt-5 space-y-3">
                {latestFavorites.map((favorite) => (
                  <Link
                    key={favorite.id}
                    href={`/product/${favorite.shoe.slug}`}
                    className="group grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg border border-black/10 bg-[#f8f7f3] p-3 transition hover:border-black/35 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white">
                      <Image
                        src={normalizeImagePath(favorite.shoe.images[0]?.url)}
                        alt={favorite.shoe.name}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {favorite.shoe.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-black/55">
                        {favorite.shoe.brand.name}
                      </p>
                      <p className="mt-1 text-sm text-black/70">
                        {favorite.shoe.price
                          ? formatCurrency(favorite.shoe.price.toString())
                          : "รอราคา"}
                      </p>
                    </div>
                    <ArrowRight
                      className="text-black/45 transition group-hover:text-black"
                      size={15}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-black/10 bg-[#f8f7f3] p-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <PackageCheck size={18} />
              </span>
              <div>
                <h2 className="font-semibold text-black">
                  ความพร้อมของบัญชี
                </h2>
                <p className="text-sm text-black/55">
                  สิ่งที่ช่วยให้การซื้อครั้งต่อไปราบรื่นขึ้น
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {readinessItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg bg-white p-3 transition hover:bg-[#f4f3ef] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      item.complete
                        ? "bg-[#eef7f0] text-[#1f6a3a]"
                        : "bg-[#d8ff6a] text-black"
                    }`}
                  >
                    {item.complete ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-black">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-black/55">
                      {item.description}
                    </span>
                  </span>
                  <span className="hidden text-xs font-semibold text-black/60 transition group-hover:text-black sm:block">
                    {item.actionLabel}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3ef]">
        <Icon size={18} />
      </div>
      <p className="text-sm text-black/55">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold text-black">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-black/50">{helper}</p>
    </div>
  )
}

function SectionHeader({
  title,
  actionHref,
  actionLabel,
  compact = false,
}: {
  title: string
  actionHref: string
  actionLabel: string
  compact?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2
        className={
          compact ? "font-semibold text-black" : "text-xl font-semibold text-black"
        }
      >
        {title}
      </h2>
      <Link href={actionHref} className={`text-sm ${uiAction.ghost}`}>
        {actionLabel}
        <ArrowRight size={14} />
      </Link>
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
      className={`rounded-full px-3 py-1 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  )
}

function EmptyAction({
  icon: Icon,
  title,
  description,
  href,
  actionLabel,
  compact = false,
}: {
  icon: LucideIcon
  title: string
  description: string
  href: string
  actionLabel: string
  compact?: boolean
}) {
  return (
    <div
      className={`rounded-lg border border-black/10 bg-[#f8f7f3] ${
        compact ? "mt-5 p-4" : "p-6"
      }`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white">
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
      <Link
        href={href}
        className={`mt-5 h-10 px-4 text-sm font-semibold ${uiAction.accent}`}
      >
        {actionLabel}
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}
