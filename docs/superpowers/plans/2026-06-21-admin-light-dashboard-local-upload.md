# Admin Light Dashboard And Local Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin area into a cohesive light operations workspace and add admin-only local product image upload.

**Architecture:** Keep admin authorization server-side, keep dashboard/order data server-rendered, and isolate reusable admin styling in small local UI helpers under `app/admin`. Product upload uses a protected Node.js API route that writes validated image files to `public/uploads/shoes` and returns public paths stored in the existing shoe image records.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6, PostgreSQL, Zod, TypeScript, Node test runner, Tailwind CSS, Lucide React, built-in Node `fs/promises`, `path`, and `crypto`.

---

## Starting State

- Work on `master` only.
- The spec is committed as `aec62e4 docs: specify admin light dashboard local upload`.
- `app/admin/orders/[id]/page.tsx` currently has an uncommitted key fix from the prior React warning. Do not revert it. Absorb it into the order detail task and commit it with the admin order detail UI changes.
- Do not stage unrelated files outside this plan.

## File Structure

- Create: `app/admin/admin-ui.tsx`
  - Shared light admin components and class helpers: page header, panel, metric card, status badge, chart bar, empty state, button/link class helpers, and form control class helpers.
- Modify: `app/admin/AdminShell.tsx`
  - Light admin shell, sidebar navigation, top bar, logout button, responsive layout.
- Modify: `app/admin/dashboard-data.ts`
  - Add missing unpaid order metric and fulfillment summary data. Keep Prisma reads server-side.
- Modify: `app/admin/page.tsx`
  - Light dashboard layout with revenue, order, payment, fulfillment, top products, stock risk, catalog health, and recent order sections.
- Modify: `app/admin/orders/order-display.ts`
  - Convert status tone classes to light UI-compatible classes and keep label helpers.
- Modify: `app/admin/orders/page.tsx`
  - Light order list, filters, status badges, readable rows.
- Modify: `app/admin/orders/[id]/page.tsx`
  - Light order detail panels, fix duplicate address line keys, keep fulfillment and payment functionality.
- Modify: `app/admin/orders/[id]/FulfillmentStatusForm.tsx`
  - Light form controls and action buttons.
- Modify: `app/admin/orders/[id]/PaymentStatusForm.tsx`
  - Light form controls and status action buttons.
- Create: `lib/admin-upload.ts`
  - Pure helpers for image MIME validation, size validation, safe extension resolution, and safe public path generation.
- Create: `lib/admin-upload.test.ts`
  - Node tests for upload helper validation and path generation.
- Create: `app/api/admin/uploads/shoes/route.ts`
  - Admin-only multipart upload route writing files to `public/uploads/shoes`.
- Create: `public/uploads/shoes/.gitkeep`
  - Keeps the local upload folder available in git.
- Create: `app/admin/shoes/ShoeImageManager.tsx`
  - Client image uploader, upload state, previews, remove controls, and URL fallback rows.
- Modify: `app/admin/shoes/ShoeForm.tsx`
  - Light product editor and integration with `ShoeImageManager`.
- Modify: `app/admin/shoes/page.tsx`
  - Light product table, stock visibility, skeletons, actions.
- Modify: `app/admin/shoes/new/page.tsx`
  - Keep page as server data loader, no styling logic required unless wrapper copy is needed.
- Modify: `app/admin/shoes/[id]/page.tsx`
  - Keep edit data shape, preserve existing images, no schema change.

## Task 1: Shared Light Admin UI Primitives

**Files:**
- Create: `app/admin/admin-ui.tsx`

- [ ] **Step 1: Create reusable admin UI helpers**

Create `app/admin/admin-ui.tsx`:

