# User Order Cancellation Design Spec

## Status

Approved design direction from the user on 2026-06-22.

## Feature Summary

Add a user-facing order cancellation flow for KicksVault. A signed-in user should be able to cancel their own order only while it is still early enough in fulfillment, with stock restored safely and payment status updated consistently with the existing mock payment system.

This phase adds self-service cancellation only. It does not add refund APIs, real payment gateway refunds, support tickets, or admin approval queues.

## Primary Rule

Users may cancel an order themselves only when all conditions are true:

- The order belongs to the current signed-in user.
- The order status is `PENDING`.
- The order was created within the last 30 minutes.
- The order has not already been cancelled.
- Stock has not already been restored.

If the admin moves the order to `PROCESSING` before the 30-minute window ends, user cancellation closes immediately.

## Why 30 Minutes

Thirty minutes is short enough to protect fulfillment work, but long enough for a shopper to correct an accidental checkout, wrong size, wrong address, duplicate order, or payment-method mistake. It also keeps the implementation simple and deterministic for the current mock payment phase.

## User Experience

### Order Detail Page

Add a cancellation section to `/account/orders/[id]`.

When cancellable:

- Show a clear status message such as `ยกเลิกเองได้อีก 18 นาที`.
- Show a `ยกเลิกออเดอร์` action.
- Require a cancellation reason before submitting.
- Explain that stock will be returned and the order cannot be resumed.

When not cancellable:

- Show the reason:
  - `หมดเวลายกเลิกเองแล้ว`
  - `ออเดอร์กำลังเตรียมสินค้าแล้ว`
  - `ออเดอร์จัดส่งแล้ว`
  - `ออเดอร์นี้ถูกยกเลิกแล้ว`
- Do not show an enabled cancel button.
- Keep a useful next action such as viewing order details or contacting the store in a later phase.

### Account Center And Order List

This phase does not need a cancel button on `/account` or `/account/orders`. Those surfaces can show cancelled state through existing order badges after the detail action succeeds.

## Admin Experience

Admin order detail should keep seeing cancelled orders through the existing fulfillment data. The cancellation reason should make clear that the cancellation came from the customer.

Recommended cancel reason format:

```text
ลูกค้ายกเลิก: <reason>
```

This avoids a schema migration for `cancelledBy` in this phase while still giving admin clear context.

## Payment Behavior

Use the existing mock payment model:

- If `paymentStatus` is `PAID`, cancellation changes it to `REFUNDED`.
- If `paymentStatus` is `UNPAID`, it stays `UNPAID`.
- If `paymentStatus` is `FAILED`, it stays `FAILED`.
- If `paymentStatus` is `REFUNDED`, it stays `REFUNDED`.

No real refund API is called in this phase.

## Stock Behavior

Order cancellation must restore stock in the same Prisma transaction that updates the order.

Required safeguards:

- Restore stock exactly once.
- Require every order item to have a size before restoring.
- Increment the matching `ShoeSize.stock` for each order item.
- If any stock row is missing, fail the whole transaction.
- Use `stockRestoredAt: null` as the idempotency guard.

This should reuse or extract the same safe behavior already implemented for admin cancellation.

## Data And Schema

Use the current schema only. Do not add migrations in this phase.

Existing fields used:

- `Order.status`
- `Order.paymentStatus`
- `Order.cancelledAt`
- `Order.cancelReason`
- `Order.stockRestoredAt`
- `Order.createdAt`
- `Order.items`
- `OrderItem.size`
- `OrderItem.quantity`
- `ShoeSize.stock`

## Server-Side Security

The cancellation action must be server-side.

Required checks:

- Read the current user from server auth.
- Reject unauthenticated requests.
- Query the order by `id` and current `userId`.
- Do not accept user-provided status, payment status, price, quantity, or stock values.
- Validate `orderId` as UUID.
- Validate `cancelReason` as trimmed text with a maximum length.
- Re-check cancellability inside the transaction before updating.

## Cancellability Logic

Create small pure helpers so the rule is testable:

- `USER_CANCEL_WINDOW_MINUTES = 30`
- `getUserCancelDeadline(createdAt)`
- `getUserCancelEligibility(order, now)`

Eligibility result should include:

- `canCancel: boolean`
- `reason: string`
- `deadline: Date`
- `remainingMs: number`

Reasons should be user-readable Thai copy, not raw enum names.

## Revalidation

After a successful cancellation, revalidate:

- `/account`
- `/account/orders`
- `/account/orders/[id]`
- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- Product surfaces if stock display depends on cache:
  - `/product`

## Error Handling

Expected errors should return user-readable messages:

- Not signed in.
- Order not found.
- Order is no longer cancellable.
- Cancellation reason missing.
- Stock cannot be restored.
- Order was already cancelled or stock already restored.

Unexpected errors may log server-side and return a generic failure message.

## UI Constraints

- Use existing account/store interaction vocabulary from `lib/ui-interactions.ts`.
- Keep controls native: form + button or server action form.
- Avoid a modal for the first version unless the implementation already has an established modal pattern. Inline progressive disclosure is preferred.
- Use clear disabled states with visible text.
- Do not rely on hover to reveal cancellation availability.
- Loading state should use existing light skeleton/button state, not black loading blocks.

## Testing Requirements

Add tests for pure cancellation rules:

- `PENDING` within 30 minutes is cancellable.
- `PENDING` after 30 minutes is not cancellable.
- `PROCESSING` within 30 minutes is not cancellable.
- `CANCELLED` is not cancellable.
- Deadline and remaining milliseconds are calculated consistently.
- Paid cancellation maps to `REFUNDED`; unpaid cancellation remains `UNPAID`.

Use existing order fulfillment tests where possible and avoid database tests unless implementation needs them.

## Non-Goals

- Real payment gateway refund.
- Cancellation request approval queue.
- Support/contact workflow.
- New `cancelledBy` schema field.
- Email notification.
- SMS notification.
- Admin-side cancellation redesign.
- Order cancellation from the account overview list.

## Success Criteria

- A user can cancel their own `PENDING` order within 30 minutes.
- A user cannot cancel another user's order.
- A user cannot cancel after the order moves past `PENDING`.
- A user cannot cancel after the 30-minute window.
- Stock is restored once and only once.
- Mock payment status updates correctly.
- Admin can see the cancellation reason.
- Account/order pages reflect cancelled state after revalidation.
- `npm.cmd run lint` and `npm.cmd run build` pass.

## Spec Self-Review

- Scope is limited to self-service cancellation from order detail.
- No database migration is required.
- Time and status rules are explicit.
- Stock, payment, idempotency, and auth boundaries are explicit.
