# Admin Orders Mock Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin order management with full customer/shipping visibility and a persisted manual mock payment state.

**Architecture:** Extend the Prisma `Order` model with payment enums and fields, keep checkout stock decrement in the existing transaction, and build protected admin order list/detail pages using server-rendered Prisma queries. Payment changes use a server action that calls `requireAdmin()`, validates form data, updates the order, and revalidates the admin routes.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components and Server Actions, Prisma 6, PostgreSQL, Zod, TypeScript, Tailwind CSS, Lucide React.

---

## File Structure

- Modify: `prisma/schema.prisma`
  - Add `PaymentStatus`, `PaymentMethod`, and payment fields on `Order`.
- Create: `prisma/migrations/20260620130000_add_mock_payment_to_orders/migration.sql`
  - Explicit PostgreSQL enum and column migration.
- Modify: `app/actions/create-order.ts`
  - Explicitly create new orders as `UNPAID` and `MANUAL`.
- Modify: `app/admin/AdminShell.tsx`
  - Add Orders navigation and nested active state.
- Create: `app/admin/orders/order-display.ts`
  - Client-safe labels, tones, date formatting, short order id, and address helpers.
- Create: `app/admin/orders/actions.ts`
  - Server action for mock payment updates.
- Create: `app/admin/orders/page.tsx`
  - Server-rendered filtered order list.
- Create: `app/admin/orders/[id]/PaymentStatusForm.tsx`
  - Client form for manual mock payment updates.
- Create: `app/admin/orders/[id]/page.tsx`
  - Server-rendered order detail page.
- Modify: `app/admin/dashboard-data.ts`
  - Add payment summaries and top product data for graph sections.
- Modify: `app/admin/page.tsx`
  - Render accessible payment/order graph bars.

## Task 1: Prisma Payment Fields And Checkout Defaults

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260620130000_add_mock_payment_to_orders/migration.sql`
- Modify: `app/actions/create-order.ts`

- [ ] **Step 1: Update `prisma/schema.prisma`**

In `model Order`, add payment fields after `status`:

```prisma
  total  Decimal     @db.Decimal(10, 2)
  status OrderStatus @default(PENDING)

  paymentStatus PaymentStatus @default(UNPAID)
  paymentMethod PaymentMethod @default(MANUAL)
  paidAt        DateTime?
  paymentNote   String?

  items OrderItem[]
```

Add these enums after `OrderStatus`:

```prisma
enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  MANUAL
  BANK_TRANSFER
  COD
}
```

- [ ] **Step 2: Add migration SQL**

Create `prisma/migrations/20260620130000_add_mock_payment_to_orders/migration.sql`:

```sql
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('MANUAL', 'BANK_TRANSFER', 'COD');

ALTER TABLE "Order"
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "paymentNote" TEXT;
```

- [ ] **Step 3: Update checkout order creation**

In `app/actions/create-order.ts`, change the Prisma import:

```ts
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client"
```

In the `tx.order.create` data block, set payment defaults:

```ts
    const order = await tx.order.create({
      data: {
        userId: user.id,
        ...shippingSnapshot,
        total,
        paymentStatus: PaymentStatus.UNPAID,
        paymentMethod: PaymentMethod.MANUAL,
        items: {
          create: orderItems,
        },
      },
    })
```

- [ ] **Step 4: Validate Prisma and TypeScript**

Run:

```powershell
npx.cmd prisma validate --schema prisma/schema.prisma
npx.cmd tsc --noEmit --pretty false
```

Expected:

- Prisma schema is valid.
- TypeScript exits with code 0.

- [ ] **Step 5: Commit schema and checkout defaults**

Run:

```powershell
git add prisma/schema.prisma prisma/migrations/20260620130000_add_mock_payment_to_orders/migration.sql app/actions/create-order.ts
git commit -m "feat: add mock payment fields"
```

Expected: commit created on `master`.

## Task 2: Admin Navigation And Display Helpers

**Files:**
- Modify: `app/admin/AdminShell.tsx`
- Create: `app/admin/orders/order-display.ts`

- [ ] **Step 1: Add Orders to admin navigation**

In `app/admin/AdminShell.tsx`, replace `navItems` with:

```ts
  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Shoes", href: "/admin/shoes" },
    { name: "Add Shoe", href: "/admin/shoes/new" },
  ]
