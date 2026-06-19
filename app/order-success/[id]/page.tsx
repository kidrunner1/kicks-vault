import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { prisma } from "@/lib/prisma"

interface Props {
  params: Promise<{
    id: string
  }>
}

const nextSteps = [
  {
    label: "Order saved",
    detail: "Your order is now available in account history.",
    icon: ReceiptText,
  },
  {
    label: "Stock reserved",
    detail: "Selected sizes were decremented during order creation.",
    icon: PackageCheck,
  },
  {
    label: "Session verified",
    detail: "Only your account can view this confirmation.",
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

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/product"
            className="inline-flex items-center gap-3 text-sm text-black/60 transition hover:text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 text-xs font-semibold tracking-widest">
              KV
            </span>
            <span className="leading-tight">
              <span className="block font-medium tracking-wide text-black">
                KICKS VAULT
              </span>
              <span className="block text-xs">
                Continue shopping
              </span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#1f6a3a]">
            <CheckCircle2 size={16} />
            Order confirmed
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
                  Your order is in the vault.
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 md:text-base">
                  We created the order from live product prices and available size stock. You can review the full receipt from your account.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">Placed</p>
                  <p className="mt-2 text-sm font-medium">{placedAt}</p>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">Pairs</p>
                  <p className="mt-2 text-sm font-medium">{itemCount}</p>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <p className="text-sm text-white/45">Total</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatCurrency(order.total.toString())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-black/50">Receipt</p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {itemCount} {itemCount === 1 ? "pair" : "pairs"}
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
                          Size {item.size} x {item.quantity}
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
                  <span>Total</span>
                  <span>{formatCurrency(order.total.toString())}</span>
                </div>
              </div>

              <Link
                href={`/account/orders/${order.id}`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                View order detail
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <Truck size={18} />
                <h2 className="text-lg font-semibold">
                  Next steps
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
