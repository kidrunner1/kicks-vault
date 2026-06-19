# KicksVault Stability And Security Hardening Design

Date: 2026-06-19

## Context

KicksVault is a Next.js App Router storefront with Prisma/PostgreSQL, custom JWT access and refresh tokens, admin product management, cart checkout, favorites, and order history. The current build succeeds, but lint fails and the first audit found runtime/security issues around auth state, admin access, order creation, stock handling, and route protection.

This first upgrade pass keeps the existing stack in place. It does not replace the custom auth system, redesign the UI, or introduce a new state-management/auth library.

## Goals

1. Add project guidance files so future Codex/agent work follows the same assumptions and verification steps.
2. Fix auth state mismatches between `/api/auth/me`, `AuthProvider`, and the Zustand auth store.
3. Ensure logout invalidates the stored hashed refresh token correctly.
4. Enforce admin access from the server side, not only through client-side UI behavior.
5. Align route protection with the current App Router paths.
6. Fix order creation so it does not duplicate order items and does decrement stock inside the checkout transaction.
7. Fix cart quantity updates so same shoe with different sizes stays independent.
8. Fix the admin "Add Shoe" flow so price is validated before submit and sent to the API.
9. Leave the repo in a verifiable state with build passing and targeted lint issues resolved where touched.

## Non-Goals

- No full auth rewrite to Auth.js, Clerk, or another provider.
- No database provider change.
- No major UI redesign.
- No payment integration.
- No inventory reservation system beyond atomic checkout stock decrement.
- No broad refactor of unrelated components.

## Proposed Files And Boundaries

### Project Guidance

Add `AGENTS.md` at the repository root. It should describe:

- Project name and stack.
- Windows command preference: use `npm.cmd` when running npm scripts in PowerShell.
- Required checks: `npm.cmd run lint` and `npm.cmd run build`.
- Security rules: do not expose `.env`, do not trust client-provided prices, keep admin checks server-side, and keep order stock mutations transactional.
- Code style expectations: follow existing App Router and Prisma patterns, keep edits scoped, avoid unrelated UI rewrites.

README cleanup is deferred to a later documentation pass. This round adds `AGENTS.md` only.

### Auth Response Contract

Standardize `/api/auth/me` to return a consistent JSON object:

```json
{ "user": { "id": "...", "email": "...", "role": "USER" } }
```

When unauthenticated, return `{ "user": null }` with a successful status. This matches the existing client expectation and avoids treating normal signed-out state as an error.

Update `AuthProvider` and `lib/auth-store.ts` to consume that contract safely.

### Refresh Token Logout

Refresh tokens are saved as bcrypt hashes during login and refresh. Logout must compare the cookie refresh token against the stored hash using `bcrypt.compare`. If valid, clear the stored token. In every case, clear both cookies with the same path and security options used elsewhere.

### Admin Guard

Move admin access enforcement to a server boundary. The current `app/admin/layout.tsx` is a client component, so it cannot call `requireAdmin()` directly. Split it into:

- A server `app/admin/layout.tsx` that calls `requireAdmin()` and redirects on unauthorized/forbidden access.
- A client admin shell component for pathname highlighting and logout interaction.

This keeps the UI behavior while preventing unauthenticated or non-admin users from receiving admin pages.

### Route Protection

Update `proxy.ts` so protected routes match the actual app paths:

- `/account`
- `/cart`
- `/admin`

Auth pages remain:

- `/login`
- `/register`

The proxy should be a fast outer guard only. Server-side checks remain the source of truth for admin and account data access.

### Order And Stock Transaction

Update `createOrder` so each cart item creates exactly one `OrderItem`. Prices must be loaded from the database, not trusted from the client.

Inside the same Prisma transaction:

1. Validate the requested size exists.
2. Ensure stock is enough.
3. Decrement stock for the selected shoe and size.
4. Add one order item with DB price and requested quantity.
5. Create the order with total derived from DB prices.

Use a guarded update where possible so concurrent checkouts cannot oversell stock.

### Cart Store

When adding an existing cart item, match both `shoeId` and `size`. This prevents increasing the wrong row when the same shoe appears in multiple sizes.

### Admin Add Shoe Flow

Validate `name`, `brandId`, and `price` before making the POST request. Send `price` in the request body. Keep the existing form shape and avoid redesigning the admin UI in this pass.

## Error Handling

- Auth endpoints return stable response shapes.
- Admin API routes continue returning JSON errors with appropriate status codes.
- Order creation throws user-facing errors for invalid input, missing size, insufficient stock, and missing price.
- Unexpected server errors are logged server-side and returned as generic failures.

## Verification

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Expected result:

- Build passes.
- Lint either passes or any remaining warnings/errors are explicitly outside the touched scope and documented.

## Risks

- A server admin layout may change rendering from static to dynamic for admin routes. That is expected because admin access depends on cookies.
- Stock decrement logic needs careful Prisma conditions to avoid concurrent oversell.
- Existing mojibake comments/messages may remain unless they are in files being edited and are easy to replace safely.
