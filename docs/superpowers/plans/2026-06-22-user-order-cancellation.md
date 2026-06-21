# User Order Cancellation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users cancel their own pending orders within 30 minutes, update the database safely, restore stock once, and show the cancellation flow on order detail.

**Architecture:** Add pure, tested cancellation eligibility rules to `lib/order-fulfillment.ts`, extract the existing admin stock-restore cancellation into a shared helper, then add a user server action and a small client form on `/account/orders/[id]`. Keep the current schema, use Prisma transactions for DB updates, and reuse existing payment/fulfillment behavior.

**Tech Stack:** Next.js 16 App Router, React 19 server actions/client components, TypeScript, Prisma 6, Zod, Node test runner through `tsx`, Tailwind CSS.

---

## Spec

Approved spec: `docs/superpowers/specs/2026-06-22-user-order-cancellation-design.md`

## DB Update Answer

Yes. A successful user cancellation updates the database inside a Prisma transaction:

- `Order.status` becomes `CANCELLED`.
- `Order.cancelledAt` is set.
- `Order.cancelReason` is set to `ลูกค้ายกเลิก: <reason>`.
- `Order.stockRestoredAt` is set.
- `Order.paymentStatus` becomes `REFUNDED` when it was `PAID`; otherwise it follows existing mock-payment cancellation behavior.
- Matching `ShoeSize.stock` rows are incremented by each order item quantity.

No Prisma migration is required in this phase.

## Starting State

- Work on `master` only.
- Use `npm.cmd` in PowerShell for lint/build.
- No new schema migration.
- Existing admin cancellation currently restores stock in a private helper inside `app/admin/orders/actions.ts`.
- User order detail page is `app/(shop)/account/orders/[id]/page.tsx`.

## File Structure

- Modify: `lib/order-fulfillment.ts`
  - Add user cancellation window constants and pure eligibility helpers.
- Modify: `lib/order-fulfillment.test.ts`
  - Add tests for the 30-minute cancellation window and payment mapping.
- Create: `lib/order-cancellation.ts`
  - Shared transaction helper for setting `Order` cancelled fields and restoring stock.
- Modify: `app/admin/orders/actions.ts`
  - Replace private stock-restore cancellation helper with shared `lib/order-cancellation.ts`.
- Create: `app/(shop)/account/orders/[id]/actions.ts`
  - Server action that validates current user, order ownership, cancellation reason, eligibility, and performs the DB transaction.
- Create: `app/(shop)/account/orders/[id]/CancelOrderSection.tsx`
  - Client component rendering the inline cancellation form and disabled reasons.
- Modify: `app/(shop)/account/orders/[id]/page.tsx`
  - Add cancellation eligibility data and render `CancelOrderSection`.
- Create: `lib/user-order-cancellation-copy.test.ts`
  - Guard touched user cancellation files against broken Thai copy.

## Task 1: Add Tested User Cancellation Rules

**Files:**
- Modify: `lib/order-fulfillment.test.ts`
- Modify: `lib/order-fulfillment.ts`

- [ ] **Step 1: Add failing tests for user cancellation rules**

Append these imports to the existing import block in `lib/order-fulfillment.test.ts`:

```ts
  USER_CANCEL_WINDOW_MINUTES,
  formatCustomerCancelReason,
  getUserCancelDeadline,
  getUserCancelEligibility,
```

The import block should become:

```ts
import {
  USER_CANCEL_WINDOW_MINUTES,
  buildFulfillmentTimeline,
  canTransitionOrderStatus,
  formatCustomerCancelReason,
  getAllowedFulfillmentTransitions,
  getUserCancelDeadline,
  getUserCancelEligibility,
  paymentStatusAfterCancellation,
  validateFulfillmentTransition,
} from "./order-fulfillment"
```

Append these tests to `lib/order-fulfillment.test.ts`:

