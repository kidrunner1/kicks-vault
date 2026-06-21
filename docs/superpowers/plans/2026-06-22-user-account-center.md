# User Account Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/account` into a complete user account center with real account stats, latest orders, default address, favorites preview, and readiness actions.

**Architecture:** Keep this as a focused account overview redesign with no schema changes. Move reusable account-state logic into a small tested helper, keep rendering in the existing server page, and use existing KicksVault UI tokens and commerce helpers.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, Prisma 6, Node test runner through `tsx`, Tailwind CSS, `lucide-react`.

---

## Spec

Approved spec: `docs/superpowers/specs/2026-06-22-user-account-center-design.md`

## Starting State

- Work on `master` only.
- Use `npm.cmd` in PowerShell for lint/build.
- Do not add Prisma migrations in this phase.
- Do not add profile editing, password changes, account deletion, logout-all-devices, order cancellation, or payment changes.
- Keep account data database-sourced. Never trust client-provided prices or totals.

## File Structure

- Create: `lib/account-center.ts`
  - Pure helper logic for active order statuses, account initial, member-since labels, and readiness checklist.
- Create: `lib/account-center.test.ts`
  - Tests helper logic before it is consumed by the page.
- Create: `lib/account-center-copy.test.ts`
  - Guard account center Thai copy and touched account files against replacement characters, C1 controls, and mojibake markers.
- Modify: `app/(shop)/account/page.tsx`
  - Replace the current account overview with the account center dashboard.
  - Keep this as a server component.
  - Query existing Prisma data only.

## Task 1: Add Tested Account Center Helpers

**Files:**
- Create: `lib/account-center.test.ts`
- Create: `lib/account-center.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `lib/account-center.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import {
  ACTIVE_ACCOUNT_ORDER_STATUSES,
  getAccountInitial,
  getAccountReadiness,
  getMemberSinceLabel,
  isActiveAccountOrderStatus,
} from "./account-center"

test("account center exposes active order statuses for account summaries", () => {
  assert.deepEqual(ACTIVE_ACCOUNT_ORDER_STATUSES, [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
  ])
  assert.equal(isActiveAccountOrderStatus("PENDING"), true)
  assert.equal(isActiveAccountOrderStatus("PROCESSING"), true)
  assert.equal(isActiveAccountOrderStatus("SHIPPED"), true)
  assert.equal(isActiveAccountOrderStatus("DELIVERED"), false)
  assert.equal(isActiveAccountOrderStatus("CANCELLED"), false)
})

test("account center derives a stable profile initial", () => {
  assert.equal(getAccountInitial("buyer@example.com"), "B")
  assert.equal(getAccountInitial("  collector@example.com"), "C")
  assert.equal(getAccountInitial(""), "K")
})

test("account center formats member since labels with an explicit locale", () => {
  assert.equal(
    getMemberSinceLabel(new Date("2026-06-15T00:00:00.000Z"), "en-US"),
    "Jun 2026",
  )
})

test("account center builds readiness actions from real account state", () => {
  assert.deepEqual(
    getAccountReadiness({
      hasDefaultAddress: false,
      orderCount: 0,
      favoriteCount: 2,
    }),
    [
      {
        key: "address",
        label: "บันทึกที่อยู่หลัก",
        description: "เพิ่มที่อยู่จัดส่งเพื่อ Checkout ได้เร็วขึ้น",
        complete: false,
        href: "/account/addresses",
        actionLabel: "เพิ่มที่อยู่",
      },
      {
        key: "orders",
        label: "มีประวัติออเดอร์",
        description: "เริ่มสั่งซื้อเพื่อดูสถานะและประวัติย้อนหลัง",
        complete: false,
        href: "/product",
        actionLabel: "เลือกซื้อสินค้า",
      },
      {
        key: "favorites",
        label: "บันทึกรายการโปรด",
        description: "เก็บคู่ที่สนใจไว้กลับมาดูภายหลัง",
        complete: true,
        href: "/account/favorites",
        actionLabel: "ดูรายการโปรด",
      },
    ],
  )
})
```

- [ ] **Step 2: Run helper tests to verify RED**

Run:

```powershell
npx.cmd tsx --test lib/account-center.test.ts
```

Expected: FAIL because `./account-center` does not exist.

- [ ] **Step 3: Implement account center helpers**

Create `lib/account-center.ts`:

```ts
export const ACTIVE_ACCOUNT_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
] as const

export type AccountReadinessKey = "address" | "orders" | "favorites"

export interface AccountReadinessInput {
  hasDefaultAddress: boolean
  orderCount: number
  favoriteCount: number
}

export interface AccountReadinessItem {
  key: AccountReadinessKey
  label: string
  description: string
  complete: boolean
  href: string
  actionLabel: string
}

export function isActiveAccountOrderStatus(status: string) {
  return (ACTIVE_ACCOUNT_ORDER_STATUSES as readonly string[]).includes(status)
}

export function getAccountInitial(email: string) {
  return email.trim().charAt(0).toUpperCase() || "K"
}

export function getMemberSinceLabel(date: Date, locale = "th-TH") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date)
}

