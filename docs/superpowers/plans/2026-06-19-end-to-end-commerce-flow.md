# End-To-End Commerce Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make KicksVault usable from admin product/stock setup through customer browsing, cart checkout, and order review.

**Architecture:** Keep the existing Next.js App Router, Prisma schema, custom JWT auth, server actions, and Zustand cart store. Add one small shared commerce helper for stock/size display rules, move admin create/edit into a shared client form, and extend existing admin APIs to create/update `ShoeSize` stock records without changing the database schema.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6, PostgreSQL, Zustand, Zod, TypeScript, Tailwind CSS, Sonner.

---

## File Structure

- Create: `lib/commerce.ts`
  - Shared client-safe helpers for default sizes, stock rows, currency formatting, and availability labels.
- Create: `app/admin/shoes/ShoeForm.tsx`
  - Shared client form for admin create/edit with price, brand, primary image, and size stock rows.
- Modify: `app/api/admin/shoes/route.ts`
  - Accept and persist size stock rows on product creation.
- Modify: `app/api/admin/shoes/[id]/route.ts`
  - Accept and replace size stock rows on product update.
- Modify: `app/api/shoes/route.ts`
  - Include sizes in public/admin product API results and serialize prices consistently.
- Modify: `app/api/shoes/[id]/route.ts`
  - Include sizes and serialized price for admin edit page.
- Modify: `app/admin/shoes/new/page.tsx`
  - Replace local form with `ShoeForm`.
- Modify: `app/admin/shoes/[id]/page.tsx`
  - Replace local form with `ShoeForm` and load brands/sizes.
- Modify: `app/admin/page.tsx`
  - Add useful operational summaries: product count, brand count, order count, low-stock sizes.
- Modify: `app/admin/shoes/page.tsx`
  - Improve admin product list image accessibility, empty/error states, stock summary.
- Modify: `app/(shop)/product/page.tsx`
  - Make product list controls honest and add availability/empty states.
- Modify: `app/(public)/product/[slug]/page.tsx`
  - Sort sizes before passing to product detail.
- Modify: `app/component/product/ProductDetail.tsx`
  - Strengthen size selection, sold-out messaging, quantity limits, and add-to-cart affordance.
- Modify: `app/(shop)/cart/page.tsx`
  - Remove unused price submission, improve line totals and checkout disabled state.
- Modify: `app/(shop)/account/orders/page.tsx`
  - Add item names/images to order list cards and a better empty state.
- Modify: `app/(shop)/account/orders/[id]/page.tsx`
  - Add clear item unit/line pricing and continue-shopping action.

## Task 1: Shared Commerce Helpers

**Files:**
- Create: `lib/commerce.ts`

- [ ] **Step 1: Create `lib/commerce.ts`**

Create `lib/commerce.ts` with this content:

```ts
export const DEFAULT_SHOE_SIZES = ["39", "40", "41", "42", "43", "44"] as const

export interface StockRow {
  size: string
  stock: number
}

export function createDefaultStockRows(): StockRow[] {
  return DEFAULT_SHOE_SIZES.map((size) => ({
    size,
    stock: 0,
  }))
}

export function normalizeStockRows(rows: StockRow[]): StockRow[] {
  const uniqueRows = new Map<string, StockRow>()

  for (const row of rows) {
    const size = row.size.trim()
    const stock = Number.isFinite(row.stock) ? Math.max(0, Math.floor(row.stock)) : 0

    if (size) {
      uniqueRows.set(size, { size, stock })
    }
  }

  return Array.from(uniqueRows.values()).sort((a, b) =>
    a.size.localeCompare(b.size, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  )
}

export function totalStock(rows: StockRow[]): number {
  return rows.reduce((sum, row) => sum + row.stock, 0)
}

export function availabilityLabel(rows: StockRow[]): string {
  const total = totalStock(rows)

  if (total === 0) return "Out of stock"
  if (total <= 3) return `Low stock (${total})`

  return `${total} in stock`
}

export function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return "-"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value))
}
```

