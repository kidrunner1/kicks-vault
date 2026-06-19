"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  BadgeCheck,
  CreditCard,
  LockKeyhole,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { createOrder } from "@/app/actions/create-order"
import { useCartStore } from "@/app/store/cart-store"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"

type CheckoutDetails = {
  name: string
  phone: string
  address: string
}

const initialCheckoutDetails: CheckoutDetails = {
  name: "",
  phone: "",
  address: "",
}

const trustItems: { label: string; icon: LucideIcon }[] = [
  { label: "Database prices", icon: ShieldCheck },
  { label: "Stock checked", icon: PackageCheck },
  { label: "Secure session", icon: LockKeyhole },
  { label: "Fast dispatch", icon: Truck },
]

export default function CartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>(
    initialCheckoutDetails
  )

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore()

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  )
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const shipping = 0
  const total = subtotal + shipping
  const checkoutReady =
    checkoutDetails.name.trim().length > 1 &&
    checkoutDetails.phone.trim().length > 4 &&
    checkoutDetails.address.trim().length > 8
  const isCheckoutDisabled = loading || items.length === 0 || !checkoutReady

  const handleDetailChange = (field: keyof CheckoutDetails, value: string) => {
    setCheckoutDetails((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCheckout = async () => {
    if (loading || items.length === 0) return

    if (!checkoutReady) {
      toast.error("Add delivery details before checkout")
      return
    }

    setLoading(true)

    try {
      const orderId = await createOrder({
        items: items.map((item) => ({
          shoeId: item.shoeId,
          size: item.size,
          quantity: item.quantity,
        })),
      })

      clearCart()
      router.push(`/order-success/${orderId}`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to process order."

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] px-6 pb-24 pt-8 text-black md:px-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/product"
            className="inline-flex items-center gap-3 text-sm text-black/60 transition hover:text-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20">
              <ArrowLeft size={15} />
            </span>
            <span className="leading-tight">
              <span className="block font-medium tracking-wide text-black">
                KICKS VAULT
              </span>
              <span className="block text-xs">
                Back to Store
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-2 text-xs text-black/55">
            {trustItems.slice(0, 3).map((item) => {
              const Icon = item.icon

              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2"
                >
                  <Icon size={14} />
                  {item.label}
                </span>
              )
            })}
          </div>
        </div>

        <header className="mb-8 grid gap-4 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm text-black/50">
              Checkout review
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-[0.92] md:text-6xl">
              Review your order.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-7 text-black/55 lg:justify-self-end">
            Confirm the pairs, delivery contact, and stock-backed quantities before creating the order.
          </p>
        </header>

        {items.length === 0 ? (
          <section className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 md:grid-cols-[1fr_320px] md:p-8">
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="text-sm text-black/50">Cart is empty</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight">
                  Your next pair is still waiting in the vault.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">
                  Browse men, women, and kids selections, then choose a live size before checkout.
                </p>
              </div>

              <Link
                href="/product"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse products
                <ArrowLeft size={15} className="rotate-180" />
              </Link>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-lg bg-[#f4f3ef]">
              <Image
                src="/images/shoes/mock-white-runner.svg"
                alt="White sneaker mockup"
                fill
                sizes="320px"
                className="object-contain p-8"
              />
            </div>
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="space-y-5">
              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Cart items
                    </h2>
                    <p className="mt-1 text-sm text-black/50">
                      {itemCount} {itemCount === 1 ? "pair" : "pairs"} reserved from your local cart.
                    </p>
                  </div>
                  <Link
                    href="/product"
                    className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/55 transition hover:border-black/25 hover:text-black"
                  >
                    Add more
                  </Link>
                </div>

                <div className="divide-y divide-black/10">
                  {items.map((item) => (
                    <article
                      key={`${item.shoeId}-${item.size}`}
                      className="grid gap-5 py-6 md:grid-cols-[132px_1fr]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg border border-black/10 bg-[#f4f3ef]">
                        <Image
                          src={normalizeImagePath(item.image)}
                          alt={item.name}
                          fill
                          sizes="132px"
                          className="object-contain p-4"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
                        <div>
                          <p className="text-lg font-semibold leading-tight">
                            {item.name}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-black/55">
                            <span className="rounded-full bg-[#f4f3ef] px-3 py-1.5">
                              Size {item.size}
                            </span>
                            <span className="rounded-full bg-[#eef7f0] px-3 py-1.5 text-[#1f6a3a]">
                              {item.maxStock} available
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <div className="flex h-11 items-center rounded-full bg-[#f4f3ef] p-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.shoeId,
                                    item.size,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                disabled={item.quantity <= 1}
                                aria-label={`Decrease quantity for ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.shoeId,
                                    item.size,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.maxStock}
                                aria-label={`Increase quantity for ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.shoeId, item.size)}
                              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-black/45 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="min-w-36 text-left md:text-right">
                          <p className="text-sm text-black/45">Unit price</p>
                          <p className="mt-1 font-medium">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="mt-4 text-sm text-black/45">Line total</p>
                          <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trustItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-4 text-sm text-black/60"
                    >
                      <Icon size={18} />
                      {item.label}
                    </div>
                  )
                })}
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-6">
              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Truck size={18} />
                  <h2 className="text-lg font-semibold">
                    Delivery contact
                  </h2>
                </div>

                <div className="space-y-4">
                  <CheckoutField
                    label="Full name"
                    value={checkoutDetails.name}
                    onChange={(value) => handleDetailChange("name", value)}
                    placeholder="KicksVault Member"
                  />
                  <CheckoutField
                    label="Phone"
                    value={checkoutDetails.phone}
                    onChange={(value) => handleDetailChange("phone", value)}
                    placeholder="080-000-0000"
                  />
                  <label className="block">
                    <span className="text-sm text-black/55">
                      Delivery address
                    </span>
                    <textarea
                      value={checkoutDetails.address}
                      onChange={(event) =>
                        handleDetailChange("address", event.target.value)
                      }
                      rows={4}
                      placeholder="Street, district, province, postcode"
                      className="mt-2 w-full resize-none rounded-lg border border-black/10 bg-[#f4f3ef] px-3 py-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/35"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard size={18} />
                  <h2 className="text-lg font-semibold">
                    Order review
                  </h2>
                </div>

                <div className="rounded-lg bg-[#f4f3ef] p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck size={18} className="mt-0.5 text-[#1f6a3a]" />
                    <div>
                      <p className="text-sm font-medium">
                        No card charged today
                      </p>
                      <p className="mt-1 text-sm leading-6 text-black/55">
                        The order is created from live stock and database prices for review.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                  <SummaryRow
                    label="Shipping"
                    value={shipping === 0 ? "Free" : formatCurrency(shipping)}
                  />
                  <div className="border-t border-black/10 pt-4">
                    <SummaryRow
                      label="Total"
                      value={formatCurrency(total)}
                      strong
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Creating order..." : "Confirm order"}
                </button>

                {!checkoutReady && (
                  <p className="mt-3 text-xs leading-5 text-black/45">
                    Add name, phone, and address to continue.
                  </p>
                )}
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  )
}

function CheckoutField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-sm text-black/55">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-lg border border-black/10 bg-[#f4f3ef] px-3 text-sm outline-none transition placeholder:text-black/35 focus:border-black/35"
      />
    </label>
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
