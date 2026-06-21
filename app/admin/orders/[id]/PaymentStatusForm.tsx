"use client"

import { useActionState } from "react"
import {
  adminButtonClass,
  adminSelectClass,
  adminTextareaClass,
  cn,
} from "../../admin-ui"
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  paymentMethodLabels,
  paymentStatusLabels,
  type PaymentMethodValue,
  type PaymentStatusValue,
} from "../order-display"
import {
  updateOrderPaymentState,
  type PaymentActionState,
} from "../actions"

const initialState: PaymentActionState = {
  ok: false,
  message: "",
}

export default function PaymentStatusForm({
  orderId,
  paymentStatus,
  paymentMethod,
  paymentNote,
}: {
  orderId: string
  paymentStatus: PaymentStatusValue
  paymentMethod: PaymentMethodValue
  paymentNote: string | null
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderPaymentState,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="paymentMethod"
        >
          วิธีชำระเงิน
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue={paymentMethod}
          className={adminSelectClass}
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {paymentMethodLabels[method]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="paymentNote"
        >
          หมายเหตุ Payment
        </label>
        <textarea
          id="paymentNote"
          name="paymentNote"
          defaultValue={paymentNote ?? ""}
          maxLength={500}
          rows={4}
          className={adminTextareaClass}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {PAYMENT_STATUSES.map((status) => (
          <button
            key={status}
            type="submit"
            name="paymentStatus"
            value={status}
            disabled={pending}
            className={cn(
              status === paymentStatus
                ? adminButtonClass.primary
                : adminButtonClass.secondary,
              "w-full",
            )}
          >
            ตั้งเป็น {paymentStatusLabels[status]}
          </button>
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