export function getAccountReadiness({
  hasDefaultAddress,
  orderCount,
  favoriteCount,
}: AccountReadinessInput): AccountReadinessItem[] {
  return [
    {
      key: "address",
      label: "บันทึกที่อยู่หลัก",
      description: hasDefaultAddress
        ? "พร้อมใช้ที่อยู่หลักใน Checkout"
        : "เพิ่มที่อยู่จัดส่งเพื่อ Checkout ได้เร็วขึ้น",
      complete: hasDefaultAddress,
      href: "/account/addresses",
      actionLabel: hasDefaultAddress ? "จัดการที่อยู่" : "เพิ่มที่อยู่",
    },
    {
      key: "orders",
      label: "มีประวัติออเดอร์",
      description:
        orderCount > 0
          ? "ติดตามคำสั่งซื้อและดูประวัติย้อนหลังได้"
          : "เริ่มสั่งซื้อเพื่อดูสถานะและประวัติย้อนหลัง",
      complete: orderCount > 0,
      href: orderCount > 0 ? "/account/orders" : "/product",
      actionLabel: orderCount > 0 ? "ดูออเดอร์" : "เลือกซื้อสินค้า",
    },
    {
      key: "favorites",
      label: "บันทึกรายการโปรด",
      description:
        favoriteCount > 0
          ? "มีคู่ที่สนใจเก็บไว้กลับมาดูต่อ"
          : "เก็บคู่ที่สนใจไว้กลับมาดูภายหลัง",
      complete: favoriteCount > 0,
      href: favoriteCount > 0 ? "/account/favorites" : "/product",
      actionLabel: favoriteCount > 0 ? "ดูรายการโปรด" : "เลือกดูสินค้า",
    },
  ]
}
```

- [ ] **Step 4: Run helper tests to verify GREEN**

Run:

```powershell
npx.cmd tsx --test lib/account-center.test.ts
```

Expected: PASS with 4 tests and 0 failures.

- [ ] **Step 5: Run TypeScript for helper types**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: exit code 0.

- [ ] **Step 6: Commit helper work**

Run:

```powershell
git add lib/account-center.ts lib/account-center.test.ts
git commit -m "feat: add account center helpers"
```

## Task 2: Add Account Copy Integrity Guard

**Files:**
- Create: `lib/account-center-copy.test.ts`

- [ ] **Step 1: Create copy integrity test**

Create `lib/account-center-copy.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const files = [
  "app/(shop)/account/page.tsx",
  "lib/account-center.ts",
]

const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

test("account center copy does not contain mojibake or replacement characters", () => {
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
```

- [ ] **Step 2: Run copy integrity test**

Run:

```powershell
npx.cmd tsx --test lib/account-center-copy.test.ts
```

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 3: Commit copy integrity guard**

Run:

```powershell
git add lib/account-center-copy.test.ts
git commit -m "test: cover account center copy integrity"
```

## Task 3: Refactor `/account` Into The Account Center

**Files:**
- Modify: `app/(shop)/account/page.tsx`

- [ ] **Step 1: Replace account page with server-rendered dashboard**

Replace `app/(shop)/account/page.tsx` with:

```tsx
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
  UserRound,
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
            title="ออเดอร์ล่าสุด"
            actionHref="/account/orders"
            actionLabel="ดูทั้งหมด"
          />

          {latestOrders.length === 0 ? (
            <EmptyAction
              icon={ShoppingBag}
              title="ยังไม่มีออเดอร์"
              description="เริ่มจากเลือกคู่ที่มีไซซ์พร้อมขาย แล้วประวัติการสั่งซื้อจะมาอยู่ตรงนี้"
              href="/product"
              actionLabel="เลือกซื้อสินค้า"
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
      <h2 className={compact ? "font-semibold text-black" : "text-xl font-semibold text-black"}>
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
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${className}`}>
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
```

- [ ] **Step 2: Run focused account tests**

Run:

```powershell
npx.cmd tsx --test lib/account-center.test.ts
npx.cmd tsx --test lib/account-center-copy.test.ts
```

Expected: both commands pass with zero failures.

- [ ] **Step 3: Run TypeScript and lint for the page refactor**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit account center page**

Run:

```powershell
git add -- 'app/(shop)/account/page.tsx'
git commit -m "feat: build user account center"
```

## Task 4: Final QA Verification

**Files:**
- Inspect all changed files from Tasks 1-3.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npx.cmd tsx --test lib/account-center.test.ts
npx.cmd tsx --test lib/account-center-copy.test.ts
npx.cmd tsx --test lib/admin-copy-integrity.test.ts
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/product-discovery.test.ts
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: production build exits with code 0.

If the build fails at Prisma DLL rename with `EPERM` on `node_modules\.prisma\client\query_engine-windows.dll.node`, record the exact error, identify locking Node processes, request approval to stop them, and rerun `npm.cmd run build`.

- [ ] **Step 4: Inspect git state**

Run:

```powershell
git status --short --branch
git diff --stat
```

Expected:

- No implementation diff remains.
- `master` is ahead of `origin/master`.

- [ ] **Step 5: Browser verification note**

If no dev server/browser session was started, report:

```text
Browser verification was not run in this pass because the user has been opening the app manually. Automated tests, lint, build, and code-level QA passed.
```

## Spec Coverage Checklist

- Profile summary band: Task 3.
- Commerce stats row from real data: Task 3.
- Latest orders preview: Task 3.
- Default address preview and empty action: Task 3.
- Favorites preview and empty action: Task 3.
- Account readiness checklist: Tasks 1 and 3.
- No schema changes: all tasks.
- No profile settings/password/account deletion: all tasks.
- Thai copy guard: Task 2 and Task 4.
- Hover/focus text readability: Task 3 and Task 4 lint/build review.
- Final lint/build: Task 4.