```ts
test("user cancellation is available only while pending within the window", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:29:00.000Z")
  const eligibility = getUserCancelEligibility(
    {
      status: "PENDING",
      createdAt,
      cancelledAt: null,
      stockRestoredAt: null,
    },
    now,
  )

  assert.equal(USER_CANCEL_WINDOW_MINUTES, 30)
  assert.equal(eligibility.canCancel, true)
  assert.equal(eligibility.reason, "ยกเลิกเองได้อีก 1 นาที")
  assert.equal(eligibility.deadline.toISOString(), "2026-06-22T10:30:00.000Z")
  assert.equal(eligibility.remainingMs, 60_000)
})

test("user cancellation closes after the thirty minute window", () => {
  const eligibility = getUserCancelEligibility(
    {
      status: "PENDING",
      createdAt: new Date("2026-06-22T10:00:00.000Z"),
      cancelledAt: null,
      stockRestoredAt: null,
    },
    new Date("2026-06-22T10:30:00.000Z"),
  )

  assert.equal(eligibility.canCancel, false)
  assert.equal(eligibility.reason, "หมดเวลายกเลิกเองแล้ว")
  assert.equal(eligibility.remainingMs, 0)
})

test("user cancellation closes when fulfillment has started", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:05:00.000Z")

  assert.deepEqual(
    getUserCancelEligibility(
      {
        status: "PROCESSING",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: null,
      },
      now,
    ),
    {
      canCancel: false,
      reason: "ออเดอร์กำลังเตรียมสินค้าแล้ว",
      deadline: getUserCancelDeadline(createdAt),
      remainingMs: 25 * 60 * 1000,
    },
  )

  assert.equal(
    getUserCancelEligibility(
      {
        status: "SHIPPED",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: null,
      },
      now,
    ).reason,
    "ออเดอร์จัดส่งแล้ว",
  )
})

test("user cancellation closes for cancelled or restored orders", () => {
  const createdAt = new Date("2026-06-22T10:00:00.000Z")
  const now = new Date("2026-06-22T10:05:00.000Z")

  assert.equal(
    getUserCancelEligibility(
      {
        status: "CANCELLED",
        createdAt,
        cancelledAt: new Date("2026-06-22T10:03:00.000Z"),
        stockRestoredAt: new Date("2026-06-22T10:03:00.000Z"),
      },
      now,
    ).reason,
    "ออเดอร์นี้ถูกยกเลิกแล้ว",
  )

  assert.equal(
    getUserCancelEligibility(
      {
        status: "PENDING",
        createdAt,
        cancelledAt: null,
        stockRestoredAt: new Date("2026-06-22T10:03:00.000Z"),
      },
      now,
    ).reason,
    "ออเดอร์นี้คืน stock แล้ว",
  )
})

test("customer cancellation reason is prefixed for admin context", () => {
  assert.equal(
    formatCustomerCancelReason("  สั่งผิดไซซ์  "),
    "ลูกค้ายกเลิก: สั่งผิดไซซ์",
  )
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
```

Expected: FAIL because `USER_CANCEL_WINDOW_MINUTES`, `getUserCancelDeadline`, `getUserCancelEligibility`, and `formatCustomerCancelReason` are not exported yet.

- [ ] **Step 3: Add cancellation helpers**

In `lib/order-fulfillment.ts`, add these exports after the payment status type definitions:

```ts
export const USER_CANCEL_WINDOW_MINUTES = 30
export const USER_CANCEL_WINDOW_MS = USER_CANCEL_WINDOW_MINUTES * 60 * 1000
```

Add these interfaces after `FulfillmentValidationResult`:

```ts
export interface UserCancelEligibilityOrder {
  status: OrderFulfillmentStatus
  createdAt: Date
  cancelledAt: Date | null
  stockRestoredAt: Date | null
}

export interface UserCancelEligibility {
  canCancel: boolean
  reason: string
  deadline: Date
  remainingMs: number
}
```

Add these functions after `paymentStatusAfterCancellation`:

