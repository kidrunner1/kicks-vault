# Order Fulfillment And Stock Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-controlled order fulfillment with carrier tracking, cancellation, and exactly-once stock restoration.

**Architecture:** Store fulfillment fields directly on `Order`, centralize transition rules in a pure `lib/order-fulfillment.ts` helper, and update order fulfillment through a protected admin server action. Cancellation uses a Prisma transaction and an atomic `stockRestoredAt` guard so stock is restored once even if an admin submits twice.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components and Server Actions, Prisma 6, PostgreSQL, Zod, TypeScript, Node test runner, Tailwind CSS, Lucide React.

---

## File Structure

- Modify: `prisma/schema.prisma`
  - Add fulfillment, tracking, cancellation, and stock restore marker fields to `Order`.
- Create: `prisma/migrations/20260621120000_add_order_fulfillment_fields/migration.sql`
  - Add nullable fulfillment columns to the existing `Order` table.
- Create: `lib/order-fulfillment.ts`
  - Pure order transition rules, validation helpers, cancellation payment mapping, and user timeline builder.
- Create: `lib/order-fulfillment.test.ts`
  - Node tests for valid transitions, required fields, cancelled lock, paid refund mapping, and timeline behavior.
- Modify: `app/admin/orders/actions.ts`
  - Add a protected fulfillment server action using the helper and a Prisma transaction.
- Create: `app/admin/orders/[id]/FulfillmentStatusForm.tsx`
  - Client form for admin status changes, shipping fields, tracking fields, and cancellation reason.
- Modify: `app/admin/orders/[id]/page.tsx`
  - Render fulfillment state, timestamps, tracking details, and the new admin form.
- Modify: `app/(shop)/account/orders/[id]/page.tsx`
  - Show user-facing fulfillment timeline, tracking details, and cancellation reason.
- Modify: `app/admin/dashboard-data.ts`
  - Confirm existing status pipeline and stock alerts use the restored stock automatically; no query shape change required unless TypeScript needs the new fields.

## Task 1: Database Fulfillment Fields

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260621120000_add_order_fulfillment_fields/migration.sql`

- [ ] **Step 1: Add fulfillment fields to `Order`**

In `prisma/schema.prisma`, add these fields after the existing payment fields:

```prisma
  paymentStatus PaymentStatus @default(UNPAID)
  paymentMethod PaymentMethod @default(MANUAL)
  paidAt        DateTime?
  paymentNote   String?

  shippingCarrier String?
  trackingNumber  String?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  stockRestoredAt DateTime?

  items OrderItem[]
```

- [ ] **Step 2: Create migration SQL**

Create `prisma/migrations/20260621120000_add_order_fulfillment_fields/migration.sql`:

```sql
ALTER TABLE "Order"
ADD COLUMN "shippingCarrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "stockRestoredAt" TIMESTAMP(3);
```

- [ ] **Step 3: Validate Prisma schema**

Run:

```powershell
npx.cmd prisma validate --schema prisma/schema.prisma
```

Expected: Prisma reports the schema is valid.

- [ ] **Step 4: Commit database fields**

```powershell
git add prisma/schema.prisma prisma/migrations/20260621120000_add_order_fulfillment_fields/migration.sql
git commit -m "feat: add order fulfillment fields"
```

## Task 2: Fulfillment Rules And Tests

**Files:**
- Create: `lib/order-fulfillment.ts`
- Create: `lib/order-fulfillment.test.ts`

- [ ] **Step 1: Write failing tests for fulfillment rules**

Create `lib/order-fulfillment.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import {
  buildFulfillmentTimeline,
  canTransitionOrderStatus,
  getAllowedFulfillmentTransitions,
  paymentStatusAfterCancellation,
  validateFulfillmentTransition,
} from "./order-fulfillment"

