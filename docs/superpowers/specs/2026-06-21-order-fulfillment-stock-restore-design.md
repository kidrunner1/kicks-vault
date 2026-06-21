# Order Fulfillment And Stock Restore Design

Date: 2026-06-21

## Objective

Add a practical fulfillment workflow to KicksVault so admins can move orders through preparation, shipping, delivery, and cancellation while keeping inventory correct.

The most important rule is stock integrity: when an order is cancelled, stock must be restored exactly once, in the same database transaction as the order status change.

## Existing Context

The current checkout flow in `app/actions/create-order.ts` already:

- Requires a signed-in user.
- Requires a saved shipping address.
- Uses database prices instead of client-provided prices.
- Normalizes duplicate cart lines for the same shoe and size.
- Decrements `ShoeSize.stock` in the same Prisma transaction that creates the order.
- Stores order items with shoe id, size, quantity, and unit price snapshot.

Admin order pages already exist:

- `/admin/orders` shows searchable and filterable order rows.
- `/admin/orders/[id]` shows customer, shipping, items, totals, and mock payment state.
- Admin payment state can be updated through a protected server action.

What is missing:

- Admin cannot update fulfillment status from the detail page.
- Admin cannot add shipping carrier or tracking number.
- Cancelled orders do not restore stock.
- There is no stored marker that proves stock has already been restored.
- User order detail does not show a full fulfillment timeline or tracking details.

## Goals

- Add admin fulfillment controls on order detail.
- Support order transitions: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- Require carrier and tracking number when marking an order as shipped.
- Let admins cancel an order with a required reason.
- Restore stock exactly once when an order is cancelled.
- Prevent cancelled orders from being reopened.
- Automatically set paid cancelled orders to `REFUNDED`.
- Show fulfillment timeline and tracking details on user order detail.
- Keep all order mutation logic server-side and protected by `requireAdmin()`.

## Non-Goals

- No real carrier API integration.
- No automatic delivery tracking updates.
- No real refund API call.
- No customer self-cancellation.
- No email or Line notification in this phase.
- No full order event log table in this phase.

## Database Design

Extend `Order` with fulfillment fields:

```prisma
shippingCarrier String?
trackingNumber  String?
shippedAt       DateTime?
deliveredAt     DateTime?
cancelledAt     DateTime?
cancelReason    String?
stockRestoredAt DateTime?
```

Field behavior:

- `shippingCarrier` and `trackingNumber` are set when status becomes `SHIPPED`.
- `shippedAt` is set the first time status becomes `SHIPPED`.
- `deliveredAt` is set the first time status becomes `DELIVERED`.
- `cancelledAt` is set when status becomes `CANCELLED`.
- `cancelReason` is required for cancellation.
- `stockRestoredAt` is set only after stock has been restored successfully.

No separate event log table will be added yet. These fields are enough for the current workflow and keep this phase focused.

## Status Transition Rules

Allowed admin transitions:

- `PENDING -> PROCESSING`
- `PENDING -> CANCELLED`
- `PROCESSING -> SHIPPED`
- `PROCESSING -> CANCELLED`
- `SHIPPED -> DELIVERED`
- `SHIPPED -> CANCELLED`
- `DELIVERED -> CANCELLED`

Blocked transitions:

- `CANCELLED -> any status`
- Any transition to `SHIPPED` without carrier and tracking number.
- Any transition that skips required fulfillment data.

Timestamp behavior:

- Moving to `SHIPPED` sets `shippedAt` if it is currently empty.
- Moving to `DELIVERED` sets `deliveredAt` if it is currently empty.
- Moving to `CANCELLED` sets `cancelledAt` if it is currently empty.
- Moving away from non-cancelled states does not erase existing timestamps in this phase.

## Stock Restore Rules

Cancellation runs inside one Prisma transaction:

1. Load the order with its items.
2. Reject the action if the order does not exist.
3. Reject the action if the order is already `CANCELLED`.
4. If `stockRestoredAt` is empty, restore each order item quantity to the matching `ShoeSize` row by `shoeId` and `size`.
5. Update the order to `CANCELLED`, set `cancelledAt`, `cancelReason`, and `stockRestoredAt`.
6. If the order payment status is `PAID`, set payment status to `REFUNDED`.

The transaction must not restore stock if `stockRestoredAt` already has a value. This protects against duplicate form submission, refreshes, or repeated server action calls.

If an order item no longer has a matching `ShoeSize` row, the cancellation should fail with a clear admin message instead of silently losing stock.

## Admin Experience

Add a Fulfillment panel to `/admin/orders/[id]`.

The panel shows:

- Current order status.
- Shipping carrier.
- Tracking number.
- Shipped date.
- Delivered date.
- Cancelled date.
- Cancel reason.

Controls:

- Status action buttons for valid next states only.
- Carrier and tracking inputs shown or required when shipping.
- Cancel reason textarea shown for cancellation.
- Disabled explanatory state when order is already cancelled.

Copy should be in Thai and match the current admin style.

## User Experience

Update `/account/orders/[id]`.

The page should show:

- Fulfillment timeline.
- Tracking carrier and tracking number when available.
- Cancel reason when cancelled.
- Payment state remains visible as it is today.

Timeline steps:

- รับออเดอร์
- กำลังเตรียมสินค้า
- จัดส่งแล้ว
- ส่งสำเร็จ

If the order is cancelled, show a cancelled state instead of pretending the normal timeline continues.

## Server Actions

Add a new protected admin server action, separate from the existing payment action:

- `updateOrderFulfillmentState(previousState, formData)`

Validation with Zod:

- `orderId`: UUID.
- `status`: enum `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- `shippingCarrier`: trimmed string, required for `SHIPPED`.
- `trackingNumber`: trimmed string, required for `SHIPPED`.
- `cancelReason`: trimmed string, required for `CANCELLED`.

Return shape should match existing admin action style:

```ts
{
  ok: boolean
  message: string
}
```

Revalidate:

- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- `/account/orders`
- `/account/orders/[id]`

## Dashboard Updates

Existing dashboard order pipeline can keep using `Order.status`.

After this phase:

- Cancelled orders should appear in the existing cancelled count.
- Low stock alerts should reflect restored stock after cancellation.
- Revenue cards should continue excluding cancelled orders where they already do so.

## Testing

Add focused tests for pure fulfillment helpers where practical:

- Valid transition list.
- Cancelled order cannot reopen.
- `SHIPPED` requires carrier and tracking number.
- `CANCELLED` requires reason.
- Paid cancelled order maps payment to refunded.

For the database transaction path, verify through TypeScript build and manual server action review in this phase. Full integration tests can be added later when a test database workflow is in place.

## Verification

Before claiming implementation complete, run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
npm.cmd run build
```

Known local issue: `npm.cmd run build` can fail at `prisma generate` with a Windows Prisma DLL lock. If that happens, report the exact failure and run `npx.cmd next build` separately to verify the Next.js build.

## Acceptance Criteria

- Admin can mark an order as processing, shipped, delivered, or cancelled.
- Shipping requires carrier and tracking number.
- Cancellation requires a reason.
- Cancelling an order restores each ordered size stock exactly once.
- Cancelling a paid order marks mock payment as refunded.
- Cancelled orders cannot be changed back to another status.
- User order detail shows fulfillment progress and tracking details.
- Existing checkout stock decrement remains unchanged.
