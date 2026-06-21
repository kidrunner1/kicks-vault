import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ReceiptText,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatAddress } from "@/lib/address"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  buildFulfillmentTimeline,
  getUserCancelEligibility,
  orderFulfillmentStatusLabels,
  type FulfillmentTimelineStepState,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
import {
  paymentMethodLabels,
  paymentStatusDescriptions,
  paymentStatusLabels,
  paymentStatusToneClass,
} from "@/lib/payment"
import { prisma } from "@/lib/prisma"
import { uiAction } from "@/lib/ui-interactions"
import CancelOrderSection from "./CancelOrderSection"

interface Props {
  params: Promise<{ id: string }>
}

function formatOrderDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function statusClass(status: string) {
  if (status === "DELIVERED") return "bg-[#eef7f0] text-[#1f6a3a]"
  if (status === "CANCELLED") return "bg-red-50 text-red-600"
  if (status === "SHIPPED") return "bg-blue-50 text-blue-700"

  return "border border-black bg-[#d8ff6a] text-black"
}

function orderStatusLabel(status: string) {
  if (status === "DELIVERED") return "ส่งสำเร็จ"
  if (status === "CANCELLED") return "ยกเลิกแล้ว"
  if (status === "SHIPPED") return "จัดส่งแล้ว"
  if (status === "PROCESSING") return "กำลังเตรียมสินค้า"

  return "รอดำเนินการ"
}

