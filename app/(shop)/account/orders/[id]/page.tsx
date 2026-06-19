import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  PackageCheck,
  ReceiptText,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatAddress } from "@/lib/address"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { prisma } from "@/lib/prisma"

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

  return "bg-black text-white"
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-sm text-black/55 transition hover:text-black"
        >
          <ArrowLeft size={15} />
          Back to orders
        </Link>

        <span className={`rounded-full px-4 py-2 text-xs font-medium ${statusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      <header className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <p className="text-sm text-black/50">
            Receipt #{order.id.slice(0, 8)}
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">
            Order detail
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
            Placed {formatOrderDate(order.createdAt)} with {pairCount} {pairCount === 1 ? "pair" : "pairs"}.
          </p>
        </div>

        <div className="rounded-lg border border-black/10 bg-[#f4f3ef] p-4">
          <p className="text-sm text-black/50">Order total</p>
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
                Purchased pairs
              </h2>
            </div>
            <span className="text-sm text-black/50">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
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
                    <p className="text-sm text-black/45">
                      {item.shoe.brand.name}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold leading-tight">
                      {item.shoe.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-black/55">
                      <span className="rounded-full bg-white px-3 py-1.5">
                        Size {item.size}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5">
                        Qty {item.quantity}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5">
                        Unit {formatCurrency(item.price.toString())}
                      </span>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-black/45">Line total</p>
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
                Summary
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <SummaryRow label="Items subtotal" value={formatCurrency(lineSubtotal)} />
              <SummaryRow label="Shipping" value="Free" />
              <SummaryRow label="Status" value={order.status} />
              <div className="border-t border-black/10 pt-4">
                <SummaryRow
                  label="Total"
                  value={formatCurrency(order.total.toString())}
                  strong
                />
              </div>
            </div>
          </div>

          {shippingAddress && (
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={18} />
                <h2 className="text-lg font-semibold">
                  Shipping address
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
                Order trail
              </h2>
            </div>

            <div className="space-y-4">
              <TrailItem
                active
                icon={CheckCircle2}
                title="Order created"
                detail="Database price and size stock were confirmed."
              />
              <TrailItem
                active={order.status !== "PENDING"}
                icon={PackageCheck}
                title="Preparing"
                detail="Admin stock and product basics are ready for review."
              />
              <TrailItem
                active={["SHIPPED", "DELIVERED"].includes(order.status)}
                icon={Truck}
                title="Dispatch"
                detail="Shipping status will move here when updated."
              />
            </div>
          </div>

          <div className="grid gap-3">
            <Link
              href="/product"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Continue shopping
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/account"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 px-5 text-sm font-medium text-black/60 transition hover:border-black/25 hover:text-black"
            >
              Account overview
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
  icon: Icon,
  title,
  detail,
}: {
  active: boolean
  icon: LucideIcon
  title: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-black text-white" : "bg-[#f4f3ef] text-black/35"
        }`}
      >
        <Icon size={16} />
      </span>
      <div>
        <p className={active ? "text-sm font-medium" : "text-sm font-medium text-black/40"}>
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-black/50">
          {detail}
        </p>
      </div>
    </div>
  )
}