- [ ] **Step 2: Run targeted lint**

Run:

```powershell
npm.cmd run lint -- lib\commerce.ts
```

Expected: exit code 0.

- [ ] **Step 3: Commit helper**

Run:

```powershell
git add lib\commerce.ts
git commit -m "feat: add commerce display helpers"
```

Expected: commit succeeds.

## Task 2: Admin APIs Support Size Stock

**Files:**
- Modify: `app/api/admin/shoes/route.ts`
- Modify: `app/api/admin/shoes/[id]/route.ts`
- Modify: `app/api/shoes/route.ts`
- Modify: `app/api/shoes/[id]/route.ts`

- [ ] **Step 1: Extend create-shoe validation**

In `app/api/admin/shoes/route.ts`, add this import:

```ts
import { normalizeStockRows } from "@/lib/commerce"
```

Add this schema near `shoeSpecSchema`:

```ts
const shoeSizeSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
})
```

Add `sizes` to `createShoeSchema`:

```ts
  sizes: z.array(shoeSizeSchema).optional().default([]),
```

Include `sizes` in the parsed data destructuring:

```ts
      sizes,
```

After destructuring, add:

```ts
    const normalizedSizes = normalizeStockRows(sizes)
```

Inside `prisma.shoe.create({ data: { ... } })`, add:

```ts
        sizes: {
          create: normalizedSizes.map((size) => ({
            size: size.size,
            stock: size.stock,
          })),
        },
```

Add `sizes: true` to the create include block:

```ts
        sizes: true,
```

- [ ] **Step 2: Extend update-shoe validation**

In `app/api/admin/shoes/[id]/route.ts`, add imports:

```ts
import { normalizeStockRows } from "@/lib/commerce"
import { z } from "zod"
```

Add these schemas below imports:

```ts
const shoeSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const shoeSizeSchema = z.object({
  size: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
})

const updateShoeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  brandId: z.string().uuid(),
  price: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") {
        return Number.NaN
      }

      return value
    },
    z.coerce.number().min(0)
  ),
  images: z.array(z.string().min(1)).optional().default([]),
  specs: z.array(shoeSpecSchema).optional().default([]),
  sizes: z.array(shoeSizeSchema).optional().default([]),
})
```

Replace the current loose `const body = await req.json()` and destructuring block with:

```ts
    const parsed = updateShoeSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid shoe data" },
        { status: 400 }
      )
    }

    const {
      name,
      slug,
      description,
      brandId,
      images,
      specs,
      price,
      sizes,
    } = parsed.data

    const normalizedSizes = normalizeStockRows(sizes)
```

Replace the current price conversion block with:

```ts
    const decimalPrice = new Prisma.Decimal(price)
```

Replace the `data` block passed to `prisma.shoe.update` with:

```ts
      data: {
        name,
        slug,
        description,
        brandId,
        price: decimalPrice,

        images: {
          deleteMany: {},
          create: images.map((url, index) => ({
            url,
            order: index,
          })),
        },

        specs: {
          deleteMany: {},
          create: specs,
        },

        sizes: {
          deleteMany: {},
          create: normalizedSizes.map((size) => ({
            size: size.size,
            stock: size.stock,
          })),
        },
      }
```

- [ ] **Step 3: Include sizes in product APIs**

In `app/api/shoes/route.ts`, add `sizes: true` inside the `include` object:

```ts
          sizes: true,
```

Update the formatted shoe mapping to sort and expose sizes:

```ts
    const formattedShoes = shoes.map((shoe) => ({
      ...shoe,
      price: shoe.price ? shoe.price.toString() : null,
      sizes: [...shoe.sizes].sort((a, b) =>
        a.size.localeCompare(b.size, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ),
    }))
```

In `app/api/shoes/[id]/route.ts`, add `sizes: true` to the include object and replace `return NextResponse.json(shoe)` with:

