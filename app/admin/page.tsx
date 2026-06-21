import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  CreditCard,
  PackagePlus,
  TrendingUp,
  Truck,
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
  PAYMENT_STATUS_LABELS,
  type AdminMetric,
  type AdminMetricTone,
} from "./dashboard-data"

const metricToneClass: Record<AdminMetricTone, string> = {
  neutral: "border-slate-200 bg-white text-slate-950",
  accent: "border-lime-200 bg-lime-50 text-lime-950",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  refund: "border-violet-200 bg-violet-50 text-violet-900",
}

function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function AdminPage() {
  const dashboard = await getAdminDashboardData()
  const highestPipelineCount = Math.max(
    ...dashboard.pipeline.map((item) => item.count),
    0,
  )

  return (
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

      <section aria-labelledby="admin-metrics">
        <h2 id="admin-metrics" className="sr-only">
          ตัวชี้วัดร้าน
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <AdminPanel
          title="สถานะออเดอร์"
          description="จำนวนออเดอร์แยกตามสถานะ"
          icon={<ClipboardList size={18} />}
        >
          {dashboard.pipeline.every((item) => item.count === 0) ? (
            <AdminEmptyState
              title="ยังไม่มีข้อมูลสถานะออเดอร์"
              description="เมื่อมี Checkout ออเดอร์จะแสดงในกราฟนี้"
            />
          ) : (
            <div className="space-y-5">
              {dashboard.pipeline.map((item) => (
                <AdminChartBar
                  key={item.status}
                  label={item.label}
                  value={`${item.count} ออเดอร์`}
                  percent={
                    highestPipelineCount > 0
                      ? Math.round((item.count / highestPipelineCount) * 100)
                      : 0
                  }
                  tone={statusTone(item.status)}
                />
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          title="ออเดอร์ล่าสุด"
          description="รายการออเดอร์ล่าสุดที่พร้อมให้ตรวจสอบ"
          icon={<ClipboardList size={18} />}
        >
          {dashboard.recentOrders.length === 0 ? (
            <AdminEmptyState
              title="ยังไม่มีออเดอร์"
              description="ออเดอร์ใหม่จะแสดงที่นี่หลังลูกค้า Checkout"
            />
          ) : (
            <div className="divide-y divide-slate-200">
              {dashboard.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-3 py-4 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">
                        {order.shortId}
                      </span>
                      <AdminStatusBadge
                        label={ORDER_STATUS_LABELS[order.status]}
                        tone={statusTone(order.status)}
                      />
                      <AdminStatusBadge
                        label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        tone={paymentTone(order.paymentStatus)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {order.customerEmail}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDashboardDate(order.createdAt)} ·{" "}
                      {order.itemCount} รายการ
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-base font-semibold text-slate-950">
                      {order.total}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      รายละเอียด
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel
          title="Payment"
          description="จำนวน mock payment และรายได้แยกตามสถานะ"
          icon={<CreditCard size={18} />}
        >
          {dashboard.paymentSummary.length === 0 ? (
            <AdminEmptyState
              title="ยังไม่มีข้อมูล Payment"
              description="ออเดอร์จาก Checkout จะแสดงสถานะ payment ที่นี่"
            />
          ) : (
            <div className="space-y-5">
              {dashboard.paymentSummary.map((item) => (
                <AdminChartBar
                  key={item.status}
                  label={item.label}
                  value={`${item.count} ออเดอร์`}
                  helper={`รายได้ ${item.revenue}`}
                  percent={item.percent}
                  tone={item.tone}
                />
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          title="Fulfillment"
          description="ความคืบหน้าการเตรียมสินค้า จัดส่ง และยกเลิก"
          icon={<Truck size={18} />}
        >
          {dashboard.fulfillmentSummary.every((item) => item.count === 0) ? (
            <AdminEmptyState
              title="ยังไม่มี fulfillment"
              description="เมื่อมีออเดอร์ ระบบจะแสดงงานที่ต้องเตรียมและจัดส่ง"
            />
          ) : (
            <div className="space-y-5">
              {dashboard.fulfillmentSummary.map((item) => (
                <AdminChartBar
                  key={item.status}
                  label={item.label}
                  value={`${item.count} ออเดอร์`}
                  percent={item.percent}
                  tone={item.tone}
                />
              ))}
            </div>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel
          title="สินค้าขายดี"
          description="จัดอันดับจากจำนวนคู่ที่ขายได้"
          icon={<TrendingUp size={18} />}
        >
          {dashboard.topProducts.length === 0 ? (
            <AdminEmptyState
              title="ยังไม่มีสินค้าขายดี"
              description="รายการขายดีจะแสดงหลังลูกค้า Checkout สำเร็จ"
            />
          ) : (
            <div className="space-y-5">
              {dashboard.topProducts.map((product) => (
                <AdminChartBar
                  key={product.shoeId}
                  label={product.name}
                  value={`ขายแล้ว ${product.quantity} คู่`}
                  helper={product.brandName}
                  percent={product.percent}
                  tone="accent"
                />
              ))}
            </div>
          )}
        </AdminPanel>

        <AdminPanel
          title="สุขภาพ Catalog"
          description="สัญญาณความพร้อมของสินค้าในหน้าร้าน"
          icon={<Boxes size={18} />}
        >
          <div className="space-y-3">
            {dashboard.catalogHealth.map((item) => (
              <div
                key={item.label}
                className={cn("rounded-lg border px-4 py-3", metricToneClass[item.tone])}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {item.helper}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-950">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel
        title="แจ้งเตือน Stock"
        description="ไซซ์ที่เหลือ 3 คู่หรือน้อยกว่า"
        icon={<AlertTriangle size={18} />}
      >
        {dashboard.stockAlerts.length === 0 ? (
          <AdminEmptyState
            title="ยังไม่มีไซซ์ที่ stock ต่ำ"
            description="ระดับ stock ของไซซ์ที่ติดตามยังอยู่ในเกณฑ์ดี"
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {dashboard.stockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {alert.shoeName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {alert.brandName} · ไซซ์ {alert.size}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <AdminStatusBadge
                    label={`เหลือ ${alert.stock}`}
                    tone={alert.stock === 0 ? "danger" : "warning"}
                  />
                  <Link
                    href={`/admin/shoes/${alert.shoeId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 transition hover:text-black"
                  >
                    แก้ไข
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  )
}

function MetricCard({ metric }: { metric: AdminMetric }) {
  const content = (
    <>
      <p className="text-sm font-medium text-slate-600">{metric.label}</p>
      <p className="mt-3 break-words text-3xl font-semibold text-slate-950">
        {metric.value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{metric.helper}</p>
    </>
  )

  const className = cn(
    "block rounded-lg border p-5 shadow-sm transition",
    metricToneClass[metric.tone],
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

function statusTone(status: keyof typeof ORDER_STATUS_LABELS): AdminMetricTone {
  if (status === "PENDING") return "warning"
  if (status === "PROCESSING") return "info"
  if (status === "SHIPPED") return "refund"
  if (status === "DELIVERED") return "success"
  return "danger"
}

function paymentTone(
  status: keyof typeof PAYMENT_STATUS_LABELS,
): AdminMetricTone {
  if (status === "PAID") return "success"
  if (status === "UNPAID") return "warning"
  if (status === "FAILED") return "danger"
  return "refund"
}
