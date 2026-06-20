import "server-only"

import { OrderStatus, PaymentStatus } from "@prisma/client"
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
  [OrderStatus.PENDING]: "รอดำเนินการ",
  [OrderStatus.PROCESSING]: "กำลังเตรียมสินค้า",
  [OrderStatus.SHIPPED]: "จัดส่งแล้ว",
  [OrderStatus.DELIVERED]: "ส่งสำเร็จ",
  [OrderStatus.CANCELLED]: "ยกเลิกแล้ว",
}

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  [OrderStatus.PROCESSING]: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  [OrderStatus.SHIPPED]: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  [OrderStatus.DELIVERED]: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  [OrderStatus.CANCELLED]: "border-red-400/30 bg-red-400/10 text-red-100",
}

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = [
  PaymentStatus.UNPAID,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: "ยังไม่ชำระ",
  [PaymentStatus.PAID]: "ชำระแล้ว",
  [PaymentStatus.FAILED]: "ชำระไม่สำเร็จ",
  [PaymentStatus.REFUNDED]: "คืนเงินแล้ว",
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
  paymentSummary: {
    status: PaymentStatus
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
    paymentGroups,
    topProductGroups,
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
    prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: {
        _all: true,
      },
      _sum: {
        total: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["shoeId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
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
  const paymentByStatus = new Map(
    paymentGroups.map((group) => [group.paymentStatus, group])
  )
  const highestPaymentCount = Math.max(
    ...paymentGroups.map((group) => group._count._all),
    0,
  )
  const topProductIds = topProductGroups.map((group) => group.shoeId)
  const topProductShoes = topProductIds.length
    ? await prisma.shoe.findMany({
        where: {
          id: {
            in: topProductIds,
          },
        },
        select: {
          id: true,
          name: true,
          brand: {
            select: {
              name: true,
            },
          },
        },
      })
    : []
  const topProductById = new Map(
    topProductShoes.map((shoe) => [shoe.id, shoe])
  )
  const highestProductQuantity = Math.max(
    ...topProductGroups.map((group) => group._sum.quantity ?? 0),
    0,
  )

  return {
    metrics: [
      {
        label: "รายได้",
        value: formatCurrency(totalRevenue._sum.total?.toString() ?? "0"),
        helper: "ยอดรวมออเดอร์ที่ไม่ถูกยกเลิก",
        tone: "accent",
      },
      {
        label: "ออเดอร์วันนี้",
        value: ordersToday.toString(),
        helper: "สร้างหลังเที่ยงคืนของวันนี้",
        tone: ordersToday > 0 ? "accent" : "neutral",
      },
      {
        label: "ออเดอร์รอดำเนินการ",
        value: pendingOrders.toString(),
        helper: "ต้องการการตรวจจาก Admin",
        tone: pendingOrders > 0 ? "warning" : "neutral",
      },
      {
        label: "สินค้า",
        value: totalProducts.toString(),
        helper: `${totalBrands} แบรนด์ใน catalog`,
        href: "/admin/shoes",
        tone: "neutral",
      },
      {
        label: "ไซซ์ที่ Stock เหลือน้อย",
        value: lowStockSizes.length.toString(),
        helper: `${LOW_STOCK_THRESHOLD} คู่หรือน้อยกว่า`,
        href: "/admin/shoes",
        tone: lowStockSizes.length > 0 ? "warning" : "neutral",
      },
      {
        label: "ไซซ์ที่สินค้าหมด",
        value: soldOutSizes.toString(),
        helper: "จำนวน Stock เป็นศูนย์",
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
        label: "สินค้าที่ไม่มีรูป",
        value: productsWithoutImages.toString(),
        helper: "ควรมีอย่างน้อยหนึ่งรูปเพื่อให้หน้าร้านดูน่าเชื่อถือ",
        tone: productsWithoutImages > 0 ? "warning" : "neutral",
      },
      {
        label: "สินค้าที่ไม่มีราคา",
        value: productsWithoutPrice.toString(),
        helper: "Checkout ได้ไม่มั่นใจถ้าไม่มีราคา",
        tone: productsWithoutPrice > 0 ? "danger" : "neutral",
      },
      {
        label: "สินค้า Featured",
        value: featuredProducts.toString(),
        helper: "ใช้ในหน้า Landing และไฮไลต์ของ Store",
        tone: featuredProducts > 0 ? "accent" : "neutral",
      },
      {
        label: "แบรนด์",
        value: totalBrands.toString(),
        helper: "รายการแบรนด์ที่มีในระบบ",
        tone: totalBrands > 0 ? "neutral" : "warning",
      },
      {
        label: "ออเดอร์ทั้งหมด",
        value: totalOrders.toString(),
        helper: "จำนวนออเดอร์ตลอดการใช้งาน",
        tone: totalOrders > 0 ? "neutral" : "warning",
      },
    ],
    paymentSummary:
      totalOrders === 0
        ? []
        : PAYMENT_STATUS_ORDER.map((status) => {
            const group = paymentByStatus.get(status)
            const count = group?._count._all ?? 0

            return {
              status,
              label: PAYMENT_STATUS_LABELS[status],
              count,
              revenue: formatCurrency(group?._sum.total?.toString() ?? "0"),
              percent:
                highestPaymentCount > 0
                  ? Math.round((count / highestPaymentCount) * 100)
                  : 0,
              tone: paymentTone(status),
            }
          }),
    topProducts: topProductGroups.flatMap((group) => {
      const shoe = topProductById.get(group.shoeId)
      const quantity = group._sum.quantity ?? 0

      if (!shoe || quantity <= 0) {
        return []
      }

      return {
        shoeId: shoe.id,
        name: shoe.name,
        brandName: shoe.brand.name,
        quantity,
        percent:
          highestProductQuantity > 0
            ? Math.round((quantity / highestProductQuantity) * 100)
            : 0,
      }
    }),
  }
}

function paymentTone(status: PaymentStatus): AdminMetricTone {
  if (status === PaymentStatus.PAID) {
    return "accent"
  }

  if (status === PaymentStatus.UNPAID) {
    return "warning"
  }

  if (status === PaymentStatus.FAILED) {
    return "danger"
  }

  return "neutral"
}
