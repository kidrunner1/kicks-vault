type OrderType = {
  id: string
  total: string
  status: string
  createdAt: string
}

interface Props {
  orders: OrderType[]
}

function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "รอตรวจสอบ",
    PAID: "ชำระแล้ว",
    PROCESSING: "กำลังจัดเตรียม",
    SHIPPED: "จัดส่งแล้ว",
    COMPLETED: "สำเร็จ",
    CANCELLED: "ยกเลิก",
  }

  return labels[status] ?? status
}

export default function OrdersSection({ orders }: Props) {

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-light">ออเดอร์ของฉัน</h1>

      {orders.length === 0 && (
        <p className="text-neutral-500">ยังไม่มีออเดอร์</p>
      )}

      {orders.map(order => (
        <div
          key={order.id}
          className="border border-neutral-800 p-8 rounded-xl flex justify-between"
        >
          <div>
            <p className="text-neutral-500 text-sm">
              {new Date(order.createdAt).toLocaleDateString("th-TH")}
            </p>
            <p className="text-xl">฿{order.total}</p>
          </div>

          <span className="uppercase text-sm tracking-wide text-neutral-400">
            {orderStatusLabel(order.status)}
          </span>
        </div>
      ))}

    </div>
  )
}