```

Replace the active calculation inside `navItems.map` with:

```ts
            const active =
              item.href === "/admin"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
```

- [ ] **Step 2: Create `app/admin/orders/order-display.ts`**

Create `app/admin/orders/order-display.ts`:

```ts
export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export const PAYMENT_METHODS = [
  "MANUAL",
  "BANK_TRANSFER",
  "COD",
] as const

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]
export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number]
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]

export const orderStatusLabels: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const paymentStatusLabels: Record<PaymentStatusValue, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
}

export const paymentMethodLabels: Record<PaymentMethodValue, string> = {
  MANUAL: "Manual",
  BANK_TRANSFER: "Bank transfer",
  COD: "Cash on delivery",
}

export const orderStatusTones: Record<OrderStatusValue, string> = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  PROCESSING: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  SHIPPED: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  CANCELLED: "border-red-400/30 bg-red-400/10 text-red-100",
}

export const paymentStatusTones: Record<PaymentStatusValue, string> = {
  UNPAID: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  PAID: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  FAILED: "border-red-400/30 bg-red-400/10 text-red-100",
  REFUNDED: "border-violet-400/30 bg-violet-400/10 text-violet-100",
}

export function shortOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export function formatAdminDate(date: Date | null | undefined) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function isOrderStatus(value: string | undefined): value is OrderStatusValue {
  return ORDER_STATUSES.includes(value as OrderStatusValue)
}

export function isPaymentStatus(value: string | undefined): value is PaymentStatusValue {
  return PAYMENT_STATUSES.includes(value as PaymentStatusValue)
}

export function isPaymentMethod(value: string | undefined): value is PaymentMethodValue {
  return PAYMENT_METHODS.includes(value as PaymentMethodValue)
}

export function shippingAddressLines(order: {
  shippingAddressLine1: string | null
  shippingAddressLine2: string | null
  shippingSubdistrict: string | null
  shippingDistrict: string | null
  shippingProvince: string | null
  shippingPostalCode: string | null
}) {
  return [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    [order.shippingSubdistrict, order.shippingDistrict].filter(Boolean).join(", "),
    [order.shippingProvince, order.shippingPostalCode].filter(Boolean).join(" "),
  ].filter((line): line is string => Boolean(line))
}
```

- [ ] **Step 3: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit navigation and helpers**

Run:

```powershell
git add app/admin/AdminShell.tsx app/admin/orders/order-display.ts
git commit -m "feat: add admin order navigation helpers"
```

Expected: commit created on `master`.

## Task 3: Mock Payment Server Action

**Files:**
- Create: `app/admin/orders/actions.ts`

- [ ] **Step 1: Create payment update action**

Create `app/admin/orders/actions.ts`:

```ts
"use server"

