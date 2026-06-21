# Admin QA And Polish Design

Date: 2026-06-21

## Objective

Run a focused QA and polish pass on the newly redesigned KicksVault admin area. The goal is to catch functional, visual, responsive, accessibility, and interaction-state issues before building the next major feature.

This phase should make the new light admin system feel reliable in real use: product image upload, product create/edit, dashboard scanning, order management, and form actions should work without confusing states or hard-to-read UI.

## Current Context

- The admin area was recently redesigned into a light workspace.
- A local product image upload API now writes files to `public/uploads/shoes`.
- Product images still save as existing `ShoeImage.url` string paths.
- Admin pages remain protected by the server-side admin guard.
- `master` is ahead of origin with the recent admin and upload commits.
- There is an untracked local uploaded image under `public/uploads/shoes`. This file should be preserved and not committed unless the user explicitly asks.

## Scope

### Included

- QA the main admin routes:
  - `/admin`
  - `/admin/orders`
  - `/admin/orders/[id]`
  - `/admin/shoes`
  - `/admin/shoes/new`
  - `/admin/shoes/[id]`
- Check product upload behavior:
  - upload accepted image types
  - reject invalid file types and oversized files
  - preview uploaded images
  - keep existing images when editing
  - save uploaded paths through existing product create/update APIs
- Polish light admin UI:
  - hover, focus, active, disabled, loading, success, and error states
  - status badge contrast
  - table and form spacing
  - mobile and tablet responsive behavior
  - empty states and skeleton states
  - Thai and English mixed copy consistency
- Fix small functional bugs found during the pass.
- Keep commits small and scoped.

### Not Included

- Cloud storage migration.
- New product search/filter features beyond small polish fixes.
- New admin analytics beyond existing dashboard data.
- Storefront redesign.
- Real payment integration.
- Deleting local uploaded files from disk.

## QA Strategy

Use a combination of automated checks and code inspection. Browser verification is useful for this phase, but only start a dev server or browser session if the user wants live verification in this environment. If no browser verification is run, document that limitation clearly.

Automated checks:

- `npx.cmd tsx --test lib/admin-upload.test.ts`
- `npx.cmd tsx --test lib/order-fulfillment.test.ts`
- `npx.cmd tsx --test lib/product-discovery.test.ts`
- `npm.cmd run lint`
- `npm.cmd run build`

Code inspection should focus on recently changed admin files and the upload API:

- `app/admin/admin-ui.tsx`
- `app/admin/AdminShell.tsx`
- `app/admin/page.tsx`
- `app/admin/dashboard-data.ts`
- `app/admin/orders/page.tsx`
- `app/admin/orders/[id]/page.tsx`
- `app/admin/orders/[id]/FulfillmentStatusForm.tsx`
- `app/admin/orders/[id]/PaymentStatusForm.tsx`
- `app/admin/shoes/page.tsx`
- `app/admin/shoes/ShoeForm.tsx`
- `app/admin/shoes/ShoeImageManager.tsx`
- `app/api/admin/uploads/shoes/route.ts`
- `lib/admin-upload.ts`

## Polish Targets

### Admin Shell

- Active route must be visually obvious.
- Hover states must preserve readable text and icons.
- Mobile nav should not overlap logout or page content.
- Logout loading state should not collapse button layout.

### Dashboard

- Metric cards should scan cleanly and avoid cramped text.
- Chart bars should have accessible labels and clear status meaning.
- Empty states should be useful, not alarming.
- Long currency or count values should not overflow.

### Orders

- Filters should remain usable on mobile.
- Rows should show customer, payment, and fulfillment data without text overlap.
- Order detail panels should keep customer, address, payment, and fulfillment sections distinct.
- Admin action forms should make pending/loading/error/success states clear.

### Products

- Product list should keep action buttons readable and safe.
- Skeleton loading should stay light and non-black.
- Product form should preserve entered data after validation errors.
- Image upload should not require URL knowledge.
- Preview rows should handle empty paths and existing URLs gracefully.

### Upload API

- Route must be admin-only.
- Invalid MIME types must be rejected.
- Empty files and files over 5MB must be rejected.
- File names must be generated safely.
- Public paths must use `/uploads/shoes/...`.
- The route must not expose environment values.

## Error Handling

- Failed upload should show a clear message in the image section.
- Failed product save should preserve form state.
- Failed order status/payment action should show an inline message.
- Missing data should show `-` or a helpful empty state.
- Browser-only failures should be documented with reproduction steps.

## Acceptance Criteria

- All automated checks pass.
- No unintentional file changes are left unstaged.
- Untracked local uploaded images are preserved and not staged.
- Admin UI has no obvious dark-theme remnants in the light workspace.
- Hover/focus/active states keep text readable.
- Product image upload flow remains compatible with existing product APIs.
- Any discovered issues are either fixed or listed clearly as follow-up work with file references.