```tsx
import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

export type AdminTone =
  | "neutral"
  | "accent"
  | "warning"
  | "danger"
  | "success"
  | "info"
  | "refund"

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export const adminButtonClass = {
  primary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-black bg-[#d8ff6a] px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
} as const

export const adminInputClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminSelectClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminTextareaClass =
  "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"

export const adminStatusToneClass: Record<AdminTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  accent: "border-lime-300 bg-lime-50 text-lime-900",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  refund: "border-violet-200 bg-violet-50 text-violet-800",
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  )
}

export function AdminPanel({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string
  tone?: AdminTone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold",
        adminStatusToneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function AdminChartBar({
  label,
  value,
  helper,
  percent,
  tone = "accent",
}: {
  label: string
  value: string
  helper?: string
  percent: number
  tone?: AdminTone
}) {
  const width = percent > 0 ? Math.max(percent, 4) : 0
  const barTone: Record<AdminTone, string> = {
    neutral: "bg-slate-400",
    accent: "bg-lime-400",
    warning: "bg-amber-400",
    danger: "bg-red-500",
    success: "bg-emerald-500",
    info: "bg-sky-500",
    refund: "bg-violet-500",
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 font-medium text-slate-800">{label}</span>
        <span className="shrink-0 font-semibold text-slate-950">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", barTone[tone])}
          style={{ width: `${width}%` }}
        />
      </div>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  )
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

export function AdminLinkButton({
  className,
  variant = "secondary",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & {
  variant?: keyof typeof adminButtonClass
}) {
  return (
    <Link
      className={cn(adminButtonClass[variant], className)}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Run TypeScript for the new helper**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: TypeScript exits with code 0.

- [ ] **Step 3: Commit shared admin UI primitives**

```powershell
git add app/admin/admin-ui.tsx
git commit -m "feat: add light admin ui primitives"
```

## Task 2: Light Admin Shell

**Files:**
- Modify: `app/admin/AdminShell.tsx`

- [ ] **Step 1: Update imports**

In `app/admin/AdminShell.tsx`, use these imports:

```tsx
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Boxes,
  LogOut,
  PackagePlus,
  ReceiptText,
} from "lucide-react"
import { useState } from "react"
import AppLogo from "@/app/component/ui/AppLogo"
import { Skeleton } from "@/app/component/ui/Skeleton"
import { adminButtonClass, cn } from "./admin-ui"
```

- [ ] **Step 2: Replace navigation items**

Use icon-aware navigation:

```tsx
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "ออเดอร์", href: "/admin/orders", icon: ReceiptText },
    { name: "สินค้า", href: "/admin/shoes", icon: Boxes },
    { name: "เพิ่มสินค้า", href: "/admin/shoes/new", icon: PackagePlus },
  ]
