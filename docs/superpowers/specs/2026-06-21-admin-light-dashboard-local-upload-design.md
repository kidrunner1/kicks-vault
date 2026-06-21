# Admin Light Dashboard And Local Upload Design

Date: 2026-06-21

## Objective

Redesign the KicksVault admin area into a bright, readable operations workspace and make product image management practical for admins by replacing manual image URL entry with local file upload.

This phase should make the admin feel like a real working back office: clear revenue and order status, easier stock/product scanning, consistent controls, and a product form that an admin can use without knowing image URLs.

## Chosen Approach

Use approach A: Light Admin + Local Upload.

The admin UI will move from a dark dashboard style to a light product workspace. The upload system will start with local storage in `public/uploads/shoes`, then continue storing image paths in the existing shoe image records. This keeps the change useful now without introducing cloud storage or a schema rewrite.

## Current Context

- Admin routes already have a server-side guard through `app/admin/layout.tsx`.
- Dashboard data is loaded server-side from Prisma in `app/admin/dashboard-data.ts`.
- Product creation and editing currently use `ShoeForm`, where admins manage images as text URL rows.
- Shoe images are already rendered through `normalizeImagePath`, so storing local public paths such as `/uploads/shoes/<file>` fits the current display model.
- Order and payment status management already exists, including fulfillment transitions and stock restore on cancellation.

## Scope

### Included

- Redesign the admin shell, dashboard, order list, order detail, product list, and product form into one light visual system.
- Add clearer dashboard charts for revenue, order pipeline, payment status, fulfillment status, top products, and stock risk.
- Improve status badges, panels, tables, forms, hover, focus, active, disabled, loading, empty, and error states.
- Replace product image URL-first workflow with local image upload, preview, add, and remove.
- Keep a small URL fallback only if it helps migration from existing data.
- Add an admin-only upload endpoint for product images.
- Store uploaded files under `public/uploads/shoes`.
- Save uploaded image public paths into existing shoe image data.

### Not Included

- Cloud storage, CDN, S3, Vercel Blob, or Cloudinary integration.
- Image cropping, drag-and-drop reorder beyond simple row order, or a full media library.
- Database schema changes for image metadata.
- Real payment provider integration.
- A broad redesign of the customer storefront.

## Design Direction

The admin should feel brighter and calmer than the storefront. The storefront can stay cinematic and premium; the admin should serve repeated operational work.

Use a restrained light palette:

- Page background: near-white neutral.
- Sidebar and panels: white or very pale cool-gray.
- Text: high-contrast ink for body and labels.
- Borders: subtle gray with visible focus states.
- Accent: KicksVault lime only for primary actions, active navigation, and important positive signals.
- Semantic tones: amber for pending or warning, blue for processing or shipping, emerald for paid or delivered, red for failed or cancelled, violet only for refunded if needed.

Avoid a marketing hero layout in admin. Use dense but readable grids, tables, segmented panels, and clear action areas.

## Admin Shell

`AdminShell` should become the shared light frame for all admin routes.

### Layout

- Fixed desktop sidebar with KicksVault logo, admin label, and route navigation.
- Mobile top navigation can collapse into a horizontal scroll or compact nav row if full sidebar is not practical in this phase.
- Top bar should show the current admin context and logout action.
- Main content should use a max readable width but allow dashboard grids and tables to use available space.

### Navigation

Routes:

- Dashboard: `/admin`
- Orders: `/admin/orders`
- Products: `/admin/shoes`
- Add product: `/admin/shoes/new`

Active state must be visible through background, border, icon/text color, and `aria-current`. Hover must never make icon or text disappear.

## Dashboard

The dashboard should answer these questions quickly:

- How much revenue has the store captured from non-cancelled orders?
- How many orders need action today?
- Which order statuses are building up?
- Which payments are unpaid, paid, failed, or refunded?
- Which fulfillment states need admin work?
- Which products sell most?
- Which stock rows are risky?
- Are products missing images or price data?

### Data Sections

1. Revenue and action metrics
   - Total revenue excluding cancelled orders.
   - Orders today.
   - Pending orders.
   - Unpaid orders.
   - Low-stock sizes.
   - Sold-out sizes.

2. Order status chart
   - Horizontal bars or compact segmented chart for pending, processing, shipped, delivered, cancelled.

3. Payment status chart
   - Counts and revenue by unpaid, paid, failed, refunded.

4. Fulfillment status chart
   - Uses the same order status data but labels it as operational progress: waiting, preparing, shipped, delivered, cancelled.

5. Recent orders
   - Short order ID, customer, status badge, payment badge, total, item count, date.
   - Each row links to order detail.

6. Top products
   - Product name, brand, sold quantity, relative bar.

7. Stock alerts
   - Shoe, brand, size, current stock, link to edit product.

8. Catalog health
   - Products without image.
   - Products without price.
   - Featured product count.
   - Brand count.

Charts should be implemented with accessible HTML and CSS. No chart dependency is required for this phase.

## Orders UI

### Order List

The order list should use a light filter bar and readable rows.

Filters:

- Search by order ID, email, recipient name, or phone.
- Order status.
- Payment status.

Rows should show:

- Short order ID and created date.
- Customer email, recipient name, and phone.
- Order status badge.
- Payment status badge.
- Total, payment method, item count.
- Detail action.

### Order Detail

Order detail should be split into clear panels:

- Order summary.
- Items ordered.
- Customer account and recipient info.
- Shipping address snapshot.
- Fulfillment controls.
- Mock payment controls.

The fulfillment and payment forms should adopt the same light form controls and button vocabulary as the product form.

## Product UI

### Product List

The product list should use a light table with clearer inventory visibility:

- Product image.
- Product name and featured badge.
- Brand.
- Price.
- Stock summary.
- Actions: edit and delete.

Basic search or quick filtering can be added if it stays small. The priority is consistent table treatment and readable actions.

### Product Form

The product form should become a structured editor:

- Basic details: name, slug preview, description.
- Commerce details: brand, price, featured toggle.
- Images: upload files, preview, remove, and optional URL fallback.
- Specs: label and value rows.
- Stock by size: size and stock rows.
- Save action with loading state and visible error/success copy.

## Local Image Upload

### User Experience

Admins should be able to:

- Select one or more image files from their device.
- See previews after upload.
- Remove uploaded image rows from the form before saving.
- Keep existing images when editing a product.
- Add more images to an existing product.

The form should not require admins to understand public URLs. Existing image URLs can still display and remain editable only as a migration fallback.

### Upload API

Add an admin-only route, likely:

`POST /api/admin/uploads/shoes`

The route should:

- Require admin authentication on the server.
- Accept multipart form data.
- Accept only image MIME types.
- Enforce a conservative file size limit.
- Generate safe unique filenames.
- Write files to `public/uploads/shoes`.
- Return public paths such as `/uploads/shoes/<safe-file-name>`.

If the upload fails, return a typed JSON error that the form can display.

### File Rules

- Allowed types: JPEG, PNG, WebP, and AVIF if supported by browser upload.
- Reject non-image files.
- Reject empty files.
- Use unique names based on timestamp or crypto random values plus sanitized extension.
- Do not trust the original filename beyond extension hints.
- Do not print or expose environment values.

### Storage Limitation

Local upload is suitable for development and local usage. If the app is deployed to serverless hosting, uploaded files may not persist across deployments or runtime instances. The implementation should keep the storage logic isolated enough to replace with cloud storage later.

## Component System

Introduce or consolidate small admin UI helpers as needed:

- `AdminPageHeader`
- `AdminPanel`
- `AdminMetricCard`
- `AdminStatusBadge`
- `AdminButton` or shared class helper
- `AdminTextField`
- `AdminSelect`
- `AdminTextarea`
- `AdminChartBar`
- `AdminEmptyState`

Keep these scoped under `app/admin` unless they are genuinely reused outside admin.

## Accessibility

- All controls need visible labels or `aria-label`.
- Buttons must describe the action, not only icon intent.
- Status meaning must be conveyed by text, not color alone.
- Focus states must be visible on light backgrounds.
- Hover states must not reduce text contrast.
- Tables must remain readable on smaller screens through responsive rows or controlled horizontal overflow.
- Loading should use skeletons or inline pending states, not black blocks.

## Security

- Preserve server-side admin guard for admin pages.
- Upload route must call the existing admin guard.
- Do not expose upload functionality to normal users.
- Validate upload content type and size on the server.
- Do not trust client-provided image paths for file writes.
- Do not allow path traversal.
- Keep checkout and stock logic unchanged unless a page refactor requires imports to move.

## Error And Empty States

- Dashboard sections should render useful empty states when there are no orders, no top products, or no stock alerts.
- Product upload failures should show a clear message inside the image section.
- Product save failures should preserve entered form state.
- Delete confirmation should remain explicit.
- If a product has no image, show the existing placeholder treatment.

## Implementation Notes

- Prefer server components for admin data loading where possible.
- Keep interactive upload and form editing inside client components.
- Avoid new external chart or upload dependencies unless required by browser APIs.
- Use existing `normalizeImagePath` for rendering stored paths.
- Keep local upload paths compatible with existing `ShoeImage.url`.

## Verification

Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

Additional focused checks:

- Create product with uploaded images.
- Edit product and keep existing images.
- Add another uploaded image during edit.
- Confirm uploaded image appears in product list and storefront product cards.
- Confirm admin dashboard renders with no orders and with existing order data.
- Confirm order detail forms still update payment and fulfillment states.

Known environment note: on Windows, `npm.cmd run build` can fail during `prisma generate` if a running Node dev server locks Prisma's query engine DLL. If this happens, record the exact lock and rerun after stopping the locking Node process.

## Acceptance Criteria

- Admin pages use a cohesive light UI system.
- Dashboard shows revenue, order statuses, payment statuses, fulfillment progress, top products, stock risk, and catalog health clearly.
- Order list and detail pages remain functional and easier to scan.
- Product list and product form remain functional and visually aligned with the new admin system.
- Admin can upload local product images without manually entering URLs.
- Uploaded images are saved under `public/uploads/shoes` and stored as public paths in product image records.
- Upload route is admin-only and rejects invalid files.
- Lint and production build pass.
