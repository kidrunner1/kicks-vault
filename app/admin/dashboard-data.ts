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
