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
  Home,
  LockKeyhole,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { createOrder } from "@/app/actions/create-order"
import AppLogo from "@/app/component/ui/AppLogo"
import { Skeleton } from "@/app/component/ui/Skeleton"
import { useCartStore } from "@/app/store/cart-store"
import { formatAddress } from "@/lib/address"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import {
  checkoutPaymentOptions,
  paymentMethodLabels,
  type CheckoutPaymentMethod,
} from "@/lib/payment"
import { filterActionClass, uiAction } from "@/lib/ui-interactions"

export interface CheckoutAddress {
  id: string
  label: string
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2: string
  subdistrict: string
  district: string
  province: string
  postalCode: string
  isDefault: boolean
}

const trustItems: { label: string; icon: LucideIcon }[] = [
  { label: "ราคาจาก Database", icon: ShieldCheck },
  { label: "เช็ก Stock แล้ว", icon: PackageCheck },
  { label: "Session ปลอดภัย", icon: LockKeyhole },
  { label: "จัดส่งรวดเร็ว", icon: Truck },
]

const paymentIcons: Record<CheckoutPaymentMethod, LucideIcon> = {
  MANUAL: CreditCard,
  BANK_TRANSFER: BadgeCheck,
  COD: Truck,
}

function checkoutSelectionClass(active: boolean) {
  return filterActionClass({
    active,
    className: "w-full items-stretch p-4 text-left",
    shape: "rounded-lg",
  })
}