```ts
    return NextResponse.json({
      ...shoe,
      price: shoe.price ? shoe.price.toString() : null,
      sizes: [...shoe.sizes].sort((a, b) =>
        a.size.localeCompare(b.size, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ),
    })
```

- [ ] **Step 4: Run targeted lint and build**

Run:

```powershell
npm.cmd run lint -- app\api\admin\shoes\route.ts "app\api\admin\shoes\[id]\route.ts" app\api\shoes\route.ts "app\api\shoes\[id]\route.ts" lib\commerce.ts
npm.cmd run build
```

Expected: lint exit code 0 and build exit code 0.

- [ ] **Step 5: Commit API stock support**

Run:

```powershell
git add app\api\admin\shoes\route.ts "app\api\admin\shoes\[id]\route.ts" app\api\shoes\route.ts "app\api\shoes\[id]\route.ts" lib\commerce.ts
git commit -m "feat: support admin shoe stock rows"
```

Expected: commit succeeds.

## Task 3: Shared Admin Shoe Form

**Files:**
- Create: `app/admin/shoes/ShoeForm.tsx`
- Modify: `app/admin/shoes/new/page.tsx`
- Modify: `app/admin/shoes/[id]/page.tsx`

- [ ] **Step 1: Create shared admin form**

Create `app/admin/shoes/ShoeForm.tsx` with this content:

```tsx
"use client"

import { createDefaultStockRows, normalizeStockRows, type StockRow } from "@/lib/commerce"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export interface BrandOption {
  id: string
  name: string
}

export interface ShoeFormValues {
  name: string
  description: string
  image: string
  brandId: string
  price: string
  sizes: StockRow[]
}

interface ShoeFormProps {
  mode: "create" | "edit"
  brands: BrandOption[]
  initialValues?: ShoeFormValues
  shoeId?: string
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

const emptyValues: ShoeFormValues = {
  name: "",
  description: "",
  image: "",
  brandId: "",
  price: "",
  sizes: createDefaultStockRows(),
}

export default function ShoeForm({
  mode,
  brands,
  initialValues = emptyValues,
  shoeId,
}: ShoeFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<ShoeFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const slug = useMemo(() => generateSlug(values.name), [values.name])

  function updateField(field: keyof Omit<ShoeFormValues, "sizes">, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateSize(index: number, field: keyof StockRow, value: string) {
    setValues((current) => ({
      ...current,
      sizes: current.sizes.map((row, rowIndex) => {
        if (rowIndex !== index) return row

        return {
          ...row,
          [field]: field === "stock" ? Number(value) : value,
        }
      }),
    }))
  }

  function addSizeRow() {
    setValues((current) => ({
      ...current,
      sizes: [...current.sizes, { size: "", stock: 0 }],
    }))
  }

  function removeSizeRow(index: number) {
    setValues((current) => ({
      ...current,
      sizes: current.sizes.filter((_, rowIndex) => rowIndex !== index),
    }))
  }

  async function handleSubmit() {
    const numericPrice = Number(values.price)

    if (!values.name.trim() || !values.brandId || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setMessage("Name, brand, and valid price are required.")
      return
    }

    const normalizedSizes = normalizeStockRows(values.sizes)

    if (normalizedSizes.length === 0) {
      setMessage("Add at least one size row.")
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const endpoint =
        mode === "create"
          ? "/api/admin/shoes"
          : `/api/admin/shoes/${shoeId}`

      const res = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          slug,
          description: values.description.trim(),
          featured: mode === "create",
          brandId: values.brandId,
          price: numericPrice,
          images: values.image.trim() ? [values.image.trim()] : [],
          specs: [],
          sizes: normalizedSizes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Unable to save product.")
        return
      }

      router.push("/admin/shoes")
      router.refresh()
    } catch {
      setMessage("Unable to connect to the server.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl text-gray-100 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">
          {mode === "create" ? "Add Shoe" : "Edit Shoe"}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Manage the product basics customers need before checkout.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        {message && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400">Name</label>
          <input
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
          {slug && (
            <p className="mt-2 text-xs text-gray-500">
              Slug: {slug}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400">Description</label>
          <textarea
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-gray-400">Brand</label>
            <select
              value={values.brandId}
              onChange={(event) => updateField("brandId", event.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(event) => updateField("price", event.target.value)}
              className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Primary Image URL</label>
          <input
            value={values.image}
            onChange={(event) => updateField("image", event.target.value)}
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-medium">Size Stock</h2>
              <p className="text-sm text-gray-500">
                These rows power product availability and checkout limits.
              </p>
            </div>
            <button
              type="button"
              onClick={addSizeRow}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              Add Size
            </button>
          </div>

          <div className="space-y-3">
            {values.sizes.map((row, index) => (
              <div key={`${row.size}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input
                  value={row.size}
                  onChange={(event) => updateSize(index, "size", event.target.value)}
                  placeholder="Size"
                  className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  value={row.stock}
                  onChange={(event) => updateSize(index, "stock", event.target.value)}
                  placeholder="Stock"
                  className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Shoe" : "Update Shoe"}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace add-shoe page**

