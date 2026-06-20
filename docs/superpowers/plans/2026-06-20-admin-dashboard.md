# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the B1 read-only admin operations dashboard with database-backed store metrics, order pipeline, recent orders, stock alerts, and catalog health.

**Architecture:** Keep `/admin` server-rendered and protected by the existing `app/admin/layout.tsx` admin guard. Move Prisma aggregation into a small server-only helper at `app/admin/dashboard-data.ts`, then render dense operational panels in `app/admin/page.tsx` without adding new API routes or client-side admin data fetching.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, Prisma 6, PostgreSQL, TypeScript, Tailwind CSS, Lucide React.

---

## File Structure

- Create: `app/admin/dashboard-data.ts`
  - Server-only Prisma aggregation for dashboard summary, metric cards, order pipeline, recent orders, stock alerts, and catalog health.
- Modify: `app/admin/page.tsx`
  - Render the new admin operations dashboard from `getAdminDashboardData()`.
- Reference only: `app/admin/layout.tsx`
  - Existing `requireAdmin()` guard remains unchanged.
- Reference only: `lib/commerce.ts`
  - Reuse `formatCurrency()` for revenue and order totals.

## Task 1: Server Dashboard Data Helper

**Files:**
- Create: `app/admin/dashboard-data.ts`

- [ ] **Step 1: Create `app/admin/dashboard-data.ts`**

Create `app/admin/dashboard-data.ts` with this content:

```ts
import "server-only"

import { OrderStatus } from "@prisma/client"
import { formatCurrency } from "@/lib/commerce"
import { prisma } from "@/lib/prisma"

const LOW_STOCK_THRESHOLD = 3
const RECENT_ORDER_LIMIT = 5

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.PROCESSING]: "Processing",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
}

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  [OrderStatus.PROCESSING]: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  [OrderStatus.SHIPPED]: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  [OrderStatus.DELIVERED]: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  [OrderStatus.CANCELLED]: "border-red-400/30 bg-red-400/10 text-red-100",
}

export type AdminMetricTone = "neutral" | "accent" | "warning" | "danger"

export interface AdminMetric {
  label: string
  value: string
  helper: string
  href?: string
  tone: AdminMetricTone
}

export interface AdminDashboardData {
  metrics: AdminMetric[]
  pipeline: {
    status: OrderStatus
    label: string
    count: number
  }[]
  recentOrders: {
    id: string
    shortId: string
    customerEmail: string
    status: OrderStatus
    total: string
    itemCount: number
    createdAt: Date
  }[]
  stockAlerts: {
    id: string
    shoeId: string
    shoeName: string
    brandName: string
    size: string
    stock: number
  }[]
  catalogHealth: {
    label: string
    value: string
    helper: string
    tone: AdminMetricTone
  }[]
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function shortOrderId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const today = startOfToday()

  const [
    totalProducts,
    totalBrands,
    totalOrders,
    featuredProducts,
    totalRevenue,
    ordersToday,
    pendingOrders,
    soldOutSizes,
    productsWithoutPrice,
    productsWithoutImages,
    pipelineGroups,
    recentOrders,
    lowStockSizes,
  ] = await Promise.all([
    prisma.shoe.count(),
    prisma.brand.count(),
    prisma.order.count(),
    prisma.shoe.count({
      where: {
        featured: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      _sum: {
        total: true,
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),
    prisma.shoeSize.count({
      where: {
        stock: 0,
      },
    }),
    prisma.shoe.count({
      where: {
        price: null,
      },
    }),
    prisma.shoe.count({
      where: {
        images: {
          none: {},
        },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
    prisma.order.findMany({
      take: RECENT_ORDER_LIMIT,
      orderBy: {
        createdAt: "desc",
      },
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
    }),
    prisma.shoeSize.findMany({
      where: {
        stock: {
          lte: LOW_STOCK_THRESHOLD,
        },
      },
      include: {
        shoe: {
          select: {
            id: true,
            name: true,
            brand: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          stock: "asc",
        },
        {
          size: "asc",
        },
      ],
      take: 8,
    }),
  ])

  const pipelineByStatus = new Map(
    pipelineGroups.map((group) => [group.status, group._count._all])
  )

  return {
    metrics: [
      {
        label: "Revenue",
        value: formatCurrency(totalRevenue._sum.total?.toString() ?? "0"),
        helper: "Non-cancelled order total",
        tone: "accent",
      },
      {
        label: "Orders today",
        value: ordersToday.toString(),
        helper: "Created since local midnight",
        tone: ordersToday > 0 ? "accent" : "neutral",
      },
      {
        label: "Pending orders",
        value: pendingOrders.toString(),
        helper: "Need admin attention",
        tone: pendingOrders > 0 ? "warning" : "neutral",
      },
      {
        label: "Products",
        value: totalProducts.toString(),
        helper: `${totalBrands} brands in catalog`,
        href: "/admin/shoes",
        tone: "neutral",
      },
      {
        label: "Low-stock sizes",
        value: lowStockSizes.length.toString(),
        helper: `${LOW_STOCK_THRESHOLD} units or fewer`,
        href: "/admin/shoes",
        tone: lowStockSizes.length > 0 ? "warning" : "neutral",
      },
      {
        label: "Sold-out sizes",
        value: soldOutSizes.toString(),
        helper: "Stock count is zero",
        href: "/admin/shoes",
        tone: soldOutSizes > 0 ? "danger" : "neutral",
      },
    ],
    pipeline: ORDER_STATUS_ORDER.map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: pipelineByStatus.get(status) ?? 0,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      shortId: shortOrderId(order.id),
      customerEmail: order.user.email,
      status: order.status,
      total: formatCurrency(order.total.toString()),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    })),
    stockAlerts: lowStockSizes.map((row) => ({
      id: row.id,
      shoeId: row.shoe.id,
      shoeName: row.shoe.name,
      brandName: row.shoe.brand.name,
      size: row.size,
      stock: row.stock,
    })),
    catalogHealth: [
      {
        label: "Products without images",
        value: productsWithoutImages.toString(),
        helper: "Need at least one image for storefront confidence",
        tone: productsWithoutImages > 0 ? "warning" : "neutral",
      },
      {
        label: "Products without price",
        value: productsWithoutPrice.toString(),
        helper: "Cannot support confident checkout without price",
        tone: productsWithoutPrice > 0 ? "danger" : "neutral",
      },
      {
        label: "Featured products",
        value: featuredProducts.toString(),
        helper: "Used by landing and store highlights",
        tone: featuredProducts > 0 ? "accent" : "neutral",
      },
      {
        label: "Brands",
        value: totalBrands.toString(),
        helper: "Available brand taxonomy",
        tone: totalBrands > 0 ? "neutral" : "warning",
      },
      {
        label: "Total orders",
        value: totalOrders.toString(),
        helper: "Lifetime order records",
        tone: totalOrders > 0 ? "neutral" : "warning",
      },
    ],
  }
}
```

