"use client"

import { useActionState } from "react"
import {
  getAllowedFulfillmentTransitions,
  orderFulfillmentStatusLabels,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
import {
  updateOrderFulfillmentState,
  type FulfillmentActionState,
} from "../actions"

const initialState: FulfillmentActionState = {
  ok: false,
  message: "",
}

export default function FulfillmentStatusForm({
  orderId,
  status,
  shippingCarrier,
  trackingNumber,
  cancelReason,
}: {
  orderId: string
  status: OrderFulfillmentStatus
  shippingCarrier: string | null
  trackingNumber: string | null
  cancelReason: string | null
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderFulfillmentState,
    initialState,
  )
  const nextStatuses = getAllowedFulfillmentTransitions(status)

  if (status === "CANCELLED") {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
        <p className="font-medium">ออเดอร์นี้ถูกยกเลิกแล้ว</p>
        <p className="mt-2 leading-6">
          {cancelReason ||
            "ไม่สามารถเปลี่ยนสถานะกลับได้ เพื่อป้องกัน stock เพี้ยน"}
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-300">
            บริษัทขนส่ง
          </span>
          <input
            name="shippingCarrier"
            defaultValue={shippingCarrier ?? ""}
            placeholder="เช่น Kerry Express"
            className="mt-2 h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">
            Tracking number
          </span>
          <input
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            placeholder="เช่น KRY123456"
            className="mt-2 h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-300">
          เหตุผลในการยกเลิก
        </span>
        <textarea
          name="cancelReason"
          defaultValue={cancelReason ?? ""}
          rows={3}
          maxLength={500}
          placeholder="ต้องกรอกเมื่อกดตั้งเป็นยกเลิก"
          className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-white"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {nextStatuses.map((nextStatus) => (
          <FulfillmentButton
            key={nextStatus}
            status={nextStatus}
            pending={pending}
          />
        ))}
      </div>

      {state.message && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/30 bg-red-400/10 text-red-100"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}

function FulfillmentButton({
  status,
  pending,
}: {
  status: OrderFulfillmentTargetStatus
  pending: boolean
}) {
  const isCancel = status === "CANCELLED"

  return (
    <button
      type="submit"
      name="status"
      value={status}
      disabled={pending}
      className={`rounded-lg border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isCancel
          ? "border-red-400/40 bg-red-400/10 text-red-100 hover:bg-red-400/20"
          : "border-[#d8ff6a] bg-[#d8ff6a] text-black hover:bg-white hover:text-black"
      }`}
    >
      ตั้งเป็น {orderFulfillmentStatusLabels[status]}
    </button>
  )
}