test("order status transitions follow the fulfillment workflow", () => {
  assert.deepEqual(getAllowedFulfillmentTransitions("PENDING"), [
    "PROCESSING",
    "CANCELLED",
  ])
  assert.equal(canTransitionOrderStatus("PENDING", "PROCESSING"), true)
  assert.equal(canTransitionOrderStatus("PROCESSING", "SHIPPED"), true)
  assert.equal(canTransitionOrderStatus("SHIPPED", "DELIVERED"), true)
  assert.equal(canTransitionOrderStatus("DELIVERED", "CANCELLED"), true)
  assert.equal(canTransitionOrderStatus("PENDING", "DELIVERED"), false)
  assert.equal(canTransitionOrderStatus("CANCELLED", "PROCESSING"), false)
})

test("shipping requires carrier and tracking number", () => {
  const missingTracking = validateFulfillmentTransition({
    currentStatus: "PROCESSING",
    nextStatus: "SHIPPED",
    shippingCarrier: "Kerry Express",
    trackingNumber: "",
  })

  assert.equal(missingTracking.ok, false)
  assert.match(missingTracking.message, /Tracking/)

  const validShipping = validateFulfillmentTransition({
    currentStatus: "PROCESSING",
    nextStatus: "SHIPPED",
    shippingCarrier: "Kerry Express",
    trackingNumber: "KRY123456",
  })

  assert.equal(validShipping.ok, true)
})

test("cancellation requires reason and paid orders become refunded", () => {
  const missingReason = validateFulfillmentTransition({
    currentStatus: "PENDING",
    nextStatus: "CANCELLED",
    cancelReason: " ",
  })

  assert.equal(missingReason.ok, false)
  assert.match(missingReason.message, /เหตุผล/)
  assert.equal(paymentStatusAfterCancellation("PAID"), "REFUNDED")
  assert.equal(paymentStatusAfterCancellation("UNPAID"), "UNPAID")
})

test("timeline shows cancelled state instead of continuing normal progress", () => {
  const createdAt = new Date("2026-06-21T08:00:00.000Z")
  const cancelledAt = new Date("2026-06-21T09:00:00.000Z")
  const timeline = buildFulfillmentTimeline({
    status: "CANCELLED",
    createdAt,
    shippedAt: null,
    deliveredAt: null,
    cancelledAt,
    cancelReason: "ลูกค้าขอยกเลิก",
  })

  assert.deepEqual(
    timeline.map((step) => step.state),
    ["complete", "cancelled"],
  )
  assert.equal(timeline[1].title, "ยกเลิกออเดอร์")
  assert.equal(timeline[1].date, cancelledAt)
})
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
```

Expected: FAIL because `lib/order-fulfillment.ts` does not exist yet.

- [ ] **Step 3: Add fulfillment helper**

Create `lib/order-fulfillment.ts`:

```ts
export const ORDER_FULFILLMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const ORDER_FULFILLMENT_TARGET_STATUSES = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const FULFILLMENT_PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const

export type OrderFulfillmentStatus =
  (typeof ORDER_FULFILLMENT_STATUSES)[number]

export type OrderFulfillmentTargetStatus =
  (typeof ORDER_FULFILLMENT_TARGET_STATUSES)[number]

export type FulfillmentPaymentStatus =
  (typeof FULFILLMENT_PAYMENT_STATUSES)[number]

export type FulfillmentTimelineStepState =
  | "complete"
  | "current"
  | "pending"
  | "cancelled"

export interface FulfillmentTimelineInput {
  status: OrderFulfillmentStatus
  createdAt: Date
  shippedAt: Date | null
  deliveredAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
}

export interface FulfillmentTimelineStep {
  key: string
  title: string
  detail: string
  state: FulfillmentTimelineStepState
  date: Date | null
}

export interface FulfillmentTransitionInput {
  currentStatus: OrderFulfillmentStatus
  nextStatus: OrderFulfillmentTargetStatus
  shippingCarrier?: string | null
  trackingNumber?: string | null
  cancelReason?: string | null
}

export type FulfillmentValidationResult =
  | { ok: true }
  | { ok: false; message: string }

const allowedTransitions: Record<
  OrderFulfillmentStatus,
  OrderFulfillmentTargetStatus[]
> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CANCELLED"],
  CANCELLED: [],
}

