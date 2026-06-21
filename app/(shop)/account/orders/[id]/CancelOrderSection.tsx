"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { uiAction } from "@/lib/ui-interactions"
import {
  cancelUserOrder,
  type UserCancelOrderActionState,
} from "./actions"

const initialState: UserCancelOrderActionState = {
  ok: false,
  message: "",
}

export default function CancelOrderSection({
  orderId,
  canCancel,
  reason,
  deadlineLabel,
}: {
  orderId: string
  canCancel: boolean
  reason: string
  deadlineLabel: string
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    cancelUserOrder,
    initialState,
  )

  useEffect(() => {
    if (state.ok) {
      router.refresh()
    }
  }, [router, state.ok])

  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            canCancel
              ? "bg-[#d8ff6a] text-black"
              : "border border-black/10 bg-[#f4f3ef] text-black/55"
          }`}
        >
          {canCancel ? <AlertTriangle size={18} /> : <XCircle size={18} />}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-black">
            ยกเลิกออเดอร์
          </h2>
          <p className="mt-1 text-sm leading-6 text-black/60">{reason}</p>
          <p className="mt-1 text-xs leading-5 text-black/45">
            หมดเขตยกเลิกเอง: {deadlineLabel}
          </p>
        </div>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.ok && <CheckCircle2 className="mr-2 inline" size={15} />}
          {state.message}
        </p>
      )}

      {canCancel ? (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="orderId" value={orderId} />
          <label className="block">
            <span className="text-sm font-medium text-black/70">
              เหตุผลในการยกเลิก <span className="text-red-600">*</span>
            </span>
            <textarea
              name="cancelReason"
              rows={3}
              required
              minLength={3}
              maxLength={500}
              aria-describedby="cancel-reason-help"
              className="mt-2 w-full rounded-lg border border-black/10 bg-[#f8f7f3] px-3 py-3 text-sm text-black outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
            />
          </label>
          <p
            id="cancel-reason-help"
            className="text-xs leading-5 text-black/50"
          >
            เช่น สั่งผิดไซซ์ หรืออยากเปลี่ยนที่อยู่จัดส่ง เมื่อยกเลิกแล้ว
            ระบบจะคืน stock และไม่สามารถกลับมาใช้ออเดอร์เดิมได้
          </p>
          <button
            type="submit"
            disabled={isPending}
            className={`h-11 px-5 text-sm font-semibold ${uiAction.secondary}`}
          >
            {isPending ? "กำลังยกเลิก..." : "ยกเลิกออเดอร์"}
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-black/10 bg-[#f8f7f3] px-4 py-3 text-sm leading-6 text-black/60">
          ถ้าต้องการความช่วยเหลือเพิ่มเติม โปรดติดต่อร้านค้าในขั้นตอนถัดไป
        </div>
      )}
    </section>
  )
}
