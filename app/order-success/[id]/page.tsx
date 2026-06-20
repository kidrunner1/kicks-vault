import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import AppLogo from "@/app/component/ui/AppLogo"
import { formatAddress } from "@/lib/address"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  paymentMethodLabels,
  paymentStatusDescriptions,
  paymentStatusLabels,
  paymentStatusToneClass,
} from "@/lib/payment"
import { prisma } from "@/lib/prisma"
import { uiAction } from "@/lib/ui-interactions"

interface Props {
  params: Promise<{
    id: string
  }>
}

const nextSteps = [
  {
    label: "บันทึกออเดอร์แล้ว",
    detail: "ออเดอร์นี้ดูย้อนหลังได้ในประวัติการสั่งซื้อ",
    icon: ReceiptText,
  },
  {
    label: "ตัด Stock แล้ว",
    detail: "ระบบหักจำนวนไซซ์ที่เลือกตอนสร้างออเดอร์",
    icon: PackageCheck,
  },
  {
    label: "ยืนยัน Session แล้ว",
    detail: "เฉพาะบัญชีของคุณเท่านั้นที่ดูหน้านี้ยืนยันนี้ได้",
    icon: ShieldCheck,
  },
]

export default async function OrderSuccessPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
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
  })

  if (!order) notFound()

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const placedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt)
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

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/product"
            className={`text-sm ${uiAction.ghost}`}
          >
            <AppLogo compact subLabel="เลือกซื้อต่อ" />
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#1f6a3a]">
            <CheckCircle2 size={16} />
            ยืนยันออเดอร์แล้ว
          </span>
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-lg border border-black/10 bg-black p-6 text-white md:p-8">
            <div className="flex min-h-[520px] flex-col justify-between gap-10">
              <div>
                <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                  <CheckCircle2 size={28} />
                </div>
                <p className="text-sm text-white/55">
                  Order #{order.id.slice(0, 8)}
                </p>
                <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-[0.92] md:text-7xl">
                  ออเดอร์ของคุณเข้าระบบแล้ว
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 md:text-base">
                  ระบบสร้างออเดอร์จากราคาจริงใน Database และ Stock ไซซ์ที่พร้อมขาย คุณสามารถดูใบสรุปเต็มได้จากบัญชีของคุณ
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">วันที่สั่งซื้อ</p>
                  <p className="mt-2 text-sm font-medium">{placedAt}</p>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">จำนวนคู่</p>
                  <p className="mt-2 text-sm font-medium">{itemCount}</p>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">รวมทั้งหมด</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatCurrency(order.total.toString())}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">ชำระเงิน</p>
                  <p className="mt-2 text-sm font-medium">
                    {paymentStatusLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-black/50">ใบสรุปออเดอร์</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    ทั้งหมด {itemCount} คู่
                  </h2>
                </div>
                <span className="rounded-full bg-[#eef7f0] px-3 py-1.5 text-xs text-[#1f6a3a]">
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-black/10">
                {order.items.map((item) => {
                  const imageUrl = normalizeImagePath(item.shoe.images[0]?.url)

                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-[#f4f3ef]">
                        <Image
                          src={imageUrl}
                          alt={item.shoe.name}
                          fill
                          sizes="64px"
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {item.shoe.name}
                        </p>
                        <p className="mt-1 text-sm text-black/50">
                          ไซซ์ {item.size} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 border-t border-black/10 pt-5">
                <div className="flex items-center justify-between font-semibold">
                  <span>รวมทั้งหมด</span>
                  <span>{formatCurrency(order.total.toString())}</span>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-[#f4f3ef] p-4">
                <div className="flex items-start gap-3">
                  <CreditCard size={18} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {paymentMethodLabel}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusToneClass[order.paymentStatus]}`}
                      >
                        {paymentStatusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-black/55">
                      {paymentStatusDescriptions[order.paymentStatus]}
                    </p>
                    {order.paidAt && (
                      <p className="mt-2 text-xs text-black/45">
                        Mock paid เมื่อ{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(order.paidAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href={`/account/orders/${order.id}`}
                className={`mt-6 h-12 w-full px-6 text-sm font-semibold ${uiAction.accent}`}
              >
                ดูรายละเอียดออเดอร์
                <ArrowRight size={15} />
              </Link>
            </div>

            {shippingAddress && (
              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
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

            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <Truck size={18} />
                <h2 className="text-lg font-semibold">
                  ขั้นตอนถัดไป
                </h2>
              </div>

              <div className="space-y-4">
                {nextSteps.map((step) => {
                  const Icon = step.icon

                  return (
                    <div key={step.label} className="flex gap-3">
                      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4f3ef]">
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {step.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-black/55">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
