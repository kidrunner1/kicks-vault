import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminPage() {
  const [
    totalProducts,
    totalBrands,
    totalOrders,
    lowStockSizes,
  ] = await Promise.all([
    prisma.shoe.count(),
    prisma.brand.count(),
    prisma.order.count(),
    prisma.shoeSize.findMany({
      where: {
        stock: {
          lte: 3,
        },
      },
      include: {
        shoe: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 6,
    }),
  ])

  const cards = [
    { label: "Products", value: totalProducts, href: "/admin/shoes" },
    { label: "Brands", value: totalBrands, href: "/admin/shoes/new" },
    { label: "Orders", value: totalOrders, href: "/admin" },
  ]

  return (
    <div className="text-gray-100 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">
          Operational snapshot for product and stock management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition"
          >
            <div className="text-sm text-gray-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold">{card.value}</div>
          </Link>
        ))}
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-medium">Low Stock</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sizes at 3 units or fewer.
            </p>
          </div>
          <Link href="/admin/shoes" className="text-sm text-blue-400 hover:text-blue-300">
            Manage products
          </Link>
        </div>

        {lowStockSizes.length === 0 ? (
          <p className="text-sm text-gray-500">No low-stock sizes.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {lowStockSizes.map((size) => (
              <div key={size.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{size.shoe.name}</p>
                  <p className="text-sm text-gray-500">Size {size.size}</p>
                </div>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-200">
                  {size.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
