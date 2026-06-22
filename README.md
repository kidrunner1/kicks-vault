# KicksVault

KicksVault is a Next.js App Router storefront for premium sneakers. It includes a public storefront, authenticated customer account area, cart and checkout, order history, user cancellation, and an admin dashboard for product, stock, payment mock, and fulfillment management.

## Documentation

Start here:

- [Documentation index](./docs/README.md)
- [User guide](./docs/USER_GUIDE.md)
- [Admin guide](./docs/ADMIN_GUIDE.md)
- [Developer guide](./docs/DEVELOPER_GUIDE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Operations](./docs/OPERATIONS.md)

Project direction:

- [Product notes](./PRODUCT.md)
- [Agent/developer rules](./AGENTS.md)

## Current Features

- Public landing page and product store
- Product list/detail with search, filters, collections, stock visibility, and recommendations
- Customer auth with JWT cookies and refresh flow
- Client cart with Zustand
- Address book with default address
- Checkout using database prices and transaction-based stock decrement
- Mock payment methods: manual, bank transfer, cash on delivery
- Order history with active, delivered, cancelled, and all tabs
- User order cancellation within 30 minutes while pending
- Admin dashboard with revenue, fulfillment, payment, stock, and catalog health summaries
- Admin product and stock management
- Admin local image upload
- Admin order payment and fulfillment controls

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 6
- PostgreSQL
- Tailwind CSS 4
- Zustand
- Zod
- bcrypt
- jose

## Quick Start

Install dependencies:

```powershell
npm.cmd install
```

Create local environment file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your local database URL and JWT secret. Do not commit `.env`.

Generate Prisma Client and migrate the database:

```powershell
npx.cmd prisma generate
npx.cmd prisma migrate dev
```

Seed product data:

```powershell
npx.cmd prisma db seed
```

Run the app:

```powershell
npm.cmd run dev
```

## Verification

Run lint:

```powershell
npm.cmd run lint
```

Run production build:

```powershell
npm.cmd run build
```

Run focused tests:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts lib/account-orders.test.ts lib/admin-upload.test.ts
```

## Important Notes

- Checkout totals must come from database prices, not client cart prices.
- Order creation and stock decrement must stay inside one Prisma transaction.
- Admin pages must keep server-side guards.
- Refresh tokens are stored as hashes.
- Cancelled orders should remain in history/admin for audit, but should not appear in the active customer flow.
- Uploaded product images are stored locally under `public/uploads/shoes` in this prototype.

## Known Limitations

- No real payment gateway yet.
- No production-grade object storage yet.
- Cart is not persisted across devices.
- No email or notification system yet.
- Admin audit log is not implemented yet.