```ts
export function getUserCancelDeadline(createdAt: Date) {
  return new Date(createdAt.getTime() + USER_CANCEL_WINDOW_MS)
}

export function getUserCancelEligibility(
  order: UserCancelEligibilityOrder,
  now = new Date(),
): UserCancelEligibility {
  const deadline = getUserCancelDeadline(order.createdAt)
  const remainingMs = Math.max(0, deadline.getTime() - now.getTime())

  if (order.status === "CANCELLED" || order.cancelledAt) {
    return {
      canCancel: false,
      reason: "ออเดอร์นี้ถูกยกเลิกแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.stockRestoredAt) {
    return {
      canCancel: false,
      reason: "ออเดอร์นี้คืน stock แล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "PROCESSING") {
    return {
      canCancel: false,
      reason: "ออเดอร์กำลังเตรียมสินค้าแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "SHIPPED") {
    return {
      canCancel: false,
      reason: "ออเดอร์จัดส่งแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (order.status === "DELIVERED") {
    return {
      canCancel: false,
      reason: "ออเดอร์ส่งสำเร็จแล้ว",
      deadline,
      remainingMs,
    }
  }

  if (remainingMs <= 0) {
    return {
      canCancel: false,
      reason: "หมดเวลายกเลิกเองแล้ว",
      deadline,
      remainingMs,
    }
  }

  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000))

  return {
    canCancel: true,
    reason: `ยกเลิกเองได้อีก ${remainingMinutes} นาที`,
    deadline,
    remainingMs,
  }
}

export function formatCustomerCancelReason(reason: string) {
  return `ลูกค้ายกเลิก: ${reason.trim()}`
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
```

Expected: PASS with all order fulfillment tests passing.

- [ ] **Step 5: Run TypeScript**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: exit code 0.

- [ ] **Step 6: Commit cancellation rules**

Run:

```powershell
git add lib/order-fulfillment.ts lib/order-fulfillment.test.ts
git commit -m "feat: add user order cancellation rules"
```

## Task 2: Extract Shared DB Cancellation Helper

**Files:**
- Create: `lib/order-cancellation.ts`
- Modify: `app/admin/orders/actions.ts`

- [ ] **Step 1: Create shared cancellation helper**

Create `lib/order-cancellation.ts`:

```ts
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import {
  paymentStatusAfterCancellation,
  type FulfillmentPaymentStatus,
} from "@/lib/order-fulfillment"

export type OrderForStockRestoringCancellation = {
  id: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  cancelledAt: Date | null
  items: Array<{
    shoeId: string
    size: string | null
    quantity: number
  }>
}

export async function cancelOrderAndRestoreStock({
  tx,
  order,
  cancelReason,
  now = new Date(),
}: {
  tx: Prisma.TransactionClient
  order: OrderForStockRestoringCancellation
  cancelReason: string
  now?: Date
}) {
  const paymentStatus = paymentStatusAfterCancellation(
    order.paymentStatus as FulfillmentPaymentStatus,
  ) as PaymentStatus

  const claimed = await tx.order.updateMany({
    where: {
      id: order.id,
      status: order.status,
      stockRestoredAt: null,
    },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: order.cancelledAt ?? now,
      cancelReason,
      stockRestoredAt: now,
      paymentStatus,
    },
  })

  if (claimed.count !== 1) {
    throw new Error("ออเดอร์นี้ถูกยกเลิกหรือคืน stock ไปแล้ว")
  }

  for (const item of order.items) {
    if (!item.size) {
      throw new Error("ไม่พบ size ของสินค้าในออเดอร์ จึงคืน stock ไม่ได้")
    }

    const restored = await tx.shoeSize.updateMany({
      where: {
        shoeId: item.shoeId,
        size: item.size,
      },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    })

    if (restored.count !== 1) {
      throw new Error(`ไม่พบ stock สำหรับ size ${item.size}`)
    }
  }
}
```

- [ ] **Step 2: Refactor admin action imports**

In `app/admin/orders/actions.ts`, replace the imports from `@/lib/order-fulfillment`:

```ts
import {
  paymentStatusAfterCancellation,
  validateFulfillmentTransition,
  type FulfillmentPaymentStatus,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
```

with:

```ts
import { cancelOrderAndRestoreStock } from "@/lib/order-cancellation"
import {
  validateFulfillmentTransition,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
```

- [ ] **Step 3: Remove private admin-only cancellation code**

In `app/admin/orders/actions.ts`, delete the `OrderForCancellation` type and delete the private `async function cancelOrderAndRestoreStock(...)` at the bottom of the file.