```

- [ ] **Step 3: Replace shell markup**

Replace the returned JSX with:

```tsx
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <AppLogo subLabel="Admin Panel" />
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = item.href === activeHref
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "border-black bg-[#d8ff6a] text-black shadow-sm"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Admin mode</p>
          <p className="mt-1 leading-6">จัดการร้าน สินค้า ออเดอร์ และ stock</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                KicksVault Admin
              </p>
              <p className="text-xs text-slate-500">
                เข้าสู่ระบบในฐานะ Admin
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const active = item.href === activeHref
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "border-black bg-[#d8ff6a] text-black"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-black",
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(adminButtonClass.danger, "w-fit")}
            >
              {loggingOut ? (
                <Skeleton tone="light" className="h-4 w-24 bg-red-200" />
              ) : (
                <>
                  <LogOut size={16} aria-hidden="true" />
                  ออกจากระบบ
                </>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
```

- [ ] **Step 4: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 5: Commit shell**

```powershell
git add app/admin/AdminShell.tsx
git commit -m "feat: refresh admin shell"
```

## Task 3: Dashboard Data And Light Dashboard

**Files:**
- Modify: `app/admin/dashboard-data.ts`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Extend dashboard data types**

In `app/admin/dashboard-data.ts`, add `tone?: AdminMetricTone` values through existing type and add fulfillment summary fields to `AdminDashboardData`:

```ts
  fulfillmentSummary: {
    status: OrderStatus
    label: string
    count: number
    percent: number
    tone: AdminMetricTone
  }[]
```

- [ ] **Step 2: Add unpaid order count**

Inside the `Promise.all` list in `getAdminDashboardData`, add this Prisma call after `pendingOrders`:

```ts
    prisma.order.count({
      where: {
        paymentStatus: PaymentStatus.UNPAID,
      },
    }),
```

Destructure it as `unpaidOrders`.

- [ ] **Step 3: Add unpaid metric and fulfillment summary**

Add this metric after the pending order metric:

```ts
      {
        label: "ยังไม่ชำระเงิน",
        value: unpaidOrders.toString(),
        helper: "ออเดอร์ที่ต้องตรวจ payment mock",
        href: "/admin/orders?payment=UNPAID",
        tone: unpaidOrders > 0 ? "warning" : "neutral",
      },
```

Before `return`, compute:

```ts
  const highestPipelineCount = Math.max(
    ...ORDER_STATUS_ORDER.map((status) => pipelineByStatus.get(status) ?? 0),
    0,
  )
```

Return `fulfillmentSummary`:

```ts
    fulfillmentSummary: ORDER_STATUS_ORDER.map((status) => {
      const count = pipelineByStatus.get(status) ?? 0

      return {
        status,
        label: ORDER_STATUS_LABELS[status],
        count,
        percent:
          highestPipelineCount > 0
            ? Math.round((count / highestPipelineCount) * 100)
            : 0,
        tone: orderStatusTone(status),
      }
    }),
```

Add helper:

```ts
function orderStatusTone(status: OrderStatus): AdminMetricTone {
  if (status === OrderStatus.PENDING) return "warning"
  if (status === OrderStatus.PROCESSING) return "info"
  if (status === OrderStatus.SHIPPED) return "refund"
  if (status === OrderStatus.DELIVERED) return "accent"
  return "danger"
}
```

- [ ] **Step 4: Replace dashboard page imports**

In `app/admin/page.tsx`, import shared UI:

```tsx
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  CreditCard,
  PackagePlus,
  TrendingUp,
} from "lucide-react"
import {
  AdminChartBar,
  AdminEmptyState,
  AdminLinkButton,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
  cn,
} from "./admin-ui"
import {
  getAdminDashboardData,
  ORDER_STATUS_LABELS,
  type AdminMetric,
  type AdminMetricTone,
} from "./dashboard-data"
```

- [ ] **Step 5: Convert dashboard layout to light UI**

Update the top return wrapper and header:

```tsx
    <div className="space-y-8">
      <AdminPageHeader
        title="Operations Dashboard"
        description="ภาพรวมรายรับ ออเดอร์ payment mock, fulfillment, stock และความพร้อมของ catalog"
        actions={
          <>
            <AdminLinkButton href="/admin/orders">
              ดูออเดอร์
              <ArrowRight size={16} />
            </AdminLinkButton>
            <AdminLinkButton href="/admin/shoes">
              จัดการสินค้า
              <ArrowRight size={16} />
            </AdminLinkButton>
            <AdminLinkButton href="/admin/shoes/new" variant="primary">
              <PackagePlus size={16} />
              เพิ่มสินค้า
            </AdminLinkButton>
          </>
        }
      />
```

Use `AdminPanel`, `AdminChartBar`, `AdminEmptyState`, and `AdminStatusBadge` in each dashboard section. Preserve existing section order and data mapping.

- [ ] **Step 6: Update metric card implementation**

Replace `MetricCard` with:

```tsx
function MetricCard({ metric }: { metric: AdminMetric }) {
  const toneClass: Record<AdminMetricTone, string> = {
    neutral: "border-slate-200 bg-white text-slate-950",
    accent: "border-lime-200 bg-lime-50 text-lime-950",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-red-200 bg-red-50 text-red-800",
  }

  const content = (
    <>
      <p className="text-sm font-medium text-slate-600">{metric.label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">
        {metric.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{metric.helper}</p>
    </>
  )

  const className = cn(
    "block rounded-lg border p-5 shadow-sm transition",
    toneClass[metric.tone],
  )

  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className={cn(
          className,
          "hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        )}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
```

- [ ] **Step 7: Run TypeScript and lint**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: both commands exit with code 0.

- [ ] **Step 8: Commit dashboard**

```powershell
git add app/admin/dashboard-data.ts app/admin/page.tsx
git commit -m "feat: refresh admin dashboard"
```

## Task 4: Light Order List And Status Tones

**Files:**
- Modify: `app/admin/orders/order-display.ts`
- Modify: `app/admin/orders/page.tsx`

- [ ] **Step 1: Update light status tones**

In `app/admin/orders/order-display.ts`, replace `orderStatusTones` and `paymentStatusTones` with:

```ts
export const orderStatusTones: Record<OrderStatusValue, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PROCESSING: "border-sky-200 bg-sky-50 text-sky-800",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
}

export const paymentStatusTones: Record<PaymentStatusValue, string> = {
  UNPAID: "border-amber-200 bg-amber-50 text-amber-800",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-violet-200 bg-violet-50 text-violet-800",
}
```

- [ ] **Step 2: Update order list imports**

In `app/admin/orders/page.tsx`, add:

```tsx
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminStatusBadge,
  adminButtonClass,
  adminInputClass,
  adminSelectClass,
  cn,
} from "../admin-ui"
```

- [ ] **Step 3: Replace order list wrapper and header**

Use:

```tsx
    <div className="space-y-6">
      <AdminPageHeader
        title="ออเดอร์"
        description="ตรวจสอบลูกค้า ที่อยู่จัดส่ง สถานะ fulfillment และ mock payment จากหน้าเดียว"
      />
```

- [ ] **Step 4: Replace filter form classes**

Use:

```tsx
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_auto_auto]">
```

For input:

```tsx
className={cn(adminInputClass, "mt-0 h-11 pl-10")}
```

For selects:

```tsx
className={cn(adminSelectClass, "mt-0")}
```

For submit:

```tsx
className={adminButtonClass.primary}
```

For reset link:

```tsx
className={adminButtonClass.secondary}
```

- [ ] **Step 5: Replace rows with light table-like cards**

Update the section wrapper:

```tsx
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
```

Update each row link:

```tsx
className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_1fr_140px_140px_140px_auto] lg:items-center"
```

Use `text-slate-950`, `text-slate-700`, and `text-slate-500` instead of dark-theme gray classes. Keep detail link text black/lime readable:

```tsx
<span className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-slate-900">
```

- [ ] **Step 6: Update status badge helper**

Replace local `StatusBadge` body with:

```tsx
  return <AdminStatusBadge className={className} label={label} />
```

- [ ] **Step 7: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 8: Commit order list**

```powershell
git add app/admin/orders/order-display.ts app/admin/orders/page.tsx
git commit -m "feat: refresh admin order list"
```

## Task 5: Light Order Detail And Admin Order Forms

**Files:**
- Modify: `app/admin/orders/[id]/page.tsx`
- Modify: `app/admin/orders/[id]/FulfillmentStatusForm.tsx`
- Modify: `app/admin/orders/[id]/PaymentStatusForm.tsx`

- [ ] **Step 1: Update detail page imports**

In `app/admin/orders/[id]/page.tsx`, add:

```tsx
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
  cn,
} from "../../admin-ui"
```

- [ ] **Step 2: Replace detail wrapper and back link classes**

Use:

```tsx
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-black"
      >
```

Use `AdminPageHeader` for the title area and keep the total card light:

```tsx
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
```

- [ ] **Step 3: Convert `Panel` to use light classes**

Replace local `Panel` return with:

```tsx
    <AdminPanel title={title} description={description} icon={icon}>
      {children}
    </AdminPanel>
```

- [ ] **Step 4: Convert `InfoRow` to light classes**

Replace `InfoRow` return with:

```tsx
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">
        {value}
      </p>
    </div>
```

- [ ] **Step 5: Preserve the duplicate key fix**

Keep address line mapping as:

```tsx
                  {addressLines.map((line, index) => (
                    <p key={`address-line-${index}`}>{line}</p>
                  ))}
```

- [ ] **Step 6: Update Fulfillment form controls**

In `FulfillmentStatusForm.tsx`, import:

```tsx
import {
  adminButtonClass,
  adminInputClass,
  adminTextareaClass,
  cn,
} from "../../admin-ui"
```

Use `text-slate-700` labels, `adminInputClass`, and `adminTextareaClass`. Replace action button classes:

```tsx
className={cn(
  isCancel ? adminButtonClass.danger : adminButtonClass.primary,
  "w-full",
)}
```

- [ ] **Step 7: Update Payment form controls**

In `PaymentStatusForm.tsx`, import:

```tsx
import {
  adminButtonClass,
  adminSelectClass,
  adminTextareaClass,
  cn,
} from "../../admin-ui"
```

Use `text-slate-700` labels, `adminSelectClass`, and `adminTextareaClass`. For status buttons:

```tsx
className={cn(
  status === paymentStatus ? adminButtonClass.primary : adminButtonClass.secondary,
  "w-full",
)}
```

- [ ] **Step 8: Run TypeScript and lint**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: both commands exit with code 0.

- [ ] **Step 9: Commit order detail and forms**

```powershell
git add app/admin/orders/[id]/page.tsx app/admin/orders/[id]/FulfillmentStatusForm.tsx app/admin/orders/[id]/PaymentStatusForm.tsx
git commit -m "feat: refresh admin order detail"
```

## Task 6: Upload Helper Tests And Validation

**Files:**
- Create: `lib/admin-upload.ts`
- Create: `lib/admin-upload.test.ts`

- [ ] **Step 1: Write failing upload helper tests**

Create `lib/admin-upload.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import {
  MAX_SHOE_IMAGE_BYTES,
  buildShoeImageFileName,
  getShoeImageExtension,
  validateShoeImageFile,
} from "./admin-upload"

test("shoe image upload accepts supported image types", () => {
  assert.equal(getShoeImageExtension("image/jpeg"), ".jpg")
  assert.equal(getShoeImageExtension("image/png"), ".png")
  assert.equal(getShoeImageExtension("image/webp"), ".webp")
  assert.equal(getShoeImageExtension("image/avif"), ".avif")
})

test("shoe image upload rejects unsupported and empty files", () => {
  assert.deepEqual(validateShoeImageFile({ type: "application/pdf", size: 10 }), {
    ok: false,
    message: "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ AVIF",
  })
  assert.deepEqual(validateShoeImageFile({ type: "image/png", size: 0 }), {
    ok: false,
    message: "ไฟล์รูปภาพว่างเปล่า",
  })
})

test("shoe image upload rejects files larger than the limit", () => {
  assert.deepEqual(
    validateShoeImageFile({
      type: "image/png",
      size: MAX_SHOE_IMAGE_BYTES + 1,
    }),
    {
      ok: false,
      message: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB",
    },
  )
})

test("shoe image upload creates a safe deterministic file name", () => {
  const fileName = buildShoeImageFileName({
    mimeType: "image/webp",
    now: new Date("2026-06-21T12:34:56.000Z"),
    randomId: "ABC_123",
  })

  assert.equal(fileName, "shoe-20260621-123456-abc123.webp")
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
```

Expected: FAIL because `lib/admin-upload.ts` does not exist.

- [ ] **Step 3: Implement upload helper**

Create `lib/admin-upload.ts`:

```ts
export const MAX_SHOE_IMAGE_BYTES = 5 * 1024 * 1024

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
} as const

type SupportedImageMimeType = keyof typeof imageExtensions

export type UploadValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export function getShoeImageExtension(mimeType: string) {
  return imageExtensions[mimeType as SupportedImageMimeType]
}

export function validateShoeImageFile({
  type,
  size,
}: {
  type: string
  size: number
}): UploadValidationResult {
  if (!getShoeImageExtension(type)) {
    return {
      ok: false,
      message: "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ AVIF",
    }
  }

  if (size <= 0) {
    return {
      ok: false,
      message: "ไฟล์รูปภาพว่างเปล่า",
    }
  }

  if (size > MAX_SHOE_IMAGE_BYTES) {
    return {
      ok: false,
      message: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB",
    }
  }

  return { ok: true }
}

export function buildShoeImageFileName({
  mimeType,
  now,
  randomId,
}: {
  mimeType: string
  now: Date
  randomId: string
}) {
  const extension = getShoeImageExtension(mimeType)

  if (!extension) {
    throw new Error("Unsupported shoe image type")
  }

  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "-")
  const safeRandomId = randomId.toLowerCase().replace(/[^a-z0-9]/g, "")

  return `shoe-${timestamp}-${safeRandomId}${extension}`
}
```

- [ ] **Step 4: Run helper tests**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit helper and tests**

```powershell
git add lib/admin-upload.ts lib/admin-upload.test.ts
git commit -m "test: cover admin image upload validation"
```

## Task 7: Admin Local Upload API

**Files:**
- Create: `app/api/admin/uploads/shoes/route.ts`
- Create: `public/uploads/shoes/.gitkeep`

- [ ] **Step 1: Create upload directory marker**

Create an empty file:

```text
public/uploads/shoes/.gitkeep
```

- [ ] **Step 2: Create admin upload route**

Create `app/api/admin/uploads/shoes/route.ts`:

```ts
import { randomBytes } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { AuthError } from "@/lib/errors/auth-error"
import {
  buildShoeImageFileName,
  validateShoeImageFile,
} from "@/lib/admin-upload"

export const runtime = "nodejs"

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "shoes",
)

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์รูปภาพอย่างน้อย 1 ไฟล์" },
        { status: 400 },
      )
    }

    await mkdir(uploadDirectory, { recursive: true })

    const uploadedPaths: string[] = []

    for (const file of files) {
      const validation = validateShoeImageFile({
        type: file.type,
        size: file.size,
      })

      if (!validation.ok) {
        return NextResponse.json(
          { error: validation.message },
          { status: 400 },
        )
      }

      const fileName = buildShoeImageFileName({
        mimeType: file.type,
        now: new Date(),
        randomId: randomBytes(8).toString("hex"),
      })
      const filePath = path.join(uploadDirectory, fileName)
      const buffer = Buffer.from(await file.arrayBuffer())

      await writeFile(filePath, buffer)
      uploadedPaths.push(`/uploads/shoes/${fileName}`)
    }

    return NextResponse.json({ paths: uploadedPaths }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.statusCode === 403 ? "ไม่มีสิทธิ์อัปโหลดรูป" : "กรุณาเข้าสู่ระบบ" },
        { status: error.statusCode },
      )
    }

    console.error("UPLOAD SHOE IMAGE ERROR:", error)

    return NextResponse.json(
      { error: "ไม่สามารถอัปโหลดรูปสินค้าได้" },
      { status: 500 },
    )
  }
}
```

- [ ] **Step 3: Run TypeScript and helper tests**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npx.cmd tsx --test lib/admin-upload.test.ts
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit upload API**

```powershell
git add app/api/admin/uploads/shoes/route.ts public/uploads/shoes/.gitkeep
git commit -m "feat: add local admin image upload"
```

## Task 8: Product Image Manager And Product Form

**Files:**
- Create: `app/admin/shoes/ShoeImageManager.tsx`
- Modify: `app/admin/shoes/ShoeForm.tsx`

- [ ] **Step 1: Create image manager component**

Create `app/admin/shoes/ShoeImageManager.tsx`:

```tsx
"use client"

