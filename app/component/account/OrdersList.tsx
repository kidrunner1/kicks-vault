interface OrderType {
  id: string
  total: string
  status: string
  createdAt: string
}

interface Props {
  orders: OrderType[]
}

export default function OrdersList({ orders }: Props) {

  return (
    <div className="space-y-10">

      <h2 className="text-2xl font-light">
        Order History
      </h2>

      {orders.length === 0 && (
        <p className="text-neutral-500">
          No orders yet.
        </p>
      )}

      <div className="space-y-6">
        {orders.map(order => (
          <div
            key={order.id}
            className="border border-neutral-800 p-6 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="text-neutral-500 text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>

              <p className="text-lg mt-1">
                ${order.total}
              </p>
            </div>

            <span className="text-xs uppercase tracking-widest text-neutral-400">
              {order.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
