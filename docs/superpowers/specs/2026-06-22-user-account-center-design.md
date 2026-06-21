# User Account Center Design Spec

## Status

Approved design direction from the user on 2026-06-22.

## Feature Summary

Build `/account` into a complete user account center for KicksVault shoppers. The page should let a signed-in user understand their account state, recent commerce activity, saved shipping address, favorites, and next useful actions from one screen.

This phase is an account overview redesign only. It should not add profile editing, password changes, account deletion, or a new membership system.

## Primary User Action

The user should immediately know what needs attention and where to go next: track a recent order, manage the default shipping address, review favorites, or continue shopping.

## Design Direction

- **Color strategy:** Restrained product UI. Keep the premium monochrome base, use the existing lime accent `#d8ff6a` for selected states and primary commerce actions only.
- **Theme scene:** A returning sneaker shopper opens their account on a bright laptop or phone screen after checkout, wanting a calm but confident answer to "what is happening with my order and account?"
- **Anchor references:** Nike SNKRS account/order surfaces, StockX account portfolio clarity, Apple account purchase summary restraint.
- **Project fit:** Preserve the existing KicksVault personality from `PRODUCT.md`: confident, cinematic, collectible, but make this surface task-first rather than decorative.

## Scope

- **Fidelity:** Production-ready UI.
- **Breadth:** One screen, `/account`, inside the existing account layout.
- **Interactivity:** Links and server-rendered account data. No new form submissions in this phase.
- **Time intent:** Build a stable account hub that can support future user settings without needing another full redesign.

## Current Context

The project already has:

- Authenticated account layout at `app/(shop)/account/layout.tsx`.
- Account overview at `app/(shop)/account/page.tsx`.
- Address book at `app/(shop)/account/addresses`.
- Order history and detail routes at `app/(shop)/account/orders`.
- Favorites route at `app/(shop)/account/favorites`.
- Existing UI interaction vocabulary in `lib/ui-interactions.ts`.
- Existing commerce helpers in `lib/commerce.ts` and address formatting in `lib/address.ts`.

The current account overview works, but it feels less organized than the newer store/admin work. It also underuses existing commerce data, lacks a clear "account readiness" view, and does not preview favorites.

## Layout Strategy

Use a focused account dashboard, not a marketing page.

1. **Profile summary band**
   - Large but not hero-sized.
   - Avatar initial, email, role or member status, member since date.
   - Quick actions: view orders, manage addresses, browse store.
   - Avoid dark full-cover treatment that feels disconnected from the lighter store/account pages.

2. **Commerce stats row**
   - Four compact stats:
     - Total orders.
     - Active orders.
     - Saved addresses.
     - Favorite products.
   - Use real database counts. Do not invent metrics.
   - Values must wrap safely on mobile.

3. **Main dashboard grid**
   - Left or primary column: latest orders.
   - Right or secondary column: default address, favorites preview, account readiness.
   - On mobile, stack in priority order:
     1. Profile summary.
     2. Stats.
     3. Latest orders.
     4. Default address.
     5. Favorites.
     6. Account readiness.

4. **Visual vocabulary**
   - Use rounded-lg or rounded-xl for account panels, aligned with the current `uiAction` components.
   - Avoid nested cards.
   - Icons from `lucide-react` only where they clarify action or status.
   - Keep text readable with `text-black`, `text-black/70`, and `text-black/55` levels.

## Data Requirements

Use existing schema only.

Required user data:

- `user.id`
- `user.email`
- `user.role`

Required account aggregates:

- Total order count for current user.
- Active order count for statuses `PENDING`, `PROCESSING`, `SHIPPED`.
- Total spent from order totals.
- Saved address count.
- Favorite count.

Required preview data:

- Latest 5 orders with:
  - id
  - createdAt
  - total
  - status
  - paymentStatus
  - paymentMethod if already available in the page query
  - first 1 to 3 item preview images/names if query cost remains reasonable
- Default address with:
  - recipientName
  - phone
  - formatted address
  - label
- Latest 4 favorites with:
  - shoe id or slug
  - shoe name
  - brand name
  - price
  - primary image

No client-provided prices should be trusted. All totals and prices must come from Prisma queries.

## Key States

### Default State

User has orders, at least one address, and favorites.

- Show stats with real counts.
- Show latest order cards with status and payment badges.
- Show default address.
- Show favorite products with images.
- Show readiness checklist as mostly complete.