export const orderFulfillmentStatusLabels: Record<
  OrderFulfillmentStatus,
  string
> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังเตรียมสินค้า",
  SHIPPED: "จัดส่งแล้ว",
  DELIVERED: "ส่งสำเร็จ",
  CANCELLED: "ยกเลิกแล้ว",
}

export function getAllowedFulfillmentTransitions(
  currentStatus: OrderFulfillmentStatus,
) {
  return allowedTransitions[currentStatus] ?? []
}

export function canTransitionOrderStatus(
  currentStatus: OrderFulfillmentStatus,
  nextStatus: OrderFulfillmentTargetStatus,
) {
  return getAllowedFulfillmentTransitions(currentStatus).includes(nextStatus)
}

export function validateFulfillmentTransition({
  currentStatus,
  nextStatus,
  shippingCarrier,
  trackingNumber,
  cancelReason,
}: FulfillmentTransitionInput): FulfillmentValidationResult {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    return {
      ok: false,
      message: "ไม่สามารถเปลี่ยนสถานะออเดอร์ด้วยลำดับนี้ได้",
    }
  }

  if (nextStatus === "SHIPPED") {
    if (!shippingCarrier?.trim()) {
      return {
        ok: false,
        message: "กรุณาระบุบริษัทขนส่ง",
      }
    }

    if (!trackingNumber?.trim()) {
      return {
        ok: false,
        message: "กรุณาระบุ Tracking number",
      }
    }
  }

  if (nextStatus === "CANCELLED" && !cancelReason?.trim()) {
    return {
      ok: false,
      message: "กรุณาระบุเหตุผลในการยกเลิก",
    }
  }

  return { ok: true }
}

export function paymentStatusAfterCancellation(
  currentStatus: FulfillmentPaymentStatus,
): FulfillmentPaymentStatus {
  return currentStatus === "PAID" ? "REFUNDED" : currentStatus
}

export function buildFulfillmentTimeline(
  order: FulfillmentTimelineInput,
): FulfillmentTimelineStep[] {
  if (order.status === "CANCELLED") {
    return [
      {
        key: "created",
        title: "รับออเดอร์",
        detail: "ระบบบันทึกออเดอร์และตัด stock แล้ว",
        state: "complete",
        date: order.createdAt,
      },
      {
        key: "cancelled",
        title: "ยกเลิกออเดอร์",
        detail: order.cancelReason?.trim() || "ออเดอร์นี้ถูกยกเลิกแล้ว",
        state: "cancelled",
        date: order.cancelledAt,
      },
    ]
  }

  return [
    {
      key: "created",
      title: "รับออเดอร์",
      detail: "ระบบบันทึกออเดอร์และตัด stock แล้ว",
      state: "complete",
      date: order.createdAt,
    },
    {
      key: "processing",
      title: "กำลังเตรียมสินค้า",
      detail: "ทีมร้านค้ากำลังตรวจสอบสินค้าและแพ็กออเดอร์",
      state:
        order.status === "PROCESSING"
          ? "current"
          : ["SHIPPED", "DELIVERED"].includes(order.status)
            ? "complete"
            : "pending",
      date: null,
    },
    {
      key: "shipped",
      title: "จัดส่งแล้ว",
      detail: "ออเดอร์ออกจากร้านแล้ว",
      state:
        order.status === "SHIPPED"
          ? "current"
          : order.status === "DELIVERED"
            ? "complete"
            : "pending",
      date: order.shippedAt,
    },
    {
      key: "delivered",
      title: "ส่งสำเร็จ",
      detail: "ออเดอร์ถึงปลายทางแล้ว",
      state: order.status === "DELIVERED" ? "complete" : "pending",
      date: order.deliveredAt,
    },
  ]
}
```

- [ ] **Step 4: Run fulfillment tests**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
```

Expected: PASS, all fulfillment helper tests pass.

- [ ] **Step 5: Commit helper and tests**

```powershell
git add lib/order-fulfillment.ts lib/order-fulfillment.test.ts
git commit -m "test: cover order fulfillment rules"
```