import { PaymentMethod, PaymentStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface PaymentActionState {
  ok: boolean
  message: string
}

const paymentUpdateSchema = z.object({
  orderId: z.string().uuid(),
  paymentStatus: z.enum(["UNPAID", "PAID", "FAILED", "REFUNDED"]),
  paymentMethod: z.enum(["MANUAL", "BANK_TRANSFER", "COD"]),
  paymentNote: z.string().trim().max(500).optional(),
})

export async function updateOrderPaymentState(
  _previousState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  await requireAdmin()

  const parsed = paymentUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
    paymentMethod: formData.get("paymentMethod"),
    paymentNote: formData.get("paymentNote"),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "Payment update data is invalid.",
    }
  }

  const { orderId, paymentStatus, paymentMethod, paymentNote } = parsed.data

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      paidAt: true,
    },
  })

  if (!order) {
    return {
      ok: false,
      message: "Order was not found.",
    }
  }

  const paidAt =
    paymentStatus === PaymentStatus.PAID
      ? order.paidAt ?? new Date()
      : paymentStatus === PaymentStatus.REFUNDED
        ? order.paidAt
        : null

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus: paymentStatus as PaymentStatus,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentNote: paymentNote?.trim() || null,
      paidAt,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)

  return {
    ok: true,
    message: "Payment status updated.",
  }
}
```

- [ ] **Step 2: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands exit with code 0.

- [ ] **Step 3: Commit payment action**

Run:

```powershell
git add app/admin/orders/actions.ts
git commit -m "feat: add admin mock payment action"
```

Expected: commit created on `master`.

## Task 4: Admin Orders List

**Files:**
- Create: `app/admin/orders/page.tsx`

- [ ] **Step 1: Create order list page**

Create `app/admin/orders/page.tsx`. Use this structure:

```tsx
import Link from "next/link"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { ArrowRight, RotateCcw, Search } from "lucide-react"
import { formatCurrency } from "@/lib/commerce"
import { prisma } from "@/lib/prisma"
import {
  formatAdminDate,
  isOrderStatus,
  isPaymentStatus,
  orderStatusLabels,
  orderStatusTones,
  ORDER_STATUSES,
  paymentMethodLabels,
  paymentStatusLabels,
  paymentStatusTones,
  PAYMENT_STATUSES,
  shortOrderId,
} from "./order-display"

type SearchValue = string | string[] | undefined

interface AdminOrdersPageProps {
  searchParams?: Promise<Record<string, SearchValue>>
}

