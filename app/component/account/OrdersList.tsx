interface OrderType {
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

export default function OrdersList({ orders }: Props) {

  return (
    <div className="space-y-10">

      <h2 className="text-2xl font-light">
        ประวัติออเดอร์
      </h2>

      {orders.length === 0 && (
        <p className="text-neutral-500">
          ยังไม่มีออเดอร์
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
                {new Date(order.createdAt).toLocaleDateString("th-TH")}
              </p>

              <p className="text-lg mt-1">
                ฿{order.total}
              </p>
            </div>

            <span className="text-xs uppercase tracking-widest text-neutral-400">
              {orderStatusLabel(order.status)}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
