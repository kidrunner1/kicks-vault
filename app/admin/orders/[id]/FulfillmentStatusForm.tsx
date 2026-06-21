"use client"

import { useActionState } from "react"
import {
  getAllowedFulfillmentTransitions,
  orderFulfillmentStatusLabels,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
import {
  adminButtonClass,
  adminInputClass,
  adminTextareaClass,
  cn,
} from "../../admin-ui"
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">ออเดอร์นี้ถูกยกเลิกแล้ว</p>
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
          <span className="text-sm font-medium text-slate-700">
            บริษัทขนส่ง
          </span>
          <input
            name="shippingCarrier"
            defaultValue={shippingCarrier ?? ""}
            placeholder="เช่น Kerry Express"
            className={adminInputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Tracking number
          </span>
          <input
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            placeholder="เช่น KRY123456"
            className={adminInputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          เหตุผลในการยกเลิก
        </span>
        <textarea
          name="cancelReason"
          defaultValue={cancelReason ?? ""}
          rows={3}
          maxLength={500}
          placeholder="ต้องกรอกเมื่อกดตั้งเป็นยกเลิก"
          className={adminTextareaClass}
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
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
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
      className={cn(
        isCancel ? adminButtonClass.danger : adminButtonClass.primary,
        "w-full",
      )}
    >
      ตั้งเป็น {orderFulfillmentStatusLabels[status]}
    </button>
  )
}
