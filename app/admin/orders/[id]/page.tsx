import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, PackageCheck, Truck, User } from "lucide-react"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  orderFulfillmentStatusLabels,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
import { prisma } from "@/lib/prisma"
import {
  formatAdminDate,
  orderStatusLabels,
  orderStatusTones,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusTones,
  shippingAddressLines,
  shortOrderId,
} from "../order-display"
import FulfillmentStatusForm from "./FulfillmentStatusForm"
import PaymentStatusForm from "./PaymentStatusForm"

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        include: {
          shoe: {
            select: {
              name: true,
              brand: {
                select: {
                  name: true,
                },
              },
              images: {
                select: {
                  url: true,
                },
                orderBy: {
                  order: "asc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  const addressLines = shippingAddressLines(order)
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6 text-gray-100">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        กลับไปหน้าออเดอร์
      </Link>

      <header className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {shortOrderId(order.id)}
            </h1>
            <StatusBadge
              className={orderStatusTones[order.status]}
              label={orderStatusLabels[order.status]}
            />
            <StatusBadge
              className={paymentStatusTones[order.paymentStatus]}
              label={paymentStatusLabels[order.paymentStatus]}
            />
          </div>
          <p className="mt-2 break-all text-sm text-gray-500">
            ID เต็ม: {order.id}
          </p>
        </div>

        <div className="rounded-lg border border-[#d8ff6a]/30 bg-[#d8ff6a]/10 p-4">
          <p className="text-sm text-[#ecff9c]">ยอดรวมออเดอร์</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(order.total.toString())}
          </p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-6">
          <Panel
            title="สรุปออเดอร์"
            description={`ออเดอร์นี้มี ${itemCount} รายการ`}
            icon={<PackageCheck size={18} />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="สร้างเมื่อ" value={formatAdminDate(order.createdAt)} />
              <InfoRow label="อัปเดตล่าสุด" value={formatAdminDate(order.updatedAt)} />
              <InfoRow
                label="สถานะออเดอร์"
                value={orderStatusLabels[order.status]}
              />
              <InfoRow
                label="สถานะ Fulfillment"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
              <InfoRow
                label="บริษัทขนส่ง"
                value={order.shippingCarrier ?? "-"}
              />
              <InfoRow
                label="Tracking"
                value={order.trackingNumber ?? "-"}
              />
              <InfoRow
                label="สถานะ Payment"
                value={paymentStatusLabels[order.paymentStatus]}
              />
              <InfoRow
                label="วิธีชำระเงิน"
                value={paymentMethodLabels[order.paymentMethod]}
              />
              <InfoRow label="ชำระเมื่อ" value={formatAdminDate(order.paidAt)} />
            </div>
          </Panel>

          <Panel
            title="สินค้าที่สั่งซื้อ"
            description="ราคาถูกบันทึกเป็น snapshot ตอน Checkout"
            icon={<PackageCheck size={18} />}
          >
            <div className="divide-y divide-gray-800">
              {order.items.map((item) => {
                const imageUrl = normalizeImagePath(item.shoe.images[0]?.url)
                const lineTotal = Number(item.price) * item.quantity

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[88px_1fr_auto] md:items-center"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-800 bg-white">
                      <Image
                        src={imageUrl}
                        alt={item.shoe.name}
                        fill
                        sizes="88px"
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">
                        {item.shoe.brand.name}
                      </p>
                      <h2 className="mt-1 font-semibold text-white">
                        {item.shoe.name}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                        <span className="rounded-full border border-gray-700 bg-gray-950 px-3 py-1">
                          ไซซ์ {item.size ?? "-"}
                        </span>
                        <span className="rounded-full border border-gray-700 bg-gray-950 px-3 py-1">
                          จำนวน {item.quantity}
                        </span>
                        <span className="rounded-full border border-gray-700 bg-gray-950 px-3 py-1">
                          ราคาต่อคู่ {formatCurrency(item.price.toString())}
                        </span>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs text-gray-500">รวมรายการนี้</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6">
          <Panel
            title="ลูกค้า"
            description="บัญชีผู้ซื้อและผู้รับจากออเดอร์นี้"
            icon={<User size={18} />}
          >
            <div className="space-y-3">
              <InfoRow label="Email บัญชี" value={order.user.email} />
              <InfoRow
                label="ผู้รับ"
                value={order.shippingRecipientName ?? "-"}
              />
              <InfoRow label="เบอร์โทร" value={order.shippingPhone ?? "-"} />
            </div>
          </Panel>

          <Panel
            title="ที่อยู่จัดส่ง"
            description="snapshot ที่บันทึกไว้ตอน Checkout"
            icon={<MapPin size={18} />}
          >
            <div className="space-y-3">
              <InfoRow label="ชื่อที่อยู่" value={order.shippingLabel ?? "-"} />
              {addressLines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-800 bg-gray-950/60 p-4 text-sm text-gray-500">
                  ออเดอร์นี้ไม่มี snapshot ที่อยู่จัดส่ง
                </p>
              ) : (
                <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4 text-sm leading-6 text-gray-300">
                  {addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Fulfillment"
            description="อัปเดตการเตรียมสินค้า การจัดส่ง และการยกเลิกออเดอร์"
            icon={<Truck size={18} />}
          >
            <div className="mb-4 grid gap-3 text-sm">
              <InfoRow
                label="สถานะ"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
              <InfoRow
                label="จัดส่งเมื่อ"
                value={formatAdminDate(order.shippedAt)}
              />
              <InfoRow
                label="ส่งสำเร็จเมื่อ"
                value={formatAdminDate(order.deliveredAt)}
              />
              <InfoRow
                label="ยกเลิกเมื่อ"
                value={formatAdminDate(order.cancelledAt)}
              />
              <InfoRow
                label="คืน Stock เมื่อ"
                value={formatAdminDate(order.stockRestoredAt)}
              />
            </div>

            <FulfillmentStatusForm
              orderId={order.id}
              status={order.status as OrderFulfillmentStatus}
              shippingCarrier={order.shippingCarrier}
              trackingNumber={order.trackingNumber}
              cancelReason={order.cancelReason}
            />
          </Panel>

          <Panel
            title="Mock payment"
            description="สถานะจำลองสำหรับ phase นี้ ไม่มีการชำระเงินจริง"
            icon={<CreditCard size={18} />}
          >
            <PaymentStatusForm
              orderId={order.id}
              paymentStatus={order.paymentStatus}
              paymentMethod={order.paymentMethod}
              paymentNote={order.paymentNote}
            />
          </Panel>
        </aside>
      </section>
    </div>
  )
}

function Panel({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-950 text-gray-300">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-2 break-words text-sm font-medium text-gray-100">
        {value}
      </p>
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