## Task 3: Admin Fulfillment Server Action

**Files:**
- Modify: `app/admin/orders/actions.ts`

- [ ] **Step 1: Update imports**

In `app/admin/orders/actions.ts`, update imports:

```ts
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import {
  paymentStatusAfterCancellation,
  validateFulfillmentTransition,
  type FulfillmentPaymentStatus,
  type OrderFulfillmentStatus,
  type OrderFulfillmentTargetStatus,
} from "@/lib/order-fulfillment"
import { prisma } from "@/lib/prisma"
```

- [ ] **Step 2: Add action state and Zod schema**

Below the existing `PaymentActionState`, add:

```ts
export interface FulfillmentActionState {
  ok: boolean
  message: string
}

const fulfillmentUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  shippingCarrier: z.string().trim().max(80).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
  cancelReason: z.string().trim().max(500).optional(),
})
```

- [ ] **Step 3: Add small local utilities**

Below the schemas, add:

```ts
function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function actionError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
```

- [ ] **Step 4: Add the fulfillment server action**

Add this function after `updateOrderPaymentState`:

```ts
export async function updateOrderFulfillmentState(
  _previousState: FulfillmentActionState,
  formData: FormData,
): Promise<FulfillmentActionState> {
  await requireAdmin()

  const parsed = fulfillmentUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    shippingCarrier: optionalText(formData.get("shippingCarrier")),
    trackingNumber: optionalText(formData.get("trackingNumber")),
    cancelReason: optionalText(formData.get("cancelReason")),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: "ข้อมูล Fulfillment ไม่ถูกต้อง",
    }
  }

  const {
    orderId,
    status,
    shippingCarrier,
    trackingNumber,
    cancelReason,
  } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
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

      const validation = validateFulfillmentTransition({
        currentStatus: order.status as OrderFulfillmentStatus,
        nextStatus: status as OrderFulfillmentTargetStatus,
        shippingCarrier,
        trackingNumber,
        cancelReason,
      })

      if (!validation.ok) {
        throw new Error(validation.message)
      }

      if (status === OrderStatus.CANCELLED) {
        await cancelOrderAndRestoreStock({
          tx,
          order,
          cancelReason: cancelReason ?? "",
        })
        return
      }

      const now = new Date()
      const data: Prisma.OrderUpdateManyMutationInput = {
        status: status as OrderStatus,
      }

      if (status === OrderStatus.SHIPPED) {
        data.shippingCarrier = shippingCarrier
        data.trackingNumber = trackingNumber
        data.shippedAt = order.shippedAt ?? now
      }

      if (status === OrderStatus.DELIVERED) {
        data.deliveredAt = order.deliveredAt ?? now
      }

      const updated = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data,
      })

      if (updated.count !== 1) {
        throw new Error("สถานะออเดอร์ถูกเปลี่ยนไปแล้ว กรุณารีเฟรชหน้า")
      }
    })
  } catch (error) {
    return {
      ok: false,
      message: actionError(error, "ไม่สามารถอัปเดต Fulfillment ได้"),
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/account/orders")
  revalidatePath(`/account/orders/${orderId}`)

  return {
    ok: true,
    message: "อัปเดต Fulfillment แล้ว",
  }
}
```

- [ ] **Step 5: Add the cancellation transaction helper**

Below `actionError`, add the local cancellation type:

```ts
type OrderForCancellation = {
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
```

Below `updateOrderFulfillmentState`, add:

```ts
async function cancelOrderAndRestoreStock({
  tx,
  order,
  cancelReason,
}: {
  tx: Prisma.TransactionClient
  order: OrderForCancellation
  cancelReason: string
}) {
  const now = new Date()
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

- [ ] **Step 6: Run tests and TypeScript**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsc --noEmit --pretty false
```

Expected: both commands pass.

- [ ] **Step 7: Commit server action**

```powershell
git add app/admin/orders/actions.ts
git commit -m "feat: add admin fulfillment action"
```

## Task 4: Admin Fulfillment UI

