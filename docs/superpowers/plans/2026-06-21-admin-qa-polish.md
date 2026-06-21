# Admin QA And Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden and polish the newly redesigned admin area so the light UI and local image upload behave cleanly in real use.

**Architecture:** Treat this as a focused QA pass, not a feature expansion. Add small tests for copy integrity and upload validation, keep local uploads out of git, polish the upload/form interaction states, and finish with the project's required lint and build verification.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma 6, Node test runner through `tsx`, Tailwind CSS, local file uploads under `public/uploads/shoes`.

---

## Starting State

- Work on `master` only.
- `master` is ahead of `origin/master`.
- There is an untracked local uploaded file at `public/uploads/shoes/shoe-20260621-122052-c547134c8642cf08.jpg`.
- Preserve that file. Do not stage or delete it.
- Use `npm.cmd` in PowerShell for lint/build.

## File Structure

- Modify: `.gitignore`
  - Ignore generated local upload images while keeping `public/uploads/shoes/.gitkeep` tracked.
- Create: `lib/admin-copy-integrity.test.ts`
  - Test recently edited admin/upload files for mojibake markers, replacement characters, and C1 control characters that indicate broken Thai copy.
- Modify: `lib/admin-upload.ts`
  - Export accepted MIME types, accept string, max file count, and batch validation.
- Modify: `lib/admin-upload.test.ts`
  - Cover accepted MIME constants and max file count.
- Modify: `app/api/admin/uploads/shoes/route.ts`
  - Use batch validation before writing files.
- Modify: `app/admin/shoes/ShoeImageManager.tsx`
  - Pre-validate selected files before upload, reuse the shared accept string, and improve upload error live region.
- Modify: `app/admin/shoes/ShoeForm.tsx`
  - Improve responsive spec/stock rows, required labels, and message live regions.
- Modify: `app/admin/admin-ui.tsx`
  - Add chart meter semantics and safer long-value wrapping.
- Modify: `app/admin/page.tsx`
  - Let large metric values wrap without breaking card layout.

## Task 1: Keep Local Uploads Out Of Git

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add upload ignore rules**

Append this block to `.gitignore`:

```gitignore

# local admin uploads
/public/uploads/shoes/*
!/public/uploads/shoes/.gitkeep
```

- [ ] **Step 2: Verify the existing uploaded file is ignored**

Run:

```powershell
git status --short --ignored public/uploads/shoes
```

Expected: the local uploaded `.jpg` appears as ignored with `!!`, and `.gitkeep` remains tracked.

- [ ] **Step 3: Commit git hygiene**

```powershell
git add .gitignore
git commit -m "chore: ignore local uploaded shoe images"
```

## Task 2: Add Admin Copy Integrity Test

**Files:**
- Create: `lib/admin-copy-integrity.test.ts`

- [ ] **Step 1: Create copy integrity test**

Create `lib/admin-copy-integrity.test.ts`:

```ts
import test from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const roots = [
  "app/admin",
  "app/api/admin/uploads",
  "lib/admin-upload.ts",
]

const fileExtensions = new Set([".ts", ".tsx"])
const brokenCopyPattern = /[\u0080-\u009f\uFFFD]/
const mojibakeThaiPattern = /เธ[\u0080-\u0E7F]/

function collectFiles(target: string): string[] {
  const absoluteTarget = path.join(process.cwd(), target)
  const stats = statSync(absoluteTarget)

  if (stats.isFile()) {
    return fileExtensions.has(path.extname(target)) ? [target] : []
  }

  return readdirSync(absoluteTarget).flatMap((entry) => {
    const relativePath = path.join(target, entry)
    const absolutePath = path.join(process.cwd(), relativePath)
    const entryStats = statSync(absolutePath)

    if (entryStats.isDirectory()) {
      return collectFiles(relativePath)
    }

    return fileExtensions.has(path.extname(entry)) ? [relativePath] : []
  })
}

test("admin copy does not contain mojibake or replacement characters", () => {
  const files = roots.flatMap(collectFiles)
  const offenders = files.filter((file) => {
    const source = readFileSync(path.join(process.cwd(), file), "utf8")

    return brokenCopyPattern.test(source) || mojibakeThaiPattern.test(source)
  })

  assert.deepEqual(offenders, [])
})
```

- [ ] **Step 2: Run the copy integrity test**

Run:

```powershell
npx.cmd tsx --test lib/admin-copy-integrity.test.ts
```

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 3: Commit copy integrity test**

```powershell
git add lib/admin-copy-integrity.test.ts
git commit -m "test: cover admin copy integrity"
```

## Task 3: Harden Upload Validation