Replace `app/admin/shoes/new/page.tsx` with:

```tsx
import ShoeForm, { type BrandOption } from "../ShoeForm"
import { prisma } from "@/lib/prisma"

export default async function AddShoePage() {
  const brands: BrandOption[] = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  })

  return <ShoeForm mode="create" brands={brands} />
}
```

- [ ] **Step 3: Replace edit-shoe page**

Replace `app/admin/shoes/[id]/page.tsx` with:

```tsx
import ShoeForm, { type BrandOption, type ShoeFormValues } from "../ShoeForm"
import { prisma } from "@/lib/prisma"
import { normalizeStockRows } from "@/lib/commerce"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditShoePage({ params }: Props) {
  const { id } = await params

  const [brands, shoe] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.shoe.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        sizes: true,
      },
    }),
  ])

  if (!shoe) notFound()

  const brandOptions: BrandOption[] = brands
  const initialValues: ShoeFormValues = {
    name: shoe.name,
    description: shoe.description,
    image: shoe.images[0]?.url ?? "",
    brandId: shoe.brandId,
    price: shoe.price ? shoe.price.toString() : "",
    sizes: normalizeStockRows(shoe.sizes),
  }

  return (
    <ShoeForm
      mode="edit"
      brands={brandOptions}
      initialValues={initialValues}
      shoeId={shoe.id}
    />
  )
}
```

- [ ] **Step 4: Run targeted lint/build**

Run:

```powershell
npm.cmd run lint -- app\admin\shoes\ShoeForm.tsx app\admin\shoes\new\page.tsx "app\admin\shoes\[id]\page.tsx"
npm.cmd run build
```

Expected: lint exit code 0 and build exit code 0.

- [ ] **Step 5: Commit shared admin form**

Run:

```powershell
git add app\admin\shoes\ShoeForm.tsx app\admin\shoes\new\page.tsx "app\admin\shoes\[id]\page.tsx"
git commit -m "feat: add admin shoe stock form"
```

Expected: commit succeeds.

