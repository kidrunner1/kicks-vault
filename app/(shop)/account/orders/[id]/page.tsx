import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

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
        include: { shoe: true }
      }
    }
  })

  if (!order || order.userId !== user.id) {
    redirect("/account")
  }

  return (
    <div>

      <h1 className="text-4xl mb-16 tracking-tight">
        Order Detail
      </h1>

      <div className="space-y-8">

        {order.items.map(item => (
          <div
            key={item.id}
            className="border border-white/10 p-8 rounded-2xl flex justify-between"
          >

            <div>
              <p className="text-lg">
                {item.shoe.name}
              </p>
              <p className="text-white/40 text-sm mt-2">
                Quantity: {item.quantity}
              </p>
            </div>

            <p className="text-lg">
              ${item.price.toString()}
            </p>

          </div>
        ))}

      </div>

      <div className="mt-16 border-t border-white/10 pt-10 text-right">
        <p className="text-xl">
          Total: ${order.total.toString()}
        </p>
      </div>

    </div>
  )
}