**Files:**
- Modify: `lib/admin-upload.ts`
- Modify: `lib/admin-upload.test.ts`
- Modify: `app/api/admin/uploads/shoes/route.ts`
- Modify: `app/admin/shoes/ShoeImageManager.tsx`

- [ ] **Step 1: Extend upload helper constants and batch validation**

In `lib/admin-upload.ts`, replace the top constants and image extension block with:

```ts
export const MAX_SHOE_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_SHOE_IMAGE_FILES = 8

export const SUPPORTED_SHOE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const

export const SHOE_IMAGE_ACCEPT = SUPPORTED_SHOE_IMAGE_TYPES.join(",")

const imageExtensions: Record<(typeof SUPPORTED_SHOE_IMAGE_TYPES)[number], string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
}
```

Then add this function after `validateShoeImageFile`:

```ts
export function validateShoeImageBatch(
  files: Array<{ type: string; size: number }>,
): UploadValidationResult {
  if (files.length === 0) {
    return {
      ok: false,
      message: "กรุณาเลือกไฟล์รูปภาพอย่างน้อย 1 ไฟล์",
    }
  }

  if (files.length > MAX_SHOE_IMAGE_FILES) {
    return {
      ok: false,
      message: `อัปโหลดได้ครั้งละไม่เกิน ${MAX_SHOE_IMAGE_FILES} รูป`,
    }
  }

  for (const file of files) {
    const validation = validateShoeImageFile(file)

    if (!validation.ok) {
      return validation
    }
  }

  return { ok: true }
}
```

- [ ] **Step 2: Extend upload tests**

In `lib/admin-upload.test.ts`, update imports:

```ts
import {
  MAX_SHOE_IMAGE_BYTES,
  MAX_SHOE_IMAGE_FILES,
  SHOE_IMAGE_ACCEPT,
  buildShoeImageFileName,
  getShoeImageExtension,
  validateShoeImageBatch,
  validateShoeImageFile,
} from "./admin-upload"
```

Add tests:

```ts
test("shoe image upload exposes a browser accept string", () => {
  assert.equal(
    SHOE_IMAGE_ACCEPT,
    "image/jpeg,image/png,image/webp,image/avif",
  )
})

test("shoe image upload rejects too many files at once", () => {
  const files = Array.from({ length: MAX_SHOE_IMAGE_FILES + 1 }, () => ({
    type: "image/png",
    size: 10,
  }))

  assert.deepEqual(validateShoeImageBatch(files), {
    ok: false,
    message: `อัปโหลดได้ครั้งละไม่เกิน ${MAX_SHOE_IMAGE_FILES} รูป`,
  })
})
```

