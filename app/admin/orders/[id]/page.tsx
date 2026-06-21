import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  PackageCheck,
  Truck,
  User,
} from "lucide-react"
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from "../../admin-ui"
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
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-black"
      >
        <ArrowLeft size={16} />
        กลับไปหน้าออเดอร์
      </Link>

      <AdminPageHeader
        title={shortOrderId(order.id)}
        description={`ID เต็ม: ${order.id}`}
        actions={
          <>
            <AdminStatusBadge
              className={orderStatusTones[order.status]}
              label={orderStatusLabels[order.status]}
            />
            <AdminStatusBadge
              className={paymentStatusTones[order.paymentStatus]}
              label={paymentStatusLabels[order.paymentStatus]}
            />
          </>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="space-y-6">
          <AdminPanel
            title="สรุปออเดอร์"
            description={`ออเดอร์นี้มี ${itemCount} รายการ`}
            icon={<PackageCheck size={18} />}
          >
            <div className="mb-5 rounded-lg border border-lime-200 bg-lime-50 p-4">
              <p className="text-sm font-semibold text-lime-900">
                ยอดรวมออเดอร์
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {formatCurrency(order.total.toString())}
              </p>
            </div>

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
              <InfoRow label="Tracking" value={order.trackingNumber ?? "-"} />
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
          </AdminPanel>

          <AdminPanel
            title="สินค้าที่สั่งซื้อ"
            description="ราคาถูกบันทึกเป็น snapshot ตอน Checkout"
            icon={<PackageCheck size={18} />}
          >
            <div className="divide-y divide-slate-200">
              {order.items.map((item) => {
                const imageUrl = normalizeImagePath(item.shoe.images[0]?.url)
                const lineTotal = Number(item.price) * item.quantity

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[88px_1fr_auto] md:items-center"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <Image
                        src={imageUrl}
                        alt={item.shoe.name}
                        fill
                        sizes="88px"
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm text-slate-500">
                        {item.shoe.brand.name}
                      </p>
                      <h2 className="mt-1 font-semibold text-slate-950">
                        {item.shoe.name}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                          ไซซ์ {item.size ?? "-"}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                          จำนวน {item.quantity}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                          ราคาต่อคู่ {formatCurrency(item.price.toString())}
                        </span>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="text-xs text-slate-500">รวมรายการนี้</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </AdminPanel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24">
          <AdminPanel
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
          </AdminPanel>

          <AdminPanel
            title="ที่อยู่จัดส่ง"
            description="snapshot ที่บันทึกไว้ตอน Checkout"
            icon={<MapPin size={18} />}
          >
            <div className="space-y-3">
              <InfoRow label="ชื่อที่อยู่" value={order.shippingLabel ?? "-"} />
              {addressLines.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  ออเดอร์นี้ไม่มี snapshot ที่อยู่จัดส่ง
                </p>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {addressLines.map((line, index) => (
                    <p key={`address-line-${index}`}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel
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
          </AdminPanel>

          <AdminPanel
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
          </AdminPanel>
        </aside>
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
  )
}
