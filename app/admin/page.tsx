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
                      {formatDashboardDate(order.createdAt)} - {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
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
                      {alert.brandName} - Size {alert.size}
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
