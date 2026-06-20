"use client"

import { useActionState } from "react"
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
          className="text-sm font-medium text-gray-300"
          htmlFor="paymentMethod"
        >
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue={paymentMethod}
          className="mt-2 h-11 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none transition focus:border-white"
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
          className="text-sm font-medium text-gray-300"
          htmlFor="paymentNote"
        >
          Payment note
        </label>
        <textarea
          id="paymentNote"
          name="paymentNote"
          defaultValue={paymentNote ?? ""}
          maxLength={500}
          rows={4}
          className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-white outline-none transition focus:border-white"
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
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              status === paymentStatus
                ? "border-[#d8ff6a] bg-[#d8ff6a] text-black hover:bg-white hover:text-black"
                : "border-gray-700 bg-gray-950 text-gray-200 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Mark as {paymentStatusLabels[status].toLowerCase()}
          </button>
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
