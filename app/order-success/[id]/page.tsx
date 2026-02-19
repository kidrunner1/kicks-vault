import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface Props {
  params: {
    id: string
  }
}

export default async function OrderSuccessPage({ params }: Props) {

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          shoe: true
        }
      }
    }
  })

  if (!order) return notFound()

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-20">

      <h1 className="text-4xl mb-10">Order Confirmed</h1>

      <div className="border border-neutral-800 p-10 rounded-xl space-y-6">

        <p className="text-neutral-400">
          Order ID: {order.id}
        </p>

        <p className="text-2xl">
          Total: ${order.total.toString()}
        </p>

        <div className="mt-6 space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.shoe.name}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
