import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          shoe: {
            include: { images: true }
          }
        }
      }
    }
  })

  if (!order || order.userId !== user.id) {
    redirect("/account")
  }

  return (
    <div className="space-y-12">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

        <div>
          <h1 className="text-3xl font-semibold">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-black/50 mt-2">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <span className="px-4 py-2 rounded-full bg-black text-white text-xs uppercase tracking-wider">
          {order.status}
        </span>

      </div>

      {/* ================= ITEMS ================= */}
      <div className="bg-white border border-black/10 rounded-3xl p-8 space-y-8">

        {order.items.map(item => {

          const imageUrl = normalizeImagePath(
            item.shoe.images?.[0]?.url
          )

          return (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-black/5 pb-6 last:border-none"
            >

              <div className="flex gap-6 items-center">

                {/* Image */}
                <div className="w-24 h-24 bg-white border border-black/5 rounded-xl flex items-center justify-center overflow-hidden">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={item.shoe.name}
                      width={90}
                      height={90}
                      className="object-contain"
                    />
                  )}
                </div>

                {/* Info */}
                <div>
                  <p className="font-medium text-lg">
                    {item.shoe.name}
                  </p>
                  <p className="text-sm text-black/50 mt-1">
                    Size: {item.size}
                  </p>
                  <p className="text-sm text-black/50">
                    Quantity: {item.quantity}
                  </p>
                </div>

              </div>

              {/* Price */}
              <p className="font-medium text-lg">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>

            </div>
          )
        })}

      </div>

      {/* ================= SUMMARY ================= */}
      <div className="bg-white border border-black/10 rounded-3xl p-8">

        <div className="space-y-4 text-sm">

          <div className="flex justify-between">
            <span className="text-black/60">Subtotal</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-black/60">Shipping</span>
            <span>Free</span>
          </div>

          <div className="border-t border-black/10 pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>

        </div>

      </div>

    </div>
  )
}