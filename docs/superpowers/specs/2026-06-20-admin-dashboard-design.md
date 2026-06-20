# B1 Admin Dashboard Design

Date: 2026-06-20

## Objective

Build the first real admin operations dashboard for Kicks Vault. The dashboard should help an admin understand store health at a glance before drilling into product, stock, and order workflows.

This phase is read-only. It prepares the data shape and UI structure needed for later phases:

- B2: Admin order management.
- B3: Product and stock dashboard.
- C1: Store search and collections.

## Existing Context

The current admin dashboard at `app/admin/page.tsx` already reads product count, brand count, order count, and low-stock sizes. The schema includes `Order`, `OrderItem`, `Shoe`, `ShoeSize`, `Brand`, and `OrderStatus`.

Admin protection already exists through the admin route structure. B1 should keep server-side data loading in the admin page and avoid client-only authorization checks.

## Goals

- Show a clear store snapshot using database-backed metrics.
- Surface order pressure, stock risk, and catalog readiness without requiring admin clicks.
- Keep the dashboard quiet, dense, and operational, not a marketing-style page.
- Use existing product/admin visual language, then improve spacing, contrast, and hover states.
- Keep this phase read-only so B2 can safely introduce order actions later.

## Non-Goals

- No payment integration.
- No order status mutation.
- No stock editing from the dashboard.
- No charts that require a new visualization dependency.
- No analytics events or external reporting service.

## Dashboard Sections

### 1. Header Summary

The top of `/admin` should show:

- Page title: `Operations Dashboard`.
- Supporting text explaining this is a store health snapshot.
- Primary action link: `Manage products`.
- Secondary action link: `Add shoe`.

The header should fit the existing admin shell and avoid large hero treatment.

### 2. Metric Cards

Metric cards should be server-rendered from Prisma and show:

- Total revenue from non-cancelled orders.
- Orders today.
- Pending orders.
- Total products.
- Low-stock sizes.
- Sold-out products or sold-out sizes.

Each card should include a label, value, short helper text, and optional href when there is an existing destination. For B1, cards that would point to future order management can link to `/admin` or be non-clickable until B2 adds `/admin/orders`.

### 3. Order Pipeline

Show order status counts for:

- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

This should be a compact status list or segmented bar using existing colors with accessible contrast. It should not allow status changes yet.

### 4. Recent Orders

Show the latest 5 orders with:

- Short order id.
- Customer email.
- Status.
- Total.
- Item count.
- Created date.

Each row should be visually ready to become a link in B2. In B1, rows can remain read-only if `/admin/orders/[id]` does not exist yet.

### 5. Stock Alerts

Show sizes with stock at or below 3, ordered by stock ascending:

- Shoe name.
- Brand name if available.
- Size.
- Stock count.
- Link to edit product.

Also show sold-out sizes or products if available. This is the bridge to B3.

### 6. Catalog Health

Show product readiness signals:

- Products without images.
- Products without price.
- Featured products count.
- Total brands.

This helps the admin understand why a product may look weak in the storefront.

## Data Design

All B1 data can be loaded inside `app/admin/page.tsx` with Prisma. No new API route is required for this phase.

Recommended query groups:

- Counts: products, brands, orders, featured products.
- Revenue: aggregate `Order.total` where status is not `CANCELLED`.
- Orders today: count orders with `createdAt` greater than or equal to start of current day.
- Pending orders: count orders where status is `PENDING`.
- Pipeline: group orders by `status`.
- Recent orders: latest orders with user email and item count.
- Low stock: `ShoeSize` rows where `stock <= 3`, including shoe name, slug/id, and brand.
- Catalog health: product rows missing images or price.

Dates should be calculated on the server. The first implementation can use local server time; if the app later supports multi-region deployments, this can be moved to an explicit store timezone helper.

## UI Design

The dashboard should use the existing dark admin shell, with cleaner spacing:

- Use a compact grid for metric cards.
- Use full-width operational panels, not nested cards.
- Use rounded-lg at most.
- Use high-contrast text on dark surfaces.
- Use accent color only for active/important signals, not for every card.
- Use table-like rows for recent orders and stock alerts.

Cards and rows must avoid the old blue-only admin styling where it clashes with the newer Kicks Vault accent system. Hover states should keep text readable.

## Empty, Loading, And Error States

Because `/admin` is a server component, B1 should mainly handle empty states:

- No orders: show a calm empty message and keep product/stock sections visible.
- No low stock: show `No low-stock sizes`.
- No catalog issues: show `Catalog is ready`.

Unexpected Prisma errors can use the existing app error boundary. B1 does not need client-side loading skeletons.

## Security

- Keep data loading server-side.
- Do not expose admin dashboard data through a public client API.
- Do not trust client data for revenue or order counts.
- Preserve the existing server-side admin guard.
- Do not print environment values.

## Accessibility

- Use semantic headings for each dashboard section.
- Use links only when navigation exists.
- Give status badges readable text labels, not color-only meaning.
- Ensure row hover does not make text disappear.
- Keep the dashboard usable without hover.

## Verification

Implementation should run:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --pretty false
npx.cmd next build
npm.cmd run build
```

Known current environment issue: `npm.cmd run build` can fail at `prisma generate` with a Windows Prisma DLL lock. If that happens, record the exact blocker and confirm `npx.cmd next build` separately.

## Acceptance Criteria

- `/admin` shows meaningful store metrics from real Prisma data.
- Recent orders, low stock, and catalog health sections render without client fetches.
- Empty states render cleanly when there is no order or stock data.
- Dashboard actions only navigate to existing safe routes.
- Lint and TypeScript checks pass.
- Next production build passes, or any Prisma DLL lock is reported separately.