export default async function OrderDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
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
      },
    },
  })

  if (!order || order.userId !== user.id) {
    redirect("/account/orders")
  }

  const pairCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const lineSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )
  const shippingAddress = order.shippingAddressLine1
    ? formatAddress({
        addressLine1: order.shippingAddressLine1,
        addressLine2: order.shippingAddressLine2,
        subdistrict: order.shippingSubdistrict ?? "",
        district: order.shippingDistrict ?? "",
        province: order.shippingProvince ?? "",
        postalCode: order.shippingPostalCode ?? "",
      })
    : null
  const paymentStatusLabel = paymentStatusLabels[order.paymentStatus]
  const paymentMethodLabel = paymentMethodLabels[order.paymentMethod]
  const fulfillmentTimeline = buildFulfillmentTimeline({
    status: order.status as OrderFulfillmentStatus,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    cancelReason: order.cancelReason,
  })
  const cancelEligibility = getUserCancelEligibility({
    status: order.status as OrderFulfillmentStatus,
    createdAt: order.createdAt,
    cancelledAt: order.cancelledAt,
    stockRestoredAt: order.stockRestoredAt,
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/account/orders"
          className={`text-sm ${uiAction.ghost}`}
        >
          <ArrowLeft size={15} />
          กลับไปประวัติออเดอร์
        </Link>

        <span className={`rounded-full px-4 py-2 text-xs font-medium ${statusClass(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>

      <header className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="text-sm text-black/50">
            ใบสรุป #{order.id.slice(0, 8)}
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">
            รายละเอียดออเดอร์
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
            สั่งซื้อเมื่อ {formatOrderDate(order.createdAt)} รวมทั้งหมด {pairCount} คู่
          </p>
        </div>

        <div className="rounded-lg border border-black/10 bg-[#f4f3ef] p-4">
          <p className="text-sm text-black/50">ยอดรวมออเดอร์</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(order.total.toString())}
          </p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="rounded-lg border border-black/10 bg-[#f4f3ef] p-5">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div className="flex items-center gap-2">
              <ReceiptText size={18} />
              <h2 className="text-lg font-semibold">
                สินค้าที่สั่งซื้อ
              </h2>
            </div>
            <span className="text-sm text-black/50">
              {order.items.length} รายการ
            </span>
          </div>

          <div className="divide-y divide-black/10">
            {order.items.map((item) => {
              const imageUrl = normalizeImagePath(item.shoe.images?.[0]?.url)
              const lineTotal = Number(item.price) * item.quantity

              return (
                <article
                  key={item.id}
                  className="grid gap-5 py-5 first:pt-0 last:pb-0 md:grid-cols-[104px_1fr_auto]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-white">
                    <Image
                      src={imageUrl}
                      alt={item.shoe.name}
                      fill
                      sizes="104px"
                      className="object-contain p-3"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-black/60">
                      {item.shoe.brand.name}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold leading-tight">
                      {item.shoe.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-black/55">
                      <span className="rounded-full bg-white px-3 py-1.5">
                        ไซซ์ {item.size}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5">
                        จำนวน {item.quantity}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5">
                        ราคาต่อคู่ {formatCurrency(item.price.toString())}
                      </span>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-black/60">รวมรายการนี้</p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <div className="rounded-lg border border-black/10 bg-[#f4f3ef] p-5">
            <div className="mb-5 flex items-center gap-2">
              <PackageCheck size={18} />
              <h2 className="text-lg font-semibold">
                สรุปออเดอร์
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <SummaryRow label="ยอดสินค้า" value={formatCurrency(lineSubtotal)} />
              <SummaryRow label="ค่าจัดส่ง" value="ฟรี" />
              <SummaryRow
                label="สถานะ"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
              <SummaryRow label="ชำระเงิน" value={paymentStatusLabel} />
              <div className="border-t border-black/10 pt-4">
                <SummaryRow
                  label="รวมทั้งหมด"
                  value={formatCurrency(order.total.toString())}
                  strong
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <CreditCard size={18} />
              <h2 className="text-lg font-semibold">
                การชำระเงิน
              </h2>
            </div>

            <div className="rounded-lg bg-[#f4f3ef] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-black/50">วิธีชำระเงิน</p>
                  <p className="mt-1 font-medium">{paymentMethodLabel}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${paymentStatusToneClass[order.paymentStatus]}`}
                >
                  {paymentStatusLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-black/55">
                {paymentStatusDescriptions[order.paymentStatus]}
              </p>
              {order.paidAt && (
                <p className="mt-3 text-xs text-black/45">
                  Mock paid เมื่อ {formatOrderDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>

          <CancelOrderSection
            orderId={order.id}
            canCancel={cancelEligibility.canCancel}
            reason={cancelEligibility.reason}
            deadlineLabel={formatOrderDate(cancelEligibility.deadline)}
          />

          {shippingAddress && (
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={18} />
                <h2 className="text-lg font-semibold">
                  ที่อยู่จัดส่ง
                </h2>
              </div>
              <p className="font-medium">
                {order.shippingRecipientName}
              </p>
              <p className="mt-1 text-sm text-black/50">
                {order.shippingPhone}
              </p>
              <p className="mt-3 text-sm leading-7 text-black/60">
                {shippingAddress}
              </p>
            </div>
          )}

          {(order.shippingCarrier || order.trackingNumber) && (
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <Truck size={18} />
                <h2 className="text-lg font-semibold">
                  ข้อมูลจัดส่ง
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="บริษัทขนส่ง"
                  value={order.shippingCarrier ?? "-"}
                />
                <SummaryRow
                  label="Tracking"
                  value={order.trackingNumber ?? "-"}
                />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <Truck size={18} />
              <h2 className="text-lg font-semibold">
                เส้นทางออเดอร์
              </h2>
            </div>

            <div className="space-y-4">
              {fulfillmentTimeline.map((step) => (
                <TrailItem
                  key={step.key}
                  active={step.state === "complete" || step.state === "current"}
                  state={step.state}
                  icon={
                    step.state === "cancelled"
                      ? XCircle
                      : step.key === "shipped"
                        ? Truck
                        : step.key === "delivered"
                          ? CheckCircle2
                          : PackageCheck
                  }
                  title={step.title}
                  detail={
                    step.date
                      ? `${step.detail} (${formatOrderDate(step.date)})`
                      : step.detail
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              href="/product"
              className={`h-12 px-5 text-sm font-semibold ${uiAction.accent}`}
            >
              เลือกซื้อต่อ
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/account"
              className={`h-12 px-5 text-sm font-medium ${uiAction.surface}`}
            >
              ภาพรวมบัญชี
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-semibold" : ""}`}>
      <span className={strong ? "text-black" : "text-black/60"}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  )
}

function TrailItem({
  active,
  state,
  icon: Icon,
  title,
  detail,
}: {
  active: boolean
  state: FulfillmentTimelineStepState
  icon: LucideIcon
  title: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          state === "cancelled"
            ? "border border-red-200 bg-red-50 text-red-600"
            : active
              ? "border border-black bg-[#d8ff6a] text-black"
              : "bg-[#f4f3ef] text-black/55"
        }`}
      >
        <Icon size={16} />
      </span>
      <div>
        <p className={active ? "text-sm font-medium" : "text-sm font-medium text-black/60"}>
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-black/50">
          {detail}
        </p>
      </div>
    </div>
  )
}