Keep the existing call site unchanged:

```ts
        await cancelOrderAndRestoreStock({
          tx,
          order,
          cancelReason: cancelReason ?? "",
        })
```

- [ ] **Step 4: Run fulfillment tests and TypeScript**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsc --noEmit --pretty false
```

Expected: tests pass and TypeScript exits with code 0.

- [ ] **Step 5: Commit shared DB cancellation helper**

Run:

```powershell
git add lib/order-cancellation.ts app/admin/orders/actions.ts
git commit -m "refactor: share order cancellation stock restore"
```

## Task 3: Add User Cancellation Server Action

**Files:**
- Create: `app/(shop)/account/orders/[id]/actions.ts`

- [ ] **Step 1: Create user server action**

Create `app/(shop)/account/orders/[id]/actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { cancelOrderAndRestoreStock } from "@/lib/order-cancellation"
import { getCurrentUser } from "@/lib/auth"
import {
  formatCustomerCancelReason,
  getUserCancelEligibility,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
import { prisma } from "@/lib/prisma"

export interface UserCancelOrderActionState {
  ok: boolean
  message: string
}

const userCancelOrderSchema = z.object({
  orderId: z.string().uuid(),
  cancelReason: z
    .string()
    .trim()
    .min(3, "กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร")
    .max(500, "เหตุผลต้องไม่เกิน 500 ตัวอักษร"),
})

function actionError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export async function cancelUserOrder(
  _previousState: UserCancelOrderActionState,
  formData: FormData,
): Promise<UserCancelOrderActionState> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      message: "กรุณาเข้าสู่ระบบก่อนยกเลิกออเดอร์",
    }
  }

  const parsed = userCancelOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    cancelReason: formData.get("cancelReason"),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ??
        "กรุณาตรวจสอบข้อมูลการยกเลิกออเดอร์",
    }
  }

  const { orderId, cancelReason } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId: user.id,
        },
        include: {
          items: {
            select: {
              shoeId: true,
              size: true,
              quantity: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error("ไม่พบออเดอร์นี้")
      }

      const eligibility = getUserCancelEligibility({
        status: order.status as OrderFulfillmentStatus,
        createdAt: order.createdAt,
        cancelledAt: order.cancelledAt,
        stockRestoredAt: order.stockRestoredAt,
      })

      if (!eligibility.canCancel) {
        throw new Error(eligibility.reason)
      }

      await cancelOrderAndRestoreStock({
        tx,
        order,
        cancelReason: formatCustomerCancelReason(cancelReason),
      })
    })
  } catch (error) {
    return {
      ok: false,
      message: actionError(error, "ไม่สามารถยกเลิกออเดอร์ได้"),
    }
  }

  revalidatePath("/account")
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/product")

  return {
    ok: true,
    message: "ยกเลิกออเดอร์แล้ว และคืน stock กลับเข้าระบบเรียบร้อย",
  }
}
```

- [ ] **Step 2: Run TypeScript**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: exit code 0.

- [ ] **Step 3: Commit user cancellation action**

Run:

```powershell
git add -- 'app/(shop)/account/orders/[id]/actions.ts'
git commit -m "feat: add user order cancellation action"
```

## Task 4: Add Cancellation UI To User Order Detail

**Files:**
- Create: `app/(shop)/account/orders/[id]/CancelOrderSection.tsx`
- Modify: `app/(shop)/account/orders/[id]/page.tsx`

- [ ] **Step 1: Create client cancellation form**

Create `app/(shop)/account/orders/[id]/CancelOrderSection.tsx`:

```tsx
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
          <p className="mt-1 text-sm leading-6 text-black/60">
            {reason}
          </p>
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
          <p id="cancel-reason-help" className="text-xs leading-5 text-black/50">
            เช่น สั่งผิดไซซ์ หรืออยากเปลี่ยนที่อยู่จัดส่ง เมื่อยกเลิกแล้ว ระบบจะคืน stock และไม่สามารถกลับมาใช้ออเดอร์เดิมได้
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
```

- [ ] **Step 2: Add cancellation eligibility to order detail page**

In `app/(shop)/account/orders/[id]/page.tsx`, add imports:

```tsx
  getUserCancelEligibility,
