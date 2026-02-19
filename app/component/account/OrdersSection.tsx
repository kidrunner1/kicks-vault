type OrderType = {
  id: string
  total: string
  status: string
  createdAt: string
}

interface Props {
  orders: OrderType[]
}

export default function OrdersSection({ orders }: Props) {

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-light">Orders</h1>

      {orders.length === 0 && (
        <p className="text-neutral-500">No orders yet.</p>
      )}

      {orders.map(order => (
        <div
          key={order.id}
          className="border border-neutral-800 p-8 rounded-xl flex justify-between"
        >
          <div>
            <p className="text-neutral-500 text-sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xl">${order.total}</p>
          </div>

          <span className="uppercase text-sm tracking-wide text-neutral-400">
            {order.status}
          </span>
        </div>
      ))}

    </div>
  )
}