## Task 4: Admin Dashboard And Product List

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/shoes/page.tsx`

- [ ] **Step 1: Replace admin dashboard with operational summary**

Replace `app/admin/page.tsx` with:

```tsx
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminPage() {
  const [
    totalProducts,
    totalBrands,
    totalOrders,
    lowStockSizes,
  ] = await Promise.all([
    prisma.shoe.count(),
    prisma.brand.count(),
    prisma.order.count(),
    prisma.shoeSize.findMany({
      where: {
        stock: {
          lte: 3,
        },
      },
      include: {
        shoe: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 6,
    }),
  ])

  const cards = [
    { label: "Products", value: totalProducts, href: "/admin/shoes" },
    { label: "Brands", value: totalBrands, href: "/admin/shoes/new" },
    { label: "Orders", value: totalOrders, href: "/admin" },
  ]

  return (
    <div className="text-gray-100 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">
          Operational snapshot for product and stock management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition"
          >
            <div className="text-sm text-gray-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold">{card.value}</div>
          </Link>
        ))}
      </div>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-medium">Low Stock</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sizes at 3 units or fewer.
            </p>
          </div>
          <Link href="/admin/shoes" className="text-sm text-blue-400 hover:text-blue-300">
            Manage products
          </Link>
        </div>

        {lowStockSizes.length === 0 ? (
          <p className="text-sm text-gray-500">No low-stock sizes.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {lowStockSizes.map((size) => (
              <div key={size.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{size.shoe.name}</p>
                  <p className="text-sm text-gray-500">Size {size.size}</p>
                </div>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-200">
                  {size.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Update admin product list types and imports**

In `app/admin/shoes/page.tsx`, add imports:

```ts
import Image from "next/image"
import { availabilityLabel, formatCurrency, type StockRow } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
```

Update the `Shoe` interface:

```ts
interface Shoe {
    id: string
    name: string
    price: string | number | null
    brand: { name: string }
    images: { url: string }[]
    sizes: StockRow[]
}
```

Add error state after `loading`:

```ts
    const [error, setError] = useState<string | null>(null)
```

In `fetchShoes`, set error before and during fetch:

```ts
            setError(null)
```

Replace the `catch (err)` block with:

```ts
        } catch (err) {
            console.error(err)
            setError("Unable to load products.")
```

After the loading return block, add:

```tsx
    if (error)
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                {error}
            </div>
        )
```

- [ ] **Step 3: Replace admin table image and stock cells**

In `app/admin/shoes/page.tsx`, replace the `<img>` block in the table with:

```tsx
                                    <Image
                                        src={normalizeImagePath(
                                            shoe.images?.[0]?.url ||
                                            "/placeholder.png"
                                        )}
                                        alt={shoe.name}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-contain rounded-lg border border-gray-700 bg-white"
                                    />
```

Add a `Stock` header after `Price`:

```tsx
                            <th className="p-4 text-left text-gray-300">Stock</th>
```

Add a stock cell after price:

```tsx
                                <td className="p-4 text-gray-300">
                                    {availabilityLabel(shoe.sizes ?? [])}
                                </td>
```

Replace the price formatter with:

```tsx
                                    {formatCurrency(shoe.price)}
```

Add empty table body state before `shoes.map`:

```tsx
                        {shoes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No products yet.
                                </td>
                            </tr>
                        )}
```

- [ ] **Step 4: Run lint/build**

Run:

```powershell
npm.cmd run lint -- app\admin\page.tsx app\admin\shoes\page.tsx
npm.cmd run build
```

Expected: lint exit code 0 and build exit code 0.

- [ ] **Step 5: Commit admin dashboard/list**

Run:

```powershell
git add app\admin\page.tsx app\admin\shoes\page.tsx
git commit -m "feat: improve admin product operations"
```

Expected: commit succeeds.

## Task 5: Customer Product Browsing And Detail

**Files:**
- Modify: `app/(shop)/product/page.tsx`
- Modify: `app/(public)/product/[slug]/page.tsx`
- Modify: `app/component/product/ProductDetail.tsx`

- [ ] **Step 1: Update product list imports and query**

In `app/(shop)/product/page.tsx`, add imports:

```ts
import { availabilityLabel, formatCurrency } from "@/lib/commerce"
```

Add `sizes` to the Prisma select:

```ts
      sizes: {
        select: {
          size: true,
          stock: true,
        },
      },
```

In `formattedShoes`, add sorted sizes:

```ts
    sizes: [...shoe.sizes].sort((a, b) =>
      a.size.localeCompare(b.size, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    ),
```

- [ ] **Step 2: Replace inactive controls with honest status**

In `app/(shop)/product/page.tsx`, replace the current filter/sort button block with:

```tsx
          <div>
            <p className="text-sm text-black/60">
              {formattedShoes.length} {formattedShoes.length === 1 ? "product" : "products"} available
            </p>
          </div>

          <div className="text-sm text-black/50">
            Sorted by newest arrivals
          </div>
```

Add an empty state before the product grid:

```tsx
        {formattedShoes.length === 0 && (
          <div className="bg-white border border-black/10 rounded-xl p-12 text-center">
            <p className="text-black/50">No products are available yet.</p>
          </div>
        )}
```

Wrap the existing product grid by changing its opening line from:

```tsx
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
```

to:

```tsx
        {formattedShoes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
```

Then change the matching closing `</div>` for that grid from:

```tsx
        </div>
```

to:

```tsx
          </div>
        )}
```

Inside each card info block, after brand, add:

```tsx
                    <p className="text-xs text-black/40">
                      {availabilityLabel(shoe.sizes)}
                    </p>
```

Replace the price display with:

```tsx
                      <div className="text-sm font-medium">
                        {formatCurrency(shoe.price)}
                      </div>
```

- [ ] **Step 3: Sort detail page sizes**

In `app/(public)/product/[slug]/page.tsx`, replace `safeSizes` with:

```ts
  const safeSizes = product.sizes
    .map(size => ({
      id: size.id,
      size: size.size,
      stock: size.stock
    }))
    .sort((a, b) =>
      a.size.localeCompare(b.size, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
```

- [ ] **Step 4: Strengthen product detail states**

In `app/component/product/ProductDetail.tsx`, add:

```ts
  const hasAvailableStock = product.sizes.some((size) => size.stock > 0)
  const canAddToCart = Boolean(selectedSize && product.price && hasAvailableStock && quantity <= maxStock)
```

after `formattedPrice`.

Inside the size button, replace `{size.size}` with:

```tsx
                    <span>{size.size}</span>
                    {isOutOfStock && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest">
                        Sold out
                      </span>
                    )}
```

After the size selector button grid, add:

```tsx
            {!hasAvailableStock && (
              <p className="mt-3 text-sm text-red-600">
                This product is currently out of stock.
              </p>
            )}
            {selectedSizeObj && selectedSizeObj.stock > 0 && (
              <p className="mt-3 text-sm text-black/50">
                {selectedSizeObj.stock} available in size {selectedSizeObj.size}
              </p>
            )}
```

Replace the Add to Cart button with:

```tsx
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex-1 bg-black text-white py-3 rounded-full text-sm uppercase tracking-widest hover:bg-black/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!hasAvailableStock ? "Out of Stock" : "Add to Cart"}
            </button>
```

In `handleAddToCart`, replace:

```ts
    if (!product.price) return
```

with:

```ts
    if (!product.price) {
      toast.error("Price is unavailable")
      return
    }
```

- [ ] **Step 5: Run lint/build**

Run:

```powershell
npm.cmd run lint -- "app\(shop)\product\page.tsx" "app\(public)\product\[slug]\page.tsx" app\component\product\ProductDetail.tsx
npm.cmd run build
```

Expected: lint exit code 0 and build exit code 0.

- [ ] **Step 6: Commit customer product flow**

Run:

```powershell
git add "app\(shop)\product\page.tsx" "app\(public)\product\[slug]\page.tsx" app\component\product\ProductDetail.tsx
git commit -m "feat: clarify customer product availability"
```

Expected: commit succeeds.

## Task 6: Cart And Order Review

**Files:**
- Modify: `app/(shop)/cart/page.tsx`
- Modify: `app/(shop)/account/orders/page.tsx`
- Modify: `app/(shop)/account/orders/[id]/page.tsx`

- [ ] **Step 1: Stop sending client price to checkout**

In `app/(shop)/cart/page.tsx`, replace:

```ts
                items: items.map(i => ({
                    shoeId: i.shoeId,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price
                }))
```

with:

```ts
                items: items.map(i => ({
                    shoeId: i.shoeId,
                    size: i.size,
                    quantity: i.quantity,
                }))
```

In the cart item price block, replace:

```tsx
                                                ${item.price}
```

with:

```tsx
                                                ${item.price.toFixed(2)}
```

Add a line total below quantity:

```tsx
                                            <p className="text-sm text-black/50">
                                                Line total: ${(item.price * item.quantity).toFixed(2)}
                                            </p>
```

Replace the checkout button disabled prop:

```tsx
                                disabled={loading}
```

with:

```tsx
                                disabled={loading || items.length === 0}
```

- [ ] **Step 2: Enrich order list query**

In `app/(shop)/account/orders/page.tsx`, replace the `include` block with:

```ts
    include: {
      items: {
        include: {
          shoe: {
            include: {
              images: {
                orderBy: { order: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
```

Add imports:

```ts
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"
```

In the empty state, add a product link:

```tsx
          <Link
            href="/product"
            className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm text-white hover:bg-black/80"
          >
            Browse products
          </Link>
```

Inside each order card, replace the middle item count div with:

```tsx
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => {
                    const image = normalizeImagePath(item.shoe.images[0]?.url)

                    return (
                      <div
                        key={item.id}
                        className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white"
                      >
                        {image && (
                          <Image
                            src={image}
                            alt={item.shoe.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
```

- [ ] **Step 3: Improve order detail pricing**

In `app/(shop)/account/orders/[id]/page.tsx`, inside the item info block after quantity, add:

```tsx
                  <p className="text-sm text-black/50">
                    Unit price: ${Number(item.price).toFixed(2)}
                  </p>
```

After the summary card, add:

```tsx
      <Link
        href="/product"
        className="inline-flex rounded-full bg-black px-5 py-3 text-sm text-white hover:bg-black/80"
      >
        Continue Shopping
      </Link>
```

Add `import Link from "next/link"` to the top of the file.

- [ ] **Step 4: Run lint/build**

Run:

```powershell
npm.cmd run lint -- "app\(shop)\cart\page.tsx" "app\(shop)\account\orders\page.tsx" "app\(shop)\account\orders\[id]\page.tsx"
npm.cmd run build
```

Expected: lint exit code 0 and build exit code 0.

- [ ] **Step 5: Commit cart/order review**

Run:

```powershell
git add "app\(shop)\cart\page.tsx" "app\(shop)\account\orders\page.tsx" "app\(shop)\account\orders\[id]\page.tsx"
git commit -m "feat: improve cart and order review"
```

Expected: commit succeeds.

## Task 7: Final Verification And Manual Checklist

**Files:**
- Read: all modified files

- [ ] **Step 1: Check status**

Run:

```powershell
git status --short
```

Expected: clean working tree.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: exit code 0. Existing warnings can remain only if they are outside modified files and documented in the final report.

- [ ] **Step 3: Run build**

Run:

```powershell
npm.cmd run build
```

Expected: exit code 0.

- [ ] **Step 4: Manual flow checklist**

Use the running app manually or with browser automation if the user asks for it. Verify:

```text
1. Sign in as an admin.
2. Open /admin and confirm product, brand, order, and low-stock summaries render.
3. Open /admin/shoes/new and create a product with price, image URL, and at least two size rows.
4. Open /admin/shoes and confirm the product appears with image, price, and stock label.
5. Open the product detail page from /product and confirm sizes appear sorted.
6. Confirm a zero-stock size is disabled and a positive-stock size can be selected.
7. Add a positive-stock size to cart.
8. Open /cart, adjust quantity, and checkout.
9. Confirm redirect to /account/orders/[id].
10. Confirm order detail shows item name, size, quantity, unit price, line total, and total.
11. Return to admin edit page and confirm stock decreased.
```

- [ ] **Step 5: Report residual risks**

Report:

```text
- lint result
- build result
- whether manual/browser flow was run
- remaining dependency audit vulnerabilities are outside this phase
- local master/origin divergence if still present
```
