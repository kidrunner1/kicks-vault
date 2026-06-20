# B2 Admin Orders And Mock Payment Design

Date: 2026-06-20

## Objective

Build the next admin phase for Kicks Vault: order management with complete customer/shipping visibility and a manual mock payment system that is persisted in the database.

This phase does not process real money. It creates the database and admin workflow needed to later integrate Stripe, PromptPay, bank transfer verification, or another payment API without redesigning the order system.

## Existing Context

The current checkout flow creates orders through `app/actions/create-order.ts`. It already:

- Requires a signed-in user.
- Requires a saved address.
- Uses database product prices, not client-submitted prices.
- Decrements size stock inside the same Prisma transaction that creates the order.
- Stores a shipping snapshot on the order, including recipient name, phone, address lines, district, province, and postal code.

The current admin dashboard now shows high-level operations data, but admin cannot yet inspect full orders, see payment state, or update mock payment status.

## Goals

- Add payment state to `Order` and persist it in PostgreSQL.
- Default new orders to unpaid mock payment state.
- Add admin order list and admin order detail pages.
- Let admin see customer email, recipient name, phone number, full shipping address, order items, sizes, quantities, unit prices, line totals, order status, and payment state.
- Let admin manually mark orders as paid, unpaid, failed, or refunded.
- Show payment-aware dashboard data and simple graph-like summaries.
- Keep all admin data server-side and protected by existing admin guard.

## Non-Goals

- No real payment gateway.
- No card, wallet, QR, webhook, or bank API.
- No customer-facing payment page.
- No automatic refund processing.
- No shipping carrier integration.
- No invoice PDF generation.

## Database Design

Add two enums:

```prisma
enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

enum PaymentMethod {
  MANUAL
  BANK_TRANSFER
  COD
}
```

Add fields to `Order`:

```prisma
paymentStatus PaymentStatus @default(UNPAID)
paymentMethod PaymentMethod @default(MANUAL)
paidAt        DateTime?
paymentNote   String?
```

Default behavior:

- New orders are `UNPAID`.
- New orders use `MANUAL` until a real payment method is selected.
- `paidAt` is set only when status becomes `PAID`.
- `paymentNote` stores a short admin note such as mock confirmation details or why a payment failed.

Migration must be explicit and committed under `prisma/migrations`.

## Checkout Behavior

`createOrder()` should continue creating orders inside the existing transaction. It should explicitly set:

- `paymentStatus: UNPAID`
- `paymentMethod: MANUAL`

Stock decrement behavior should not change in this phase. Stock already decreases when the order is created successfully.

## Admin Navigation

Add an Orders item to the admin sidebar:

- `Dashboard` -> `/admin`
- `Orders` -> `/admin/orders`
- `Shoes` -> `/admin/shoes`
- `Add Shoe` -> `/admin/shoes/new`

Active state must work for nested order routes such as `/admin/orders/[id]`.

## Admin Order List

Create `/admin/orders`.

The list should show:

- Short order id.
- Customer email.
- Recipient name.
- Phone number.
- Order total.
- Order status.
- Payment status.
- Payment method.
- Created date.
- Link to detail page.

B2 filters:

- Status filter by `OrderStatus`.
- Payment filter by `PaymentStatus`.
- Simple search by short order id, customer email, recipient name, or phone.

Filters should be implemented with server-side `searchParams` so the order list remains shareable and does not require client-side admin data fetching.

Empty state:

- If no orders exist, show a calm empty state explaining orders will appear after checkout.

## Admin Order Detail

Create `/admin/orders/[id]`.

The detail page should show:

### Order Summary

- Short order id.
- Full order id in small text.
- Order created date.
- Order updated date.
- Order status.
- Payment status.
- Payment method.
- Paid date if available.
- Total.

### Customer

- Customer email from `Order.user.email`.
- Shipping recipient name from order snapshot.
- Shipping phone from order snapshot.

### Shipping Address

Use the order snapshot fields, not the mutable `UserAddress` relation:

- Label.
- Recipient name.
- Phone.
- Address line 1.
- Address line 2.
- Subdistrict.
- District.
- Province.
- Postal code.

This preserves what the customer selected at checkout even if they later edit saved addresses.