### First-Time User

User has no orders, no favorites, and no addresses.

- Profile summary still feels complete.
- Latest orders panel should point to `/product`.
- Address panel should point to `/account/addresses`.
- Favorites panel should point to `/product`.
- Readiness checklist should show clear incomplete items without sounding like an error.

### Partial Setup

User has some account data but not all.

- Readiness checklist reflects:
  - Default address saved.
  - At least one order exists.
  - At least one favorite exists.
- Each incomplete item links to the right next action.

### Loading

If a loading surface is needed for the account route, use skeleton loading with light or soft tones. Do not use black loading blocks.

### Error

The existing account layout redirects unauthenticated users to `/login`. For data fetch issues, keep the page server-rendered and let Next.js error handling surface the failure. Do not hide server errors behind fake empty states.

## Interaction Model

- Quick action buttons navigate to existing routes:
  - `/account/orders`
  - `/account/addresses`
  - `/product`
- Latest order rows navigate to `/account/orders/[id]`.
- Favorites preview products navigate to `/product/[slug]` when slug is available.
- Empty state CTAs use the same `uiAction` vocabulary as store/account surfaces.
- Hover and focus states must keep text visible, following the hover fixes already applied across the project.

## Content Requirements

Primary page title:

- Thai-first copy, with English allowed only for product vocabulary that already appears in the app.
- Recommended title: `ศูนย์บัญชีของคุณ`

Core labels:

- `ออเดอร์ทั้งหมด`
- `กำลังดำเนินการ`
- `ที่อยู่ที่บันทึกไว้`
- `รายการโปรด`
- `ที่อยู่หลัก`
- `ออเดอร์ล่าสุด`
- `คู่โปรดของคุณ`
- `ความพร้อมของบัญชี`

Empty state direction:

- No generic "no data" copy.
- Each empty state should include the next action:
  - No orders: browse products.
  - No address: add shipping address.
  - No favorites: browse store and save pairs.

## Accessibility

- Keep all controls as native `Link` or `button`.
- Use `aria-current` only in navigation, already handled by `AccountNav`.
- Product images need meaningful `alt` text from shoe names.
- Status badges need visible text, not color-only meaning.
- Ensure body text contrast targets WCAG AA.
- Avoid hover-only affordances. Links and buttons must be understandable at rest.

## Responsive Requirements

- Mobile first.
- Account layout sidebar may remain as-is in this phase, but `/account` content must not overflow within it.
- Stats should use `grid` with safe wrapping.
- Latest order and favorite rows should collapse cleanly below tablet width.
- Long emails and product names must use wrapping or truncation where appropriate.

## Implementation Boundaries

Allowed:

- Refactor `app/(shop)/account/page.tsx`.
- Add small private helper components in the same file if it keeps the page readable.
- Import existing helpers from:
  - `@/lib/auth`
  - `@/lib/prisma`
  - `@/lib/commerce`
  - `@/lib/address`
  - `@/lib/image`
  - `@/lib/payment`
  - `@/lib/ui-interactions`
- Add a focused account page loading skeleton if useful.
- Add a focused copy integrity test for user/account files if implementation touches many Thai-copy surfaces.

Not allowed in this phase:

- New Prisma models or migrations.
- Profile edit form.
- Password change flow.
- Logout-all-devices.
- Account deletion.
- New order cancellation behavior.
- New payment behavior.
- Broad redesign of `/account/orders`, `/account/addresses`, or `/account/favorites`.

## Verification Plan

Implementation should finish with:

- Focused test for any new helper logic.
- `npm.cmd run lint`
- `npm.cmd run build`

Manual/browser verification is useful if a dev server is running, but the user has been opening the app manually. If not run, report that browser verification was skipped.

## Success Criteria

- `/account` feels like a real account hub, not a simple profile card page.
- The page uses real user/order/address/favorite data.
- Empty states guide the user to a useful next action.
- Hover/focus states keep text visible.
- The UI matches the Store/account interaction vocabulary.
- No new database schema is required.
- Lint and build pass.

## Spec Self-Review

- No unfinished requirements remain.
- Scope is limited to `/account`.
- Future settings/security work is explicitly out of scope.
- Existing security constraints remain intact: authenticated account layout, database-sourced commerce data, no trusted client totals.
