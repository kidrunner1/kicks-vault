# Stability Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repository guidance and harden KicksVault auth, admin access, route protection, checkout stock handling, and touched lint errors.

**Architecture:** Keep the existing Next.js App Router, Prisma, Zustand, and custom JWT stack. Move sensitive checks to server boundaries, keep the proxy as a fast outer guard, and make order stock mutation atomic inside a Prisma transaction.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6, PostgreSQL, bcrypt, jose, Zustand, Zod, TypeScript, ESLint.

---

## File Structure

- Create: `AGENTS.md`
  - Repository guide for future agents and contributors.
- Create: `app/admin/AdminShell.tsx`
  - Client-only admin chrome with navigation highlighting and logout button.
- Modify: `app/admin/layout.tsx`
  - Server admin guard that calls `requireAdmin()` before rendering `AdminShell`.
- Modify: `app/api/auth/me/route.ts`
  - Stable `{ user }` response contract.
- Modify: `app/component/auth/AuthProvider.tsx`
  - Consume the stable auth response contract.
- Modify: `lib/auth-store.ts`
  - Consume the stable auth response contract and set loading state consistently.
- Modify: `app/api/auth/logout/route.ts`
  - Compare hashed refresh token with `bcrypt.compare` before clearing DB token.
- Modify: `proxy.ts`
  - Protect current app paths and allow refresh-token-backed sessions to reach server checks.
- Modify: `app/actions/create-order.ts`
  - Remove duplicate order item push and decrement stock atomically from DB prices.
- Modify: `app/store/cart-store.ts`
  - Update existing cart item by `shoeId + size`.
- Modify: `app/admin/shoes/new/page.tsx`
  - Validate price before POST and send price to the API.
- Modify: `app/api/admin/shoes/route.ts`
  - Replace loose body parsing with Zod validation and typed Prisma error handling.
- Modify: `app/api/admin/shoes/[id]/route.ts`
  - Replace `any` catch annotations with typed Prisma error handling.
- Modify: `app/(shop)/cart/page.tsx`
  - Replace `any` catch with `unknown` handling.
- Modify: `app/(shop)/account/favorites/page.tsx`
  - Fix unescaped apostrophe lint error.
- Modify: `app/(shop)/product/page.tsx`
  - Remove unused `motion` import.
- Modify: `app/component/3D/Shoe.tsx`
  - Replace `any` props with React Three Fiber mesh props.
- Modify: `app/component/product/ProductInfo.tsx`
  - Replace `any` product prop with a local typed shape.
- Modify: `app/component/ui/FormInput.tsx`
  - Wire the existing `disabled` prop into the `<input>`.
- Modify: `app/component/landing/CinematicSection.tsx`
  - Remove unused blur filter variables.

## Task 1: Project Guidance

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Create agent guidance**

Create `AGENTS.md` with this content:

```markdown
# AGENTS.md

## Project

KicksVault is a Next.js App Router storefront for premium sneakers. It uses Prisma/PostgreSQL for persistence, custom JWT access and refresh cookies for auth, Zustand for client state, and a small admin area for shoe management.

## Commands

- Use `npm.cmd` in PowerShell, because `npm` may resolve to `npm.ps1` and fail under the local execution policy.
- Run lint with `npm.cmd run lint`.
- Run production build with `npm.cmd run build`.
- Run the dev server with `npm.cmd run dev`.

## Security Rules

- Never print, commit, or rewrite `.env` values.
- Do not trust client-provided prices. Checkout totals must come from database prices.
- Admin pages must have a server-side guard. Client UI checks are not enough.
- Order creation and stock decrement must happen in the same Prisma transaction.
- Refresh tokens are stored as bcrypt hashes. Compare cookie refresh tokens with `bcrypt.compare`.

## Code Style

- Follow the existing App Router file structure.
- Keep server-only logic in server files and interactive UI in client components.
- Keep edits scoped to the current task.
- Prefer typed request parsing with Zod for API routes.
- Avoid broad UI redesigns during security or stability work.

## Verification

Before claiming a code change is complete, run:

```powershell
npm.cmd run lint
npm.cmd run build
```
```

- [ ] **Step 2: Verify the guide is visible to git**

Run: `git status --short`

Expected: `?? AGENTS.md`

- [ ] **Step 3: Commit project guidance**

Run:

```powershell
git add AGENTS.md
git commit -m "docs: add agent project guide"
```

Expected: Commit succeeds and includes only `AGENTS.md`.

## Task 2: Auth Contract And Logout

**Files:**
- Modify: `app/api/auth/me/route.ts`
- Modify: `app/component/auth/AuthProvider.tsx`
- Modify: `lib/auth-store.ts`
- Modify: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Update `/api/auth/me` response shape**