import Image from "next/image"
import { ImagePlus, Link as LinkIcon, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { normalizeImagePath } from "@/lib/image"
import {
  adminButtonClass,
  adminInputClass,
  cn,
} from "../admin-ui"

interface UploadResponse {
  paths?: string[]
  error?: string
}

export default function ShoeImageManager({
  images,
  onImagesChange,
}: {
  images: string[]
  onImagesChange: (images: string[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const visibleImages = images.length > 0 ? images : [""]

  function updateImage(index: number, value: string) {
    onImagesChange(
      visibleImages.map((image, imageIndex) =>
        imageIndex === index ? value : image,
      ),
    )
  }

  function removeImage(index: number) {
    const nextImages = visibleImages.filter((_, imageIndex) => imageIndex !== index)
    onImagesChange(nextImages.length > 0 ? nextImages : [""])
  }

  function addUrlRow() {
    onImagesChange([...visibleImages, ""])
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      setUploading(true)
      setUploadError(null)

      const response = await fetch("/api/admin/uploads/shoes", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const result = (await response.json()) as UploadResponse

      if (!response.ok || !result.paths) {
        setUploadError(result.error || "อัปโหลดรูปสินค้าไม่สำเร็จ")
        return
      }

      const keptImages = visibleImages
        .map((image) => image.trim())
        .filter(Boolean)

      onImagesChange([...keptImages, ...result.paths])
    } catch {
      setUploadError("ไม่สามารถเชื่อมต่อระบบอัปโหลดรูปได้")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">รูปสินค้า</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            อัปโหลดรูปจากเครื่อง หรือใส่ URL สำรองสำหรับรูปเดิม
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => uploadFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={adminButtonClass.primary}
          >
            <Upload size={16} />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
          </button>
          <button
            type="button"
            onClick={addUrlRow}
            className={adminButtonClass.secondary}
          >
            <LinkIcon size={16} />
            เพิ่ม URL
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {visibleImages.map((image, index) => {
          const trimmedImage = image.trim()

          return (
            <div
              key={`shoe-image-${index}`}
              className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[88px_1fr_auto]"
            >
              <div className="relative flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {trimmedImage ? (
                  <Image
                    src={normalizeImagePath(trimmedImage)}
                    alt={`รูปสินค้า ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : (
                  <ImagePlus className="text-slate-400" size={24} />
                )}
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  รูปที่ {index + 1}
                </span>
                <input
                  value={image}
                  onChange={(event) => updateImage(index, event.target.value)}
                  placeholder="อัปโหลดแล้ว path จะมาอยู่ตรงนี้ หรือใส่ URL รูป"
                  className={adminInputClass}
                />
              </label>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className={cn(adminButtonClass.danger, "self-end")}
              >
                <Trash2 size={16} />
                ลบ
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update ShoeForm imports**

In `app/admin/shoes/ShoeForm.tsx`, add:

```tsx
import {
  AdminPageHeader,
  adminButtonClass,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  cn,
} from "../admin-ui"
import ShoeImageManager from "./ShoeImageManager"
```

- [ ] **Step 3: Add image state updater**

Inside `ShoeForm`, add:

```tsx
  function updateImages(images: string[]) {
    setValues((current) => ({
      ...current,
      images,
    }))
  }
```

- [ ] **Step 4: Replace old image URL section**

Remove `updateImage`, `addImageRow`, and `removeImageRow` functions from `ShoeForm`. Replace the existing image section with:

```tsx
        <ShoeImageManager
          images={values.images}
          onImagesChange={updateImages}
        />
```

- [ ] **Step 5: Convert Product form wrapper and fields**

Use:

```tsx
    <div className="max-w-5xl space-y-6">
      <AdminPageHeader
        title={mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า"}
        description="จัดการข้อมูลที่ลูกค้าเห็นใน Store, Product Detail, recommendation และ Checkout"
      />
```

Replace dark panels with:

```tsx
      <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
```

Use `adminInputClass`, `adminSelectClass`, `adminTextareaClass`, `adminButtonClass.secondary`, `adminButtonClass.danger`, and `adminButtonClass.primary` across inputs and buttons.

- [ ] **Step 6: Keep payload image filtering**

Keep this submit logic so empty fallback rows do not save:

```ts
    const images = values.images
      .map((image) => image.trim())
      .filter(Boolean)
```

- [ ] **Step 7: Run TypeScript and lint**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: both commands exit with code 0.

- [ ] **Step 8: Commit product upload form**

```powershell
git add app/admin/shoes/ShoeImageManager.tsx app/admin/shoes/ShoeForm.tsx
git commit -m "feat: add product image upload form"
```

## Task 9: Light Product List

**Files:**
- Modify: `app/admin/shoes/page.tsx`

- [ ] **Step 1: Update imports**

In `app/admin/shoes/page.tsx`, add:

```tsx
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminStatusBadge,
  adminButtonClass,
  cn,
} from "../admin-ui"
```

- [ ] **Step 2: Replace page header**

Use:

```tsx
    <div className="space-y-6">
      <AdminPageHeader
        title="จัดการสินค้า"
        description="ตรวจรูป ราคา featured และ stock ของสินค้าในร้าน"
        actions={
          <AdminLinkButton href="/admin/shoes/new" variant="primary">
            + เพิ่มสินค้า
          </AdminLinkButton>
        }
      />
```

- [ ] **Step 3: Replace table shell classes**

Use:

```tsx
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50">
```

Use `text-slate-600` for header cells, `border-slate-200` for row borders, and `hover:bg-slate-50` for rows.

- [ ] **Step 4: Update featured badge and action controls**

Use `AdminStatusBadge`:

```tsx
<AdminStatusBadge label="Featured" tone="accent" />
```

Use action classes:

```tsx
className="font-semibold text-slate-900 transition hover:text-black"
```

and:

```tsx
className="font-semibold text-red-600 transition hover:text-red-800"
```

- [ ] **Step 5: Update skeleton to light**

Replace skeleton wrapper and table shell with light classes:

```tsx
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลดสินค้า">
```

Use `Skeleton tone="light"` and light borders: `border-slate-200 bg-white`.

- [ ] **Step 6: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 7: Commit product list**

```powershell
git add app/admin/shoes/page.tsx
git commit -m "feat: refresh admin product list"
```

## Task 10: Product Create/Edit Smoke Checks

**Files:**
- Modify only if TypeScript or lint reveals an issue:
  - `app/admin/shoes/new/page.tsx`
  - `app/admin/shoes/[id]/page.tsx`
  - `app/api/admin/shoes/route.ts`
  - `app/api/admin/shoes/[id]/route.ts`

- [ ] **Step 1: Run focused checks**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsc --noEmit --pretty false
```

Expected: upload helper tests and TypeScript pass.

- [ ] **Step 2: Inspect product payload compatibility**

Confirm `ShoeForm` still submits:

```ts
{
  name: values.name.trim(),
  slug,
  description: values.description.trim(),
  featured: values.featured,
  brandId: values.brandId,
  price: numericPrice,
  images,
  specs,
  sizes: normalizedSizes,
}
```

Expected: `images` remains `string[]`, so existing create and update routes continue to work.

- [ ] **Step 3: Commit compatibility fixes**

If Step 1 or Step 2 required changes, commit only those files:

```powershell
git add app/admin/shoes/new/page.tsx app/admin/shoes/[id]/page.tsx app/api/admin/shoes/route.ts app/api/admin/shoes/[id]/route.ts
git commit -m "fix: keep admin product editor compatible"
```

Expected: if there were no changes, skip this commit.

## Task 11: Final Verification And Build

**Files:**
- Review every changed admin and upload file.

- [ ] **Step 1: Run helper tests**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/product-discovery.test.ts
```

Expected: all test files pass with zero failures.

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

If this fails at Prisma DLL rename with `EPERM` on `node_modules\.prisma\client\query_engine-windows.dll.node`, record the exact error, identify the locking Node processes, request approval to stop them, and rerun `npm.cmd run build`.

- [ ] **Step 4: Inspect final git state**

Run:

```powershell
git status --short --branch
git diff --stat
```

Expected: only intentional admin light UI and upload changes are present.

- [ ] **Step 5: Manual local checks after dev server start**

Run the dev server only if the user wants browser verification:

```powershell
npm.cmd run dev
```

Manual routes to check:

- `/admin`
- `/admin/orders`
- `/admin/orders/[existing-id]`
- `/admin/shoes`
- `/admin/shoes/new`
- `/admin/shoes/[existing-id]`

Expected:

- Light admin shell renders on all admin pages.
- Dashboard charts show revenue and status data.
- Order list filters remain usable.
- Order detail forms still submit.
- Product list renders images, stock, and actions.
- Product form uploads local images and stores returned `/uploads/shoes/...` paths.

## Spec Coverage Checklist

- Cohesive light admin UI system: Tasks 1-5 and 9.
- Revenue/status dashboard with charts: Task 3.
- Order list/detail readability: Tasks 4-5.
- Payment and fulfillment controls preserved: Task 5.
- Product table and product form refresh: Tasks 8-9.
- Local upload replacing URL-first workflow: Tasks 6-8.
- Admin-only upload security: Task 7.
- Existing image schema compatibility: Tasks 8 and 10.
- Lint/build verification: Task 11.