- [ ] **Step 3: Run tests**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
```

Expected: PASS with all upload helper tests passing.

- [ ] **Step 4: Update upload route to validate the batch first**

In `app/api/admin/uploads/shoes/route.ts`, import `validateShoeImageBatch`:

```ts
import {
  buildShoeImageFileName,
  validateShoeImageBatch,
} from "@/lib/admin-upload"
```

Replace the no-files check and per-file validation block with:

```ts
    const validation = validateShoeImageBatch(files)

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 },
      )
    }

    await mkdir(uploadDirectory, { recursive: true })

    const uploadedPaths: string[] = []

    for (const file of files) {
```

Remove the old per-file `validateShoeImageFile` block inside the loop.

- [ ] **Step 5: Add client-side pre-validation**

In `app/admin/shoes/ShoeImageManager.tsx`, update imports:

```tsx
import {
  SHOE_IMAGE_ACCEPT,
  validateShoeImageBatch,
} from "@/lib/admin-upload"
```

Change the file input accept prop:

```tsx
accept={SHOE_IMAGE_ACCEPT}
```

At the top of `uploadFiles`, after the empty check, add:

```tsx
    const selectedFiles = Array.from(files)
    const validation = validateShoeImageBatch(selectedFiles)

    if (!validation.ok) {
      setUploadError(validation.message)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }
```

Then change the `Array.from(files).forEach` call to:

```tsx
    selectedFiles.forEach((file) => {
      formData.append("files", file)
    })
```

Add `aria-live="polite"` to the upload error paragraph:

```tsx
<p aria-live="polite" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
```

- [ ] **Step 6: Run focused checks**

Run:

```powershell
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: tests, TypeScript, and ESLint exit with code 0.

- [ ] **Step 7: Commit upload hardening**

```powershell
git add lib/admin-upload.ts lib/admin-upload.test.ts app/api/admin/uploads/shoes/route.ts app/admin/shoes/ShoeImageManager.tsx
git commit -m "fix: polish admin image upload validation"
```

## Task 4: Polish Product Form Responsiveness And Feedback

**Files:**
- Modify: `app/admin/shoes/ShoeForm.tsx`

- [ ] **Step 1: Add required mark helper**

In `app/admin/shoes/ShoeForm.tsx`, add this helper above `export default function ShoeForm`:

```tsx
function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-red-600">
      *
    </span>
  )
}
```

- [ ] **Step 2: Mark required labels**

Change the labels for product name, brand, price, size, and stock to include `RequiredMark`.

Example for product name:

```tsx
<label className="text-sm font-medium text-slate-700">
  ชื่อสินค้า <RequiredMark />
</label>
```

Example for brand:

```tsx
<label className="text-sm font-medium text-slate-700">
  แบรนด์ <RequiredMark />
</label>
```

Example for price:

```tsx
<label className="text-sm font-medium text-slate-700">
  ราคา <RequiredMark />
</label>
```

- [ ] **Step 3: Add live region to form message**

Change the message wrapper:

```tsx
<div
  aria-live="polite"
  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
>
```

- [ ] **Step 4: Make spec rows responsive**

Change the spec row class:

```tsx
className="grid gap-3 sm:grid-cols-[0.8fr_1fr_auto]"
```

Change the spec remove button class:

```tsx
className={cn(adminButtonClass.danger, "w-full sm:w-auto")}
```

- [ ] **Step 5: Make stock rows responsive**

Change the stock row class:

```tsx
className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
```

Change the stock remove button class:

```tsx
className={cn(adminButtonClass.danger, "w-full sm:w-auto")}
```

- [ ] **Step 6: Run checks**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: TypeScript and ESLint exit with code 0.

- [ ] **Step 7: Commit product form polish**

```powershell
git add app/admin/shoes/ShoeForm.tsx
git commit -m "fix: polish admin product form states"
```

## Task 5: Polish Shared Admin Components

**Files:**
- Modify: `app/admin/admin-ui.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add meter semantics to chart bars**

In `app/admin/admin-ui.tsx`, replace the chart track:

```tsx
<div className="h-2 overflow-hidden rounded-full bg-slate-100">
```

with:

```tsx
<div
  role="meter"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={percent}
  className="h-2 overflow-hidden rounded-full bg-slate-100"
>
```

- [ ] **Step 2: Let metric values wrap safely**

In `app/admin/page.tsx`, change metric value text:

```tsx
<p className="mt-3 break-words text-3xl font-semibold text-slate-950">
```

- [ ] **Step 3: Run checks**

Run:

```powershell
npx.cmd tsc --noEmit --pretty false
npm.cmd run lint
```

Expected: TypeScript and ESLint exit with code 0.

- [ ] **Step 4: Commit shared polish**

```powershell
git add app/admin/admin-ui.tsx app/admin/page.tsx
git commit -m "fix: polish admin dashboard accessibility"
```

## Task 6: Final QA Verification

**Files:**
- Inspect changed files from Tasks 1-5.

- [ ] **Step 1: Run all focused tests**

Run:

```powershell
npx.cmd tsx --test lib/admin-copy-integrity.test.ts
npx.cmd tsx --test lib/admin-upload.test.ts
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/product-discovery.test.ts
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run lint**

Run:

```powershell
npm.cmd run lint
```

Expected: ESLint exits with code 0.

- [ ] **Step 3: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: production build exits with code 0.

If this fails at Prisma DLL rename with `EPERM` on `node_modules\.prisma\client\query_engine-windows.dll.node`, record the exact error, identify the locking Node processes, request approval to stop them, and rerun `npm.cmd run build`.

- [ ] **Step 4: Inspect git state**

Run:

```powershell
git status --short --branch
git status --short --ignored public/uploads/shoes
git diff --stat
```

Expected:

- Only the local uploaded image remains ignored.
- No implementation diff remains.
- `master` is ahead of `origin/master`.

- [ ] **Step 5: Document browser verification limitation**

If no dev server/browser session was started, report:

```text
Browser verification was not run in this pass because the user has been opening the app manually. Automated tests, lint, build, and code-level QA passed.
```

## Spec Coverage Checklist

- Main admin route QA: Tasks 2-6.
- Product upload accepted/rejected files: Task 3 and Task 6.
- Preview and edit image compatibility: Task 3 and existing product form checks.
- Hover/focus/readability polish: Tasks 4-5.
- Responsive product form behavior: Task 4.
- Upload route admin/security validation: Task 3 and existing `requireAdmin`.
- Untracked uploaded image preserved: Task 1 and Task 6.
- Automated checks: Task 6.