Replace `app/api/auth/me/route.ts` with:

```ts
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()

  return NextResponse.json({ user })
}
```

- [ ] **Step 2: Update `AuthProvider` to read `{ user }` safely**

In `app/component/auth/AuthProvider.tsx`, replace the `const data = await res.json()` block with:

```ts
                const data: { user: Parameters<typeof setUser>[0] } =
                    await res.json()

                setUser(data.user)
```

Keep the existing `setUser(null)` paths unchanged.

- [ ] **Step 3: Update the auth store response handling**

In `lib/auth-store.ts`, change `fetchUser` to:

```ts
    fetchUser: async () => {
        try {
            const res = await fetch("/api/auth/me", {
                credentials: "include",
            })

            if (!res.ok) throw new Error("Unable to fetch user")

            const data: { user: User | null } = await res.json()

            set({
                user: data.user,
                isAuthenticated: !!data.user,
                isLoading: false,
            })
        } catch {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            })
        }
    },
```

- [ ] **Step 4: Fix hashed refresh-token logout**

In `app/api/auth/logout/route.ts`, add:

```ts
import bcrypt from "bcrypt"
```

Then replace the plaintext comparison block:

```ts
      if (user?.refreshToken === refreshToken) {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { refreshToken: null },
        })
      }
```

with:

```ts
      if (user?.refreshToken) {
        const isCurrentRefreshToken = await bcrypt.compare(
          refreshToken,
          user.refreshToken
        )

        if (isCurrentRefreshToken) {
          await prisma.user.update({
            where: { id: payload.userId },
            data: { refreshToken: null },
          })
        }
      }
```

- [ ] **Step 5: Run targeted lint for auth files**

Run:

```powershell
npm.cmd run lint -- app\api\auth\me\route.ts app\component\auth\AuthProvider.tsx lib\auth-store.ts app\api\auth\logout\route.ts
```

Expected: No lint errors for these files.

- [ ] **Step 6: Commit auth fixes**

Run:

```powershell
git add app\api\auth\me\route.ts app\component\auth\AuthProvider.tsx lib\auth-store.ts app\api\auth\logout\route.ts
git commit -m "fix: stabilize auth session contract"
```

Expected: Commit succeeds.

## Task 3: Server-Side Admin Guard

**Files:**
- Create: `app/admin/AdminShell.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Move the current client shell into `AdminShell`**

Create `app/admin/AdminShell.tsx` with the current interactive admin layout behavior:

```tsx
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Shoes", href: "/admin/shoes" },
    { name: "Add Shoe", href: "/admin/shoes/new" },
  ]

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
        <div className="mb-10">
          <h1 className="text-xl font-semibold tracking-wide">
            KicksVault
          </h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-2 rounded-lg transition
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-8">
          <div className="text-sm text-gray-400">Admin Dashboard</div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Logged in as Admin</div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/admin/layout.tsx` with a server guard**

Replace `app/admin/layout.tsx` with:

```tsx
import { requireAdmin } from "@/lib/auth"
import { AuthError } from "@/lib/errors/auth-error"
import { redirect } from "next/navigation"
import AdminShell from "./AdminShell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(error.statusCode === 403 ? "/" : "/login")
    }

    throw error
  }

  return <AdminShell>{children}</AdminShell>
}
```

- [ ] **Step 3: Run targeted build check**

Run:

```powershell
npm.cmd run build
```

Expected: Build succeeds and `/admin` routes are dynamic because they depend on cookies.

- [ ] **Step 4: Commit admin guard**

Run:

```powershell
git add app\admin\layout.tsx app\admin\AdminShell.tsx
git commit -m "fix: enforce admin guard on server"
```

Expected: Commit succeeds.

## Task 4: Route Protection

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: Update protected routes and session-token check**

Replace `proxy.ts` with:

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value
  const { pathname } = request.nextUrl

  const protectedRoutes = ["/account", "/cart", "/admin"]

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register"

  const hasSessionCookie = Boolean(accessToken || refreshToken)

  if (!hasSessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (hasSessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}
```

- [ ] **Step 2: Run targeted lint**

Run:

```powershell
npm.cmd run lint -- proxy.ts
```

Expected: No lint errors for `proxy.ts`.

- [ ] **Step 3: Commit route protection**

Run:

```powershell
git add proxy.ts
git commit -m "fix: align route protection paths"
```

Expected: Commit succeeds.

## Task 5: Checkout Order And Cart Stability

**Files:**
- Modify: `app/actions/create-order.ts`
- Modify: `app/store/cart-store.ts`
- Modify: `app/(shop)/cart/page.tsx`