function readParam(params: Record<string, SearchValue>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = (await searchParams) ?? {}
  const query = readParam(params, "q")?.trim() ?? ""
  const statusParam = readParam(params, "status")
  const paymentParam = readParam(params, "payment")
  const activeStatus = isOrderStatus(statusParam) ? statusParam : "all"
  const activePayment = isPaymentStatus(paymentParam) ? paymentParam : "all"

  const where: Prisma.OrderWhereInput = {}

  if (activeStatus !== "all") {
    where.status = activeStatus as OrderStatus
  }

  if (activePayment !== "all") {
    where.paymentStatus = activePayment as PaymentStatus
  }

  if (query) {
    const idSearch = query.replace(/^#/, "")
    where.OR = [
      { id: { contains: idSearch, mode: "insensitive" } },
      { user: { email: { contains: query, mode: "insensitive" } } },
      { shippingRecipientName: { contains: query, mode: "insensitive" } },
      { shippingPhone: { contains: query, mode: "insensitive" } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6 text-gray-100">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review customer, shipping, order, and mock payment state from one protected admin view.
          </p>
        </div>
      </header>

      <form className="grid gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4 lg:grid-cols-[1fr_180px_180px_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
          <input
            name="q"
            defaultValue={query}
            aria-label="Search by id, email, name, or phone"
            className="h-11 w-full rounded-lg border border-gray-700 bg-gray-950 pl-10 pr-3 text-sm text-white outline-none transition focus:border-white"
          />
        </label>

        <select
          name="status"
          defaultValue={activeStatus}
          className="h-11 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>

        <select
          name="payment"
          defaultValue={activePayment}
          className="h-11 rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
        >
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-black bg-[#d8ff6a] px-4 text-sm font-semibold text-black transition hover:bg-white"
        >
          Apply
        </button>

        <Link
          href="/admin/orders"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-4 text-sm font-medium text-gray-200 transition hover:bg-gray-800 hover:text-white"
        >
          <RotateCcw size={16} />
          Reset
        </Link>
      </form>

      <section className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-gray-200">No orders found</p>
            <p className="mt-2 text-sm text-gray-500">
              Orders will appear here after checkout, or after filters are cleared.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-4 p-5 transition hover:bg-gray-800/60 lg:grid-cols-[1fr_1fr_140px_140px_140px_auto] lg:items-center"
                >
                  <div>
                    <p className="font-semibold text-white">{shortOrderId(order.id)}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatAdminDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{order.user.email}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {order.shippingRecipientName ?? "No recipient"} - {order.shippingPhone ?? "No phone"}
                    </p>
                  </div>
                  <StatusBadge className={orderStatusTones[order.status]} label={orderStatusLabels[order.status]} />
                  <StatusBadge className={paymentStatusTones[order.paymentStatus]} label={paymentStatusLabels[order.paymentStatus]} />
                  <div>
                    <p className="text-sm font-semibold text-white">{formatCurrency(order.total.toString())}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {itemCount} item{itemCount === 1 ? "" : "s"} - {paymentMethodLabels[order.paymentMethod]}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-end gap-1 text-sm font-medium text-[#ecff9c]">
                    Details
                    <ArrowRight size={15} />
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands exit with code 0.

- [ ] **Step 3: Commit order list**

Run:

```powershell
git add app/admin/orders/page.tsx
git commit -m "feat: add admin orders list"
```

Expected: commit created on `master`.

## Task 5: Admin Order Detail And Payment Form

**Files:**
- Create: `app/admin/orders/[id]/PaymentStatusForm.tsx`
- Create: `app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Create payment form client component**

Create `app/admin/orders/[id]/PaymentStatusForm.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  paymentMethodLabels,
  paymentStatusLabels,
  type PaymentMethodValue,
  type PaymentStatusValue,
} from "../order-display"
import {
  updateOrderPaymentState,
  type PaymentActionState,
} from "../actions"

const initialState: PaymentActionState = {
  ok: false,
  message: "",
}

export default function PaymentStatusForm({
  orderId,
  paymentStatus,
  paymentMethod,
  paymentNote,
}: {
  orderId: string
  paymentStatus: PaymentStatusValue
  paymentMethod: PaymentMethodValue
  paymentNote: string | null
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderPaymentState,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div>
        <label className="text-sm font-medium text-gray-300" htmlFor="paymentMethod">
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue={paymentMethod}
          className="mt-2 h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {paymentMethodLabels[method]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300" htmlFor="paymentNote">
          Payment note
        </label>
        <textarea
          id="paymentNote"
          name="paymentNote"
          defaultValue={paymentNote ?? ""}
          maxLength={500}
          rows={4}
          className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white outline-none transition focus:border-white"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PAYMENT_STATUSES.map((status) => (
          <button
            key={status}
            type="submit"
            name="paymentStatus"
            value={status}
            disabled={pending}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              status === paymentStatus
                ? "border-[#d8ff6a] bg-[#d8ff6a] text-black"
                : "border-gray-700 bg-gray-950 text-gray-200 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Mark as {paymentStatusLabels[status].toLowerCase()}
          </button>
        ))}
      </div>

      {state.message && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/30 bg-red-400/10 text-red-100"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Create order detail page**

Create `app/admin/orders/[id]/page.tsx` with a server-rendered detail view. The implementation must:

```tsx
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { formatCurrency } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
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
import PaymentStatusForm from "./PaymentStatusForm"

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}
```

Fetch the order:

```tsx
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      items: {
        include: {
          shoe: {
            select: {
              name: true,
              brand: { select: { name: true } },
              images: {
                select: { url: true },
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
```

Render these sections:

- Back link to `/admin/orders`.
- Order summary panel with short id, full id, created date, updated date, status, payment status, payment method, paid date, and total.
- Customer panel with `order.user.email`, `order.shippingRecipientName`, and `order.shippingPhone`.
- Shipping address panel using `shippingAddressLines(order)`.
- Items panel using `Image`, product name, brand, size, quantity, unit price, and line total.
- Payment panel using:

```tsx
<PaymentStatusForm
  orderId={order.id}
  paymentStatus={order.paymentStatus}
  paymentMethod={order.paymentMethod}
  paymentNote={order.paymentNote}
/>
```

Use `formatCurrency(item.price.toString())` for unit price and `formatCurrency(Number(item.price) * item.quantity)` for line totals.

- [ ] **Step 3: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit order detail and payment form**

Run:

```powershell
git add "app/admin/orders/[id]/PaymentStatusForm.tsx" "app/admin/orders/[id]/page.tsx"
git commit -m "feat: add admin order detail payment"
```

Expected: commit created on `master`.

## Task 6: Dashboard Payment Graphs

**Files:**
- Modify: `app/admin/dashboard-data.ts`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Extend dashboard data**

In `AdminDashboardData`, add:

```ts
  paymentSummary: {
    status: string
    label: string
    count: number
    revenue: string
    percent: number
    tone: AdminMetricTone
  }[]
  topProducts: {
    shoeId: string
    name: string
    brandName: string
    quantity: number
    percent: number
  }[]
```

In `getAdminDashboardData()`, add Prisma queries:

```ts
    paymentGroups,
    topProductGroups,
```

Use:

```ts
    prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["shoeId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
```

After `Promise.all`, fetch top product names:

```ts
  const topProductIds = topProductGroups.map((group) => group.shoeId)
  const topProductShoes = await prisma.shoe.findMany({
    where: { id: { in: topProductIds } },
    select: {
      id: true,
      name: true,
      brand: { select: { name: true } },
    },
  })
```

Map payment groups and top products into `paymentSummary` and `topProducts`. Calculate `percent` against the highest count or quantity, with 0 when there is no data.

- [ ] **Step 2: Render graph bars on dashboard**

In `app/admin/page.tsx`, add a `GraphBar` component:

```tsx
function GraphBar({
  label,
  value,
  helper,
  percent,
  tone = "bg-[#d8ff6a]",
}: {
  label: string
  value: string
  helper?: string
  percent: number
  tone?: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-200">{label}</span>
        <span className="text-gray-400">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.max(percent, 4)}%` }}
        />
      </div>
      {helper && <p className="mt-2 text-xs text-gray-500">{helper}</p>}
    </div>
  )
}
```

Add panels for:

- Payment summary: map `dashboard.paymentSummary`.
- Top products: map `dashboard.topProducts`.

If either list is empty, render `EmptyState`.

- [ ] **Step 3: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit dashboard graphs**

Run:

```powershell
git add app/admin/dashboard-data.ts app/admin/page.tsx
git commit -m "feat: add admin payment graphs"
```

Expected: commit created on `master`.

## Task 7: Final Verification

**Files:**
- Verify all B2 changed files.

- [ ] **Step 1: Run source checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
npx.cmd prisma validate --schema prisma/schema.prisma
git diff --check
```

Expected:

- ESLint exits with code 0.
- TypeScript exits with code 0.
- Prisma schema validates.
- `git diff --check` exits with code 0.

- [ ] **Step 2: Run Next production build**

Run:

```powershell
npx.cmd next build
```

Expected:

- Build exits with code 0.
- `/admin/orders` and `/admin/orders/[id]` appear as dynamic routes.

- [ ] **Step 3: Run project build command**

Run:

```powershell
npm.cmd run build
```

Expected:

- If the local Prisma DLL is not locked, the command exits with code 0.
- If Windows reports `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`, record the blocker and confirm `npx.cmd next build` separately.

- [ ] **Step 4: Inspect final status**

Run:

```powershell
git status --short --branch
git log --oneline -8
```

Expected:

- Working tree is clean.
- Recent commits show schema, navigation/helper, action, list, detail, dashboard graph checkpoints.

## Self-Review

- Spec coverage: tasks cover DB fields, checkout defaults, admin navigation, order list filters/search, order detail, shipping snapshot display, item totals, mock payment server action, dashboard graphs, and verification.
- Scope check: B2 does not process real payment, mutate order status, cancel orders, restore stock, integrate shipping carriers, or generate invoices.
- Type consistency: UI helpers use string literal types for client-safe components; server-only code imports Prisma enums where database writes need them.
- Completeness scan: all created files and modified files are listed with exact paths and verification commands.