```

to the import from `@/lib/order-fulfillment`, and add:

```tsx
import CancelOrderSection from "./CancelOrderSection"
```

After `fulfillmentTimeline`, add:

```tsx
  const cancelEligibility = getUserCancelEligibility({
    status: order.status as OrderFulfillmentStatus,
    createdAt: order.createdAt,
    cancelledAt: order.cancelledAt,
    stockRestoredAt: order.stockRestoredAt,
  })
```

In the `<aside className="space-y-5 xl:sticky xl:top-6">`, insert this block after the payment panel and before the shipping address panel:

```tsx
          <CancelOrderSection
            orderId={order.id}
            canCancel={cancelEligibility.canCancel}
            reason={cancelEligibility.reason}
            deadlineLabel={formatOrderDate(cancelEligibility.deadline)}
          />
```

- [ ] **Step 3: Run focused checks**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: tests, TypeScript, and ESLint exit with code 0.

- [ ] **Step 4: Commit cancellation UI**

Run:

```powershell
git add -- 'app/(shop)/account/orders/[id]/CancelOrderSection.tsx' 'app/(shop)/account/orders/[id]/page.tsx'
git commit -m "feat: add user order cancellation UI"
```

## Task 5: Add User Cancellation Copy Guard

**Files:**
- Create: `lib/user-order-cancellation-copy.test.ts`

- [ ] **Step 1: Create copy integrity test**

Create `lib/user-order-cancellation-copy.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const files = [
  "app/(shop)/account/orders/[id]/actions.ts",
  "app/(shop)/account/orders/[id]/CancelOrderSection.tsx",
  "app/(shop)/account/orders/[id]/page.tsx",
  "lib/order-cancellation.ts",
  "lib/order-fulfillment.ts",
]

const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

test("user order cancellation copy does not contain mojibake or replacement characters", () => {
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
```

- [ ] **Step 2: Run copy integrity test**

Run:

```powershell
npx.cmd tsx --test lib/user-order-cancellation-copy.test.ts
```

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 3: Commit copy guard**

Run:

```powershell
git add lib/user-order-cancellation-copy.test.ts
git commit -m "test: cover user cancellation copy integrity"
```

## Task 6: Final QA Verification

**Files:**
- Inspect all changed files from Tasks 1-5.

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/user-order-cancellation-copy.test.ts
npx.cmd tsx --test lib/account-center.test.ts
npx.cmd tsx --test lib/account-center-copy.test.ts
npx.cmd tsx --test lib/admin-copy-integrity.test.ts
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsx --test lib/product-discovery.test.ts
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: production build exits with code 0.

If the build fails at Prisma DLL rename with `EPERM` on `node_modules\.prisma\client\query_engine-windows.dll.node`, record the exact error, identify locking Node processes, request approval to stop them, and rerun `npm.cmd run build`.

- [ ] **Step 4: Inspect git state**

Run:

```powershell
git status --short --branch
git diff --stat
git status --short --ignored public/uploads/shoes
```

Expected:

- No implementation diff remains.
- `master` is ahead of `origin/master`.
- The local uploaded shoe image remains ignored.

- [ ] **Step 5: Browser verification note**

If no dev server/browser session was started, report:

```text
Browser verification was not run in this pass because the user has been opening the app manually. Automated tests, lint, build, and code-level QA passed.
```

## Spec Coverage Checklist

- User can cancel own pending order within 30 minutes: Tasks 1, 3, 4.
- User cannot cancel another user's order: Task 3.
- User cannot cancel after status moves past `PENDING`: Tasks 1, 3, 4.
- User cannot cancel after 30 minutes: Tasks 1, 3, 4.
- DB updates on cancellation: Tasks 2 and 3.
- Stock restored once and only once: Task 2.
- Paid order becomes refunded: Tasks 1 and 2.
- Admin sees customer reason prefix: Tasks 1 and 3.
- Account/order/admin/product revalidation: Task 3.
- No schema migration: all tasks.
- Lint/build verification: Task 6.