- [ ] **Step 1: Update cart store matching**

In `app/store/cart-store.ts`, replace the map predicate inside `addItem`:

```ts
                        i.shoeId === item.shoeId
```

with:

```ts
                        i.shoeId === item.shoeId && i.size === item.size
```

- [ ] **Step 2: Replace order creation action**

Replace `app/actions/create-order.ts` with:

```ts
"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { Prisma } from "@prisma/client"

interface CreateOrderInput {
  items: {
    shoeId: string
    size: string
    quantity: number
  }[]
}

const orderSchema = z.object({
  items: z.array(
    z.object({
      shoeId: z.string().uuid(),
      size: z.string().min(1),
      quantity: z.number().int().min(1),
    })
  ).min(1),
})

export async function createOrder(data: CreateOrderInput) {
  const parsed = orderSchema.safeParse(data)

  if (!parsed.success) {
    throw new Error("Invalid order data")
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Please sign in before checking out")
  }

  const { items } = parsed.data

  const orderId = await prisma.$transaction(async (tx) => {
    let total = new Prisma.Decimal(0)

    const orderItems: {
      shoeId: string
      quantity: number
      size: string
      price: Prisma.Decimal
    }[] = []

    for (const item of items) {
      const shoe = await tx.shoe.findUnique({
        where: { id: item.shoeId },
        select: {
          price: true,
          sizes: {
            where: { size: item.size },
            select: { id: true },
            take: 1,
          },
        },
      })

      if (!shoe || shoe.price === null) {
        throw new Error("Product price was not found")
      }

      if (shoe.sizes.length === 0) {
        throw new Error("Selected size was not found")
      }

      const stockUpdate = await tx.shoeSize.updateMany({
        where: {
          shoeId: item.shoeId,
          size: item.size,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      })

      if (stockUpdate.count !== 1) {
        throw new Error("Insufficient stock for selected size")
      }

      const price = new Prisma.Decimal(shoe.price)
      total = total.add(price.mul(item.quantity))

      orderItems.push({
        shoeId: item.shoeId,
        quantity: item.quantity,
        size: item.size,
        price,
      })
    }

    const order = await tx.order.create({
      data: {
        userId: user.id,
        total,
        items: {
          create: orderItems,
        },
      },
    })

    return order.id
  })

  return orderId
}
```

- [ ] **Step 3: Replace `any` catch in cart page**

In `app/(shop)/cart/page.tsx`, replace:

```ts
        } catch (error: any) {
            toast.error(error?.message || "Unable to process order.")
```

with:

```ts
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to process order."

            toast.error(message)
```

- [ ] **Step 4: Run targeted lint**

Run:

```powershell
npm.cmd run lint -- app\actions\create-order.ts app\store\cart-store.ts "app\(shop)\cart\page.tsx"
```

Expected: No lint errors for these files.

- [ ] **Step 5: Commit checkout fixes**

Run:

```powershell
git add app\actions\create-order.ts app\store\cart-store.ts "app\(shop)\cart\page.tsx"
git commit -m "fix: make checkout stock updates atomic"
```

Expected: Commit succeeds.

## Task 6: Admin Shoe Creation Validation

**Files:**
- Modify: `app/admin/shoes/new/page.tsx`
- Modify: `app/api/admin/shoes/route.ts`
- Modify: `app/api/admin/shoes/[id]/route.ts`

- [ ] **Step 1: Type brand options in add shoe page**

In `app/admin/shoes/new/page.tsx`, add this type above the component:

```ts
interface BrandOption {
    id: string
    name: string
}
```

Replace:

```ts
    const [brands, setBrands] = useState<any[]>([])
```

with:

```ts
    const [brands, setBrands] = useState<BrandOption[]>([])
```

- [ ] **Step 2: Validate price before POST and send it**

In `handleSubmit`, replace the first validation and request body flow with:

```ts
        const numericPrice = Number(price)

        if (!name.trim() || !brandId || !Number.isFinite(numericPrice) || numericPrice < 0) {
            alert("Name, brand and valid price are required")
            return
        }
```

Add `price: numericPrice` inside the JSON body:

```ts
                    price: numericPrice,
```

Remove the later `parseFloat(price)` validation block that currently runs after the API request.

- [ ] **Step 3: Add Zod validation to create-shoe API**

In `app/api/admin/shoes/route.ts`, add imports:

```ts
import { Prisma } from "@prisma/client"
import { z } from "zod"
```

Add these schemas below the imports:

```ts
const shoeSpecSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const createShoeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
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
})
```

Replace loose body destructuring with:

```ts
    const parsed = createShoeSchema.safeParse(await req.json())

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
      featured,
      brandId,
      price,
      images,
      specs,
    } = parsed.data
```

Replace `price: parseFloat(body.price) || 0` with:

```ts
        price,
```

Replace `catch (error: any)` with:

```ts
  } catch (error) {
```

Replace the P2002 check with:

```ts
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
```

- [ ] **Step 4: Remove `any` catch annotations from admin update/delete route**

In `app/api/admin/shoes/[id]/route.ts`, replace both `catch (error: any)` with:

```ts
  } catch (error) {
```

For the update route, add a typed unique error check before the generic response:

```ts
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }
```

- [ ] **Step 5: Run targeted lint**

Run:

```powershell
npm.cmd run lint -- app\admin\shoes\new\page.tsx app\api\admin\shoes\route.ts app\api\admin\shoes\[id]\route.ts
```

Expected: No lint errors for these files.

- [ ] **Step 6: Commit admin validation**

Run:

```powershell
git add app\admin\shoes\new\page.tsx app\api\admin\shoes\route.ts app\api\admin\shoes\[id]\route.ts
git commit -m "fix: validate admin shoe creation"
```

Expected: Commit succeeds.

## Task 7: Existing Lint Errors In Untouched UI Files

**Files:**
- Modify: `app/(shop)/account/favorites/page.tsx`
- Modify: `app/(shop)/product/page.tsx`
- Modify: `app/component/3D/Shoe.tsx`
- Modify: `app/component/product/ProductInfo.tsx`
- Modify: `app/component/ui/FormInput.tsx`
- Modify: `app/component/landing/CinematicSection.tsx`

- [ ] **Step 1: Fix unescaped apostrophe**

In `app/(shop)/account/favorites/page.tsx`, replace:

```tsx
                    Sneakers you've saved for later.
```

with:

```tsx
                    Sneakers you have saved for later.
```

- [ ] **Step 2: Remove unused product page import**

In `app/(shop)/product/page.tsx`, remove:

```ts
import { motion } from "framer-motion"
```

- [ ] **Step 3: Type 3D shoe props**

In `app/component/3D/Shoe.tsx`, update the React Three Fiber import:

```ts
import { ThreeElements, useFrame } from "@react-three/fiber"
```

Add:

```ts
type ShoeProps = ThreeElements["mesh"]
```

Replace:

```ts
export default function Shoe(props: any) {
```

with:

```ts
export default function Shoe(props: ShoeProps) {
```

- [ ] **Step 4: Type product info props**

Replace the top of `app/component/product/ProductInfo.tsx` with:

```tsx
import PriceTag from "./PriceTag"

interface ProductInfoProduct {
  brand: string
  name: string
  price: number
  description: string
}

interface Props {
  product: ProductInfoProduct
}
```

Keep the existing component body.

- [ ] **Step 5: Use disabled prop in `FormInput`**

In `app/component/ui/FormInput.tsx`, add this prop to the `<input>`:

```tsx
        disabled={disabled}
```

- [ ] **Step 6: Remove unused blur variables**

In `app/component/landing/CinematicSection.tsx`, remove `useMotionTemplate` from the import list and remove:

```ts
    const blurValue = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8])
    const blurFilter = useMotionTemplate`blur(${blurValue}px)`
```

- [ ] **Step 7: Run full lint**

Run:

```powershell
npm.cmd run lint
```

Expected: No lint errors. Warnings for `<img>` usage may remain if ESLint treats them as warnings.

- [ ] **Step 8: Commit lint cleanup**

Run:

```powershell
git add "app\(shop)\account\favorites\page.tsx" "app\(shop)\product\page.tsx" app\component\3D\Shoe.tsx app\component\product\ProductInfo.tsx app\component\ui\FormInput.tsx app\component\landing\CinematicSection.tsx
git commit -m "fix: clear existing lint errors"
```

Expected: Commit succeeds.

## Task 8: Final Verification

**Files:**
- Read: all modified files

- [ ] **Step 1: Check git status**

Run:

```powershell
git status --short
```

Expected: Clean working tree or only intentional uncommitted files created by the current worker.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: Command exits with code 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: Command exits with code 0.

- [ ] **Step 4: Review route output**

Inspect the `npm.cmd run build` route table.

Expected:

- `/admin` and nested admin routes are not static-only pages after the server guard change.
- Auth and admin API routes remain dynamic.
- Storefront pages still build.

- [ ] **Step 5: Summarize residual risks**

Report:

- Whether lint passed.
- Whether build passed.
- Whether remaining audit vulnerabilities still exist.
- Whether browser testing was skipped because the user asked not to open the browser.