**Files:**
- Create: `app/admin/orders/[id]/FulfillmentStatusForm.tsx`
- Modify: `app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Create admin fulfillment form**

Create `app/admin/orders/[id]/FulfillmentStatusForm.tsx`:

```tsx
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
          {cancelReason || "ไม่สามารถเปลี่ยนสถานะกลับได้ เพื่อป้องกัน stock เพี้ยน"}
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
```

- [ ] **Step 2: Update admin order detail imports**

In `app/admin/orders/[id]/page.tsx`, update the Lucide import:

```ts
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  PackageCheck,
  Truck,
  User,
} from "lucide-react"
```

Add imports:

```ts
import {
  orderFulfillmentStatusLabels,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
import FulfillmentStatusForm from "./FulfillmentStatusForm"
```

- [ ] **Step 3: Add fulfillment rows to the summary panel**

Inside the admin detail order summary grid, after the order status row, add:

```tsx
              <InfoRow
                label="สถานะ Fulfillment"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
              <InfoRow
                label="บริษัทขนส่ง"
                value={order.shippingCarrier ?? "-"}
              />
              <InfoRow
                label="Tracking"
                value={order.trackingNumber ?? "-"}
              />
```

- [ ] **Step 4: Add Fulfillment panel in the admin aside**

In the aside, add this panel before the Mock payment panel:

```tsx
          <Panel
            title="Fulfillment"
            description="อัปเดตการเตรียมสินค้า การจัดส่ง และการยกเลิกออเดอร์"
            icon={<Truck size={18} />}
          >
            <div className="mb-4 grid gap-3 text-sm">
              <InfoRow
                label="สถานะ"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
              <InfoRow label="จัดส่งเมื่อ" value={formatAdminDate(order.shippedAt)} />
              <InfoRow label="ส่งสำเร็จเมื่อ" value={formatAdminDate(order.deliveredAt)} />
              <InfoRow label="ยกเลิกเมื่อ" value={formatAdminDate(order.cancelledAt)} />
              <InfoRow
                label="คืน Stock เมื่อ"
                value={formatAdminDate(order.stockRestoredAt)}
              />
            </div>

            <FulfillmentStatusForm
              orderId={order.id}
              status={order.status as OrderFulfillmentStatus}
              shippingCarrier={order.shippingCarrier}
              trackingNumber={order.trackingNumber}
              cancelReason={order.cancelReason}
            />
          </Panel>
```

- [ ] **Step 5: Run TypeScript**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 6: Commit admin UI**

```powershell
git add app/admin/orders/[id]/FulfillmentStatusForm.tsx app/admin/orders/[id]/page.tsx
git commit -m "feat: add admin fulfillment controls"
```

## Task 5: User Fulfillment Timeline

**Files:**
- Modify: `app/(shop)/account/orders/[id]/page.tsx`

- [ ] **Step 1: Update imports**

In `app/(shop)/account/orders/[id]/page.tsx`, add helper imports:

```ts
import {
  buildFulfillmentTimeline,
  orderFulfillmentStatusLabels,
  type FulfillmentTimelineStepState,
  type OrderFulfillmentStatus,
} from "@/lib/order-fulfillment"
```

- [ ] **Step 2: Add timeline data after payment labels**

After `const paymentMethodLabel = paymentMethodLabels[order.paymentMethod]`, add:

```ts
  const fulfillmentTimeline = buildFulfillmentTimeline({
    status: order.status as OrderFulfillmentStatus,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    cancelReason: order.cancelReason,
  })
```

- [ ] **Step 3: Add tracking detail card**

Inside the right aside, above the existing order route panel, add:

```tsx
          {(order.shippingCarrier || order.trackingNumber) && (
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div className="mb-5 flex items-center gap-2">
                <Truck size={18} />
                <h2 className="text-lg font-semibold">
                  ข้อมูลจัดส่ง
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="บริษัทขนส่ง"
                  value={order.shippingCarrier ?? "-"}
                />
                <SummaryRow
                  label="Tracking"
                  value={order.trackingNumber ?? "-"}
                />
              </div>
            </div>
          )}
```

- [ ] **Step 4: Replace hard-coded route trail**

Replace the existing hard-coded `<TrailItem />` list inside the order route panel with:

```tsx
            <div className="space-y-4">
              {fulfillmentTimeline.map((step) => (
                <TrailItem
                  key={step.key}
                  active={step.state === "complete" || step.state === "current"}
                  state={step.state}
                  icon={
                    step.state === "cancelled"
                      ? XCircle
                      : step.key === "shipped"
                        ? Truck
                        : step.key === "delivered"
                          ? CheckCircle2
                          : PackageCheck
                  }
                  title={step.title}
                  detail={
                    step.date
                      ? `${step.detail} (${formatOrderDate(step.date)})`
                      : step.detail
                  }
                />
              ))}
            </div>
```

Also add `XCircle` to the Lucide import:

```ts
  XCircle,
```

- [ ] **Step 5: Update status summary label**

Keep the existing `orderStatusLabel()` function for compatibility, or replace its value in summary rows with:

```tsx
              <SummaryRow
                label="สถานะ"
                value={
                  orderFulfillmentStatusLabels[
                    order.status as OrderFulfillmentStatus
                  ]
                }
              />
```

- [ ] **Step 6: Update `TrailItem` props and styling**

Change `TrailItem` signature:

```tsx
function TrailItem({
  active,
  state,
  icon: Icon,
  title,
  detail,
}: {
  active: boolean
  state: FulfillmentTimelineStepState
  icon: LucideIcon
  title: string
  detail: string
}) {
```

Change the icon circle class to handle cancellation:

```tsx
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          state === "cancelled"
            ? "border border-red-200 bg-red-50 text-red-600"
            : active
              ? "border border-black bg-[#d8ff6a] text-black"
              : "bg-[#f4f3ef] text-black/55"
        }`}
```

- [ ] **Step 7: Run TypeScript**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 8: Commit user timeline**

```powershell
git add app/(shop)/account/orders/[id]/page.tsx
git commit -m "feat: show order fulfillment timeline"
```

## Task 6: Final Verification

**Files:**
- Review all changed files from Tasks 1-5.

- [ ] **Step 1: Run helper tests**

Run:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/product-discovery.test.ts
```

Expected: both test files pass with zero failures.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
```

Expected: TypeScript exits with code 0.

- [ ] **Step 4: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: production build exits with code 0.

If this fails at Prisma DLL rename with `EPERM` on `node_modules\.prisma\client\query_engine-windows.dll.node`, record the exact error and run:

```powershell
npx.cmd next build
```

Expected fallback: Next.js build exits with code 0.

- [ ] **Step 5: Inspect final diff and commit if needed**

Run:

```powershell
git status --short --branch
git diff --stat
```

Expected: only intentional fulfillment files are changed. Existing unrelated UI edits in `app/component/landing/CinematicSection.tsx` and `app/component/landing/ShowcaseSectionDatabase.tsx` must not be staged unless the user explicitly asks.

If there are uncommitted fulfillment changes, commit them:

```powershell
git add prisma/schema.prisma prisma/migrations/20260621120000_add_order_fulfillment_fields/migration.sql lib/order-fulfillment.ts lib/order-fulfillment.test.ts app/admin/orders/actions.ts app/admin/orders/[id]/FulfillmentStatusForm.tsx app/admin/orders/[id]/page.tsx app/(shop)/account/orders/[id]/page.tsx
git commit -m "feat: add order fulfillment workflow"
```

## Spec Coverage Checklist

- Admin fulfillment controls: Task 4.
- Tracking carrier and tracking number: Tasks 1, 3, 4, 5.
- Cancel reason: Tasks 1, 3, 4, 5.
- Stock restore exactly once: Task 3, guarded by `stockRestoredAt`.
- Cancelled order cannot reopen: Task 2 and Task 3.
- Paid cancellation becomes refunded: Task 2 and Task 3.
- User timeline: Task 5.
- Existing checkout stock decrement unchanged: no checkout file changes in this plan.