export default function CartClient({
  addresses,
  isSignedIn,
}: {
  addresses: CheckoutAddress[]
  isSignedIn: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? null
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<CheckoutPaymentMethod>("MANUAL")

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
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  )
  const selectedPaymentOption = checkoutPaymentOptions.find(
    (option) => option.method === selectedPaymentMethod
  )
  const checkoutReady = Boolean(selectedAddressId)
  const isCheckoutDisabled = loading || items.length === 0 || !checkoutReady

  const handleCheckout = async () => {
    if (loading || items.length === 0) return

    if (!isSignedIn) {
      router.push("/login")
      return
    }

    if (!selectedAddressId) {
      toast.error("กรุณาเลือกที่อยู่จัดส่งก่อน Checkout")
      router.push("/account/addresses")
      return
    }

    setLoading(true)

    try {
      const orderId = await createOrder({
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
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
          : "ไม่สามารถดำเนินการออเดอร์ได้"

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
            className={`text-sm ${uiAction.ghost}`}
          >
            <ArrowLeft size={16} />
            <AppLogo compact subLabel="กลับไป Store" />
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
              ตรวจสอบก่อน Checkout
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-[0.92] md:text-6xl">
              ตรวจสอบออเดอร์ของคุณ
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-7 text-black/55 lg:justify-self-end">
            เลือกที่อยู่จัดส่งที่บันทึกไว้ แล้วตรวจจำนวนสินค้าก่อนสร้างออเดอร์
          </p>
        </header>

        {items.length === 0 ? (
          <section className="grid gap-5 rounded-lg border border-black/10 bg-white p-6 md:grid-cols-[1fr_320px] md:p-8">
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="text-sm text-black/50">ตะกร้าว่างอยู่</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight">
                  คู่ต่อไปของคุณยังรออยู่ใน vault
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">
                  เลือกดูรุ่นสำหรับ Men, Women และ Kids แล้วเลือกไซซ์ที่ยังมี Stock ก่อน Checkout
                </p>
              </div>

              <Link
                href="/product"
                className={`w-fit px-5 py-3 text-sm font-semibold ${uiAction.accent}`}
              >
                เลือกซื้อสินค้า
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
                      สินค้าในตะกร้า
                    </h2>
                    <p className="mt-1 text-sm text-black/50">
                      มีทั้งหมด {itemCount} คู่ในตะกร้าของคุณ
                    </p>
                  </div>
                  <Link
                    href="/product"
                    className={`px-4 py-2 text-sm ${uiAction.secondary}`}
                  >
                    เพิ่มสินค้า
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
                              เหลือ {item.maxStock} คู่
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
                                aria-label={`ลดจำนวน ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/10 disabled:cursor-not-allowed disabled:text-black/45"
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
                                aria-label={`เพิ่มจำนวน ${item.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/10 disabled:cursor-not-allowed disabled:text-black/45"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.shoeId, item.size)}
                              className={`px-3 py-2 text-sm ${uiAction.danger}`}
                            >
                              <Trash2 size={15} />
                              ลบออก
                            </button>
                          </div>
                        </div>

                        <div className="min-w-36 text-left md:text-right">
                          <p className="text-sm text-black/60">ราคาต่อคู่</p>
                          <p className="mt-1 font-medium">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="mt-4 text-sm text-black/60">รวมรายการนี้</p>
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
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <h2 className="text-lg font-semibold">
                      ที่อยู่จัดส่ง
                    </h2>
                  </div>
                  <Link
                    href="/account/addresses"
                    className={`text-sm ${uiAction.ghost}`}
                  >
                    จัดการ
                  </Link>
                </div>

                {!isSignedIn ? (
                  <AddressEmptyState
                    title="กรุณาเข้าสู่ระบบ"
                    description="เข้าสู่ระบบเพื่อใช้ที่อยู่จัดส่งที่บันทึกไว้"
                    href="/login"
                    action="เข้าสู่ระบบ"
                  />
                ) : addresses.length === 0 ? (
                  <AddressEmptyState
                    title="ยังไม่มีที่อยู่"
                    description="เพิ่มที่อยู่จัดส่งก่อนยืนยันออเดอร์"
                    href="/account/addresses"
                    action="เพิ่มที่อยู่"
                  />
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => {
                      const selected = selectedAddressId === address.id

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setSelectedAddressId(address.id)}
                          className={checkoutSelectionClass(selected)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                                  <Home size={12} />
                                  {address.label}
                                </span>
                                {address.isDefault && (
                                  <span className="rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-medium text-[#1f6a3a]">
                                    ค่าเริ่มต้น
                                  </span>
                                )}
                              </div>
                              <p className="mt-3 flex items-center gap-2 text-sm font-medium">
                                <UserRound size={15} />
                                {address.recipientName}
                              </p>
                              <p className="mt-1 text-sm text-black/50">
                                {address.phone}
                              </p>
                            </div>
                            <span
                              className={`mt-1 h-4 w-4 rounded-full border ${
                                selected
                                  ? "border-black bg-black"
                                  : "border-black/25 bg-white"
                              }`}
                            />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-black/55">
                            {formatAddress(address)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    <h2 className="text-lg font-semibold">
                      วิธีชำระเงิน
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#f4f3ef] px-3 py-1 text-xs text-black/55">
                    Mock เท่านั้น
                  </span>
                </div>

                <div className="space-y-3">
                  {checkoutPaymentOptions.map((option) => {
                    const selected = selectedPaymentMethod === option.method
                    const Icon = paymentIcons[option.method]

                    return (
                      <button
                        key={option.method}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(option.method)}
                        className={checkoutSelectionClass(selected)}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              selected
                                ? "border border-black bg-[#d8ff6a] text-black"
                                : "bg-[#f4f3ef] text-black/60"
                            }`}
                          >
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">
                                {option.title}
                              </p>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  selected
                                    ? "bg-black text-white"
                                    : "bg-[#f4f3ef] text-black/55"
                                }`}
                              >
                                {option.badge}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-black/55">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-5">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard size={18} />
                  <h2 className="text-lg font-semibold">
                    สรุปออเดอร์
                  </h2>
                </div>

                <div className="rounded-lg bg-[#f4f3ef] p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck size={18} className="mt-0.5 text-[#1f6a3a]" />
                    <div>
                      <p className="text-sm font-medium">
                        {paymentMethodLabels[selectedPaymentMethod]}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-black/55">
                        {selectedPaymentOption?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <SummaryRow label="ยอดสินค้า" value={formatCurrency(subtotal)} />
                  <SummaryRow
                    label="ค่าจัดส่ง"
                    value={shipping === 0 ? "ฟรี" : formatCurrency(shipping)}
                  />
                  {selectedAddress && (
                    <SummaryRow
                      label="จัดส่งไป"
                      value={`${selectedAddress.province} ${selectedAddress.postalCode}`}
                    />
                  )}
                  <SummaryRow
                    label="ชำระเงิน"
                    value={paymentMethodLabels[selectedPaymentMethod]}
                  />
                  <div className="border-t border-black/10 pt-4">
                    <SummaryRow
                      label="รวมทั้งหมด"
                      value={formatCurrency(total)}
                      strong
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled}
                  className={`mt-6 h-12 w-full px-6 text-sm font-semibold ${uiAction.accent}`}
                >
                  {loading && <Skeleton tone="light" className="h-4 w-32 bg-white/45" />}
                  <span className={loading ? "sr-only" : ""}>
                  {loading ? "กำลังสร้างออเดอร์..." : "ยืนยันออเดอร์"}
                  </span>
                </button>

                {!checkoutReady && isSignedIn && (
                  <p className="mt-3 text-xs leading-5 text-black/60">
                    เลือกหรือเพิ่มที่อยู่จัดส่งเพื่อดำเนินการต่อ
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

function AddressEmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <div className="rounded-lg bg-[#f4f3ef] p-5 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
        <MapPin size={20} />
      </div>
      <p className="mt-4 font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-black/65">{description}</p>
      <Link
        href={href}
        className={`mt-4 px-4 py-2 text-sm font-semibold ${uiAction.accent}`}
      >
        {action}
      </Link>
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
      <span className="text-right">{value}</span>
    </div>
  )
}