- [ ] **Step 2: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected:

- `npm.cmd run lint` exits with code 0.
- `npx.cmd tsc --noEmit --pretty false` exits with code 0.

- [ ] **Step 3: Commit the helper**

Run:

```powershell
git add app/admin/dashboard-data.ts
git commit -m "feat: add admin dashboard data"
```

Expected: a commit is created on `master`.

## Task 2: Operations Dashboard UI

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Replace `app/admin/page.tsx`**

Replace `app/admin/page.tsx` with this content:

```tsx
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  PackagePlus,
} from "lucide-react"
import {
  getAdminDashboardData,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  type AdminMetric,
  type AdminMetricTone,
} from "./dashboard-data"

const metricToneClass: Record<AdminMetricTone, string> = {
  neutral: "border-gray-800 bg-gray-900 text-gray-100",
  accent: "border-[#d8ff6a]/40 bg-[#d8ff6a]/10 text-[#ecff9c]",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  danger: "border-red-400/30 bg-red-400/10 text-red-100",
}

function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboardData()

  return (
    <div className="space-y-8 text-gray-100">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Operations Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Store health across orders, stock, and catalog readiness. This
            phase is read-only so the dashboard can stay dependable while order
            actions are added next.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/shoes"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-100 transition hover:border-gray-500 hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          >
            Manage products
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/admin/shoes/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-black bg-[#d8ff6a] px-4 py-2 text-sm font-semibold text-black transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          >
            <PackagePlus size={16} />
            Add shoe
          </Link>
        </div>
      </header>

      <section aria-labelledby="admin-metrics">
        <h2 id="admin-metrics" className="sr-only">
          Store metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dashboard.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <SectionPanel
          title="Order pipeline"
          description="Status count across all orders."
          icon={<ClipboardList size={18} />}
        >
          <div className="space-y-3">
            {dashboard.pipeline.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950/60 px-4 py-3"
              >
                <StatusBadge status={item.status} />
                <span className="text-lg font-semibold text-white">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel
          title="Recent orders"
          description="Latest order records, ready for B2 order management."
          icon={<ClipboardList size={18} />}
        >
          {dashboard.recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="New checkout orders will appear here once customers start buying."
            />
          ) : (
            <div className="divide-y divide-gray-800">
              {dashboard.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">
                        {order.shortId}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      {order.customerEmail}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDashboardDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-base font-semibold text-white">
                      {order.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,1.1fr)_minmax(0,0.9fr)]">
        <SectionPanel
          title="Stock alerts"
          description="Sizes at 3 units or fewer."
          icon={<AlertTriangle size={18} />}
        >
          {dashboard.stockAlerts.length === 0 ? (
            <EmptyState
              title="No low-stock sizes"
              description="Stock levels are healthy across tracked shoe sizes."
            />
          ) : (
            <div className="divide-y divide-gray-800">
              {dashboard.stockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-white">{alert.shoeName}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {alert.brandName} · Size {alert.size}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-100">
                      {alert.stock} left
                    </span>
                    <Link
                      href={`/admin/shoes/${alert.shoeId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#ecff9c] transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
                    >
                      Edit
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>

        <SectionPanel
          title="Catalog health"
          description="Product readiness signals for the storefront."
          icon={<Boxes size={18} />}
        >
          <div className="space-y-3">
            {dashboard.catalogHealth.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg border px-4 py-3 ${metricToneClass[item.tone]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-300">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {item.helper}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  )
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  const content = (
    <>
      <p className="text-sm font-medium text-gray-400">{metric.label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
      <p className="mt-2 text-xs leading-5 text-gray-500">{metric.helper}</p>
    </>
  )

  const className = `block rounded-lg border p-5 transition ${metricToneClass[metric.tone]}`

  if (metric.href) {
    return (
      <Link
        href={metric.href}
        className={`${className} hover:border-gray-500 hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950`}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

function SectionPanel({
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

function StatusBadge({
  status,
}: {
  status: keyof typeof ORDER_STATUS_LABELS
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${ORDER_STATUS_TONES[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-800 bg-gray-950/60 p-5">
      <p className="font-medium text-gray-200">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  )
}
```

- [ ] **Step 2: Run lint and type checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
```

Expected:

- `npm.cmd run lint` exits with code 0.
- `npx.cmd tsc --noEmit --pretty false` exits with code 0.

- [ ] **Step 3: Commit the UI**

Run:

```powershell
git add app/admin/page.tsx
git commit -m "feat: build admin operations dashboard"
```

Expected: a commit is created on `master`.

## Task 3: Verification And Final Checkpoint

**Files:**
- Verify: `app/admin/dashboard-data.ts`
- Verify: `app/admin/page.tsx`
- Verify: `docs/superpowers/specs/2026-06-20-admin-dashboard-design.md`

- [ ] **Step 1: Run source checks**

Run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
git diff --check
```

Expected:

- ESLint exits with code 0.
- TypeScript exits with code 0.
- `git diff --check` exits with code 0. CRLF warnings are acceptable on Windows, but whitespace errors are not.

- [ ] **Step 2: Run Next production build**

Run:

```powershell
npx.cmd next build
```

Expected:

- Build exits with code 0.
- `/admin` is listed as a dynamic route.
- No new CSS optimizer warnings are introduced.

- [ ] **Step 3: Run project build command**

Run:

```powershell
npm.cmd run build
```

Expected:

- If no local Prisma DLL lock exists, the command exits with code 0.
- If Windows reports `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`, record that exact blocker and do not claim the full project build passed.

- [ ] **Step 4: Inspect final diff**

Run:

```powershell
git status --short --branch
git diff --stat
```

Expected:

- Only B1 admin dashboard implementation files remain changed, unless a previous approved checkpoint is still intentionally staged or committed.
- No `.env` files appear in the changed file list.

- [ ] **Step 5: Commit verification follow-up if needed**

If Task 3 required any fixes, run:

```powershell
git add app/admin/dashboard-data.ts app/admin/page.tsx
git commit -m "fix: polish admin dashboard verification"
```

Expected: this command is only used if Task 3 produced code changes.

## Self-Review

- Spec coverage: the plan covers header summary, metric cards, order pipeline, recent orders, stock alerts, catalog health, server-side Prisma loading, empty states, security, accessibility, and verification.
- Scope check: B1 remains read-only. It does not add order mutation, stock editing, payment, external analytics, or new chart dependencies.
- Type consistency: `OrderStatus`, `AdminMetric`, `AdminMetricTone`, and `AdminDashboardData` are defined in Task 1 and imported by Task 2 with matching names.
- Completeness scan: the plan contains no unfinished markers, vague sections, or undefined helper names.