### Items

For each order item:

- Product image.
- Product name.
- Brand.
- Size.
- Quantity.
- Unit price.
- Line total.

Line total must be calculated from the order item price snapshot and quantity.

### Mock Payment Panel

Admin can update payment status:

- `Mark as paid`
- `Mark as unpaid`
- `Mark as failed`
- `Mark as refunded`

Admin can choose or keep payment method:

- `MANUAL`
- `BANK_TRANSFER`
- `COD`

Admin can add a short payment note.

Action rules:

- Marking as `PAID` sets `paidAt` to now if it was empty.
- Marking as `UNPAID` clears `paidAt`.
- Marking as `FAILED` clears `paidAt`.
- Marking as `REFUNDED` keeps `paidAt` if it exists, because a refund usually happens after payment.
- All actions must require admin on the server.

## Server Actions

Use server actions for mock payment updates:

- `updateOrderPaymentState(orderId, paymentStatus, paymentMethod, paymentNote)`

Validation:

- `orderId` must be UUID.
- `paymentStatus` must be one of the Prisma enum values.
- `paymentMethod` must be one of the Prisma enum values.
- `paymentNote` is optional and should be trimmed.
- Long payment notes should be rejected or clipped. Recommended max: 500 characters.

Security:

- Call `requireAdmin()` inside the server action.
- Never trust hidden form values alone.
- Revalidate `/admin`, `/admin/orders`, and `/admin/orders/[id]` after update.

## Dashboard Graphs And Metrics

Extend B1 dashboard data with payment-aware summary and simple graph sections.

No chart library is needed in this phase. Use accessible HTML/CSS bars:

- Paid vs unpaid order count.
- Revenue by payment status.
- Orders by order status.
- Top products by quantity sold.

Graph design:

- Bars must include text labels and numbers.
- Color must not be the only meaning.
- Empty states must render if there is no order data.

## Stock And Cancellation Scope

Current stock decrement on order creation is already correct and should remain unchanged.

This phase does not add order cancellation with stock restore yet. That should be B4 because it needs careful idempotency rules:

- Cancel order only once.
- Restore each item size stock exactly once.
- Prevent restoring stock for already cancelled orders.
- Decide what happens if an order is paid and then cancelled.

B2 should show order status but keep order status mutation read-only. Only mock payment status changes are part of this phase.

## UI Direction

Admin should feel operational and dense:

- Dark shell stays.
- Use table-like rows for order list.
- Use compact panels for customer, address, payment, and items.
- Use status badges with readable labels.
- Avoid oversized landing-page style.
- Hover states must keep text visible.
- Use the Kicks Vault accent only for primary actions and important status.

## Data Access

Admin order pages should load data server-side with Prisma:

- No public API route is required for order list/detail.
- Server actions handle payment status mutation.
- The admin layout already protects the route, but mutation actions must still call `requireAdmin()`.

## Error Handling

- Unknown order id should render `notFound()`.
- Payment update failures should show a user-friendly message.
- Invalid enum values should be rejected before Prisma update.
- If a Prisma error occurs, do not leak database internals to the UI.

## Verification

Implementation should run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
npx.cmd prisma validate --schema prisma/schema.prisma
npx.cmd next build
npm.cmd run build
```

Known current environment issue: `npm.cmd run build` can fail at `prisma generate` with a Windows Prisma DLL lock. If that happens, record the exact blocker and confirm `npx.cmd next build` separately.

## Acceptance Criteria

- Prisma schema includes payment status and payment method fields with defaults.
- New orders are created as unpaid manual payment orders.
- Admin navigation includes Orders.
- `/admin/orders` lists real orders with customer email, recipient name, phone, status, payment status, total, and created date.
- `/admin/orders` supports server-side status filter, payment filter, and text search.
- `/admin/orders/[id]` shows full shipping snapshot, customer email, items, totals, and payment panel.
- Admin can update mock payment status and method from the server.
- Dashboard shows payment-aware summary and accessible simple graph bars.
- Stock still decrements on order creation.
- No real payment API is introduced.
- Lint, TypeScript, Prisma validate, and Next build pass, or the known Prisma DLL lock is documented separately for `npm.cmd run build`.
