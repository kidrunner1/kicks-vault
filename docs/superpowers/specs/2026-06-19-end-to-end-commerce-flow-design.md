# KicksVault End-To-End Commerce Flow Design

Date: 2026-06-19

## Context

KicksVault is now stable enough to build forward: auth/session shape is consistent, admin routes have a server guard, checkout uses database prices, and order creation decrements stock transactionally. The next priority is making the app usable end-to-end for a real sneaker storefront flow.

This phase is a thin but complete commerce pass. It should make the product browsing, product detail, cart, checkout, order history, and admin product/stock basics work together as one understandable loop.

## Goals

1. Customers can browse products, understand price/brand/availability, and reach product detail pages reliably.
2. Product detail pages show stock-backed size choices and prevent selecting sold-out sizes.
3. Customers can add a selected size to cart, adjust quantities, remove items, and proceed to checkout.
4. Checkout creates an order from database prices and stock, then sends the customer to the order detail page.
5. Account order pages show useful order information: date, status, total, item names, sizes, quantities, and item prices.
6. Admin users can manage product basics, including price, images, brand, and stock per size.
7. Admin product listing is easier to scan and no longer has basic image accessibility warnings.
8. The flow has clear empty, loading, and error states where users can naturally recover.

## Non-Goals

- No real payment provider integration.
- No shipping address, tax, discount, or fulfillment workflow.
- No full admin redesign.
- No full storefront redesign or visual rebrand.
- No dependency upgrade or audit remediation in this phase.
- No multi-admin role system.
- No persistent cart across devices.

## Recommended Approach

Build a thin but complete flow before heavy polish. The implementation should favor focused improvements to current pages and existing API/server-action boundaries:

- Keep the current custom JWT auth and Prisma schema. Stock basics use the existing `ShoeSize` model.
- Keep product creation/editing inside the existing admin routes and pages.
- Use database values as source of truth for product prices and stock.
- Improve UX where it directly affects completion of the purchase flow.
- Defer broad visual design polish to a dedicated UI phase.

## Customer Flow

### Product List

The product listing should be usable as the main shopping entry point. It should:

- Render product cards with image, name, brand, price, and link to detail.
- Show a clear empty state when no products exist.
- Keep basic sort/filter controls simple and honest. If controls are not wired yet, either wire them or remove/replace misleading inactive controls.
- Avoid layout shifts and inaccessible image markup.

### Product Detail

The product detail page should make the buying decision obvious:

- Show product image gallery or primary image.
- Show name, brand, description, price, specs, and stock-backed sizes.
- Disable sold-out sizes.
- Require size selection before adding to cart.
- Keep favorite behavior available for signed-in users and gracefully handle signed-out users.
- Add to cart should include `shoeId`, `name`, `price`, `image`, `size`, and `quantity`.

### Cart

The cart should be reliable and recoverable:

- Show empty cart with a clear path back to products.
- Show item image, name, size, quantity, item price, and line total.
- Quantity controls should not allow invalid values.
- Checkout button should be disabled while processing.
- Checkout errors from stock/order creation should be shown in plain language.
- The cart should clear only after order creation succeeds.

### Checkout

Checkout remains a server-action based order creation, not a payment flow:

- Client-submitted prices are ignored.
- Server fetches product price and stock from the database.
- Stock decrement and order creation happen in one transaction.
- On success, customer is redirected to `/account/orders/[id]`.
- On failure, customer remains in cart with a readable error.

### Order History And Detail

Account order pages should help customers confirm what happened:

- Order list shows recent orders with date, status, total, and link to detail.
- Order detail shows all items, sizes, quantities, prices, total, and status.
- Empty state points customers back to product browsing.
- Access stays scoped to the current signed-in user.

## Admin Flow

### Admin Dashboard

The dashboard should show a compact operational snapshot:

- Total products.
- Total brands.
- Recent orders count or recent pending orders.
- Low-stock products or sizes.
- Links to product management and add product.

This should be useful, not decorative.

### Product Listing

The admin product list should:

- Use accessible images with `alt`.
- Prefer `next/image` where practical.
- Show product name, brand, price, primary image, and actions.
- Show empty/loading/error states.
- Refresh after deletion.

### Product Create/Edit

Product create/edit should support the minimum data needed for a working shop:

- Name.
- Slug generated from name but visible or predictable.
- Description.
- Brand selection.
- Price.
- Primary image URL. Multiple-image editing is deferred to a later media-management pass.
- Sizes and stock quantities.

The create/edit implementation should reuse shared validation rules where possible, so admin UI and API behavior do not drift.

### Stock Management

Stock should stay attached to `ShoeSize` records:

- Admin can create or edit stock for common sizes.
- Customer product detail reads from these records.
- Checkout decrements these records.
- Sold-out size is visible but disabled on product detail.

## Data And API Boundaries

- Product browsing can use direct server-side Prisma reads for server pages and existing public API routes for client admin pages.
- Admin mutations go through `/api/admin/shoes` and `/api/admin/shoes/[id]`.
- Checkout remains in `app/actions/create-order.ts`.
- Cart state remains in Zustand for this phase.
- Auth state continues through the existing cookie/JWT flow.

If repeated product serialization appears in multiple places, add a small local helper rather than duplicating ad hoc Decimal-to-string conversion across new code.

## Error Handling

- Public product pages should use `notFound()` for missing products.
- Admin APIs should return stable JSON errors with appropriate status codes.
- Admin create/edit forms should show inline actionable messages instead of relying only on `alert()`.
- Checkout should show stock and auth failures clearly.
- Empty states should be first-class UI, not blank screens.

## Testing And Verification

Run after implementation:

```powershell
npm.cmd run lint
npm.cmd run build
```

Manual verification checklist:

1. Admin can create or edit a product with price, image, and size stock.
2. Product appears in product list.
3. Product detail shows available and sold-out sizes correctly.
4. Customer can add an available size to cart.
5. Customer can adjust quantity and checkout.
6. Order detail shows the purchased item.
7. Stock decreases after checkout.
8. A sold-out size cannot be purchased.

Browser verification is not part of this planning step. The implementation plan will include the manual checklist above and can add browser automation only if explicitly requested.

## Risks

- Admin create/edit may need careful form state handling to avoid a large fragile component.
- Product serialization is already duplicated in a few places; adding more duplication would make later maintenance harder.
- Checkout stock correctness depends on preserving the transaction and guarded stock update.
- Product image URLs may be remote or local. Rendering must keep `next.config.ts` remote image rules in mind.
- This phase improves practical usability but does not resolve existing dependency audit vulnerabilities.
