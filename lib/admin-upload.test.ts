import test from "node:test"
import assert from "node:assert/strict"
import {
  MAX_SHOE_IMAGE_BYTES,
  MAX_SHOE_IMAGE_FILES,
  SHOE_IMAGE_ACCEPT,
  buildShoeImageFileName,
  getShoeImageExtension,
  validateShoeImageBatch,
  validateShoeImageFile,
} from "./admin-upload"

test("shoe image upload accepts supported image types", () => {
  assert.equal(getShoeImageExtension("image/jpeg"), ".jpg")
  assert.equal(getShoeImageExtension("image/png"), ".png")
  assert.equal(getShoeImageExtension("image/webp"), ".webp")
  assert.equal(getShoeImageExtension("image/avif"), ".avif")
})

test("shoe image upload rejects unsupported and empty files", () => {
  assert.deepEqual(validateShoeImageFile({ type: "application/pdf", size: 10 }), {
    ok: false,
    message: "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ AVIF",
  })
  assert.deepEqual(validateShoeImageFile({ type: "image/png", size: 0 }), {
    ok: false,
    message: "ไฟล์รูปภาพว่างเปล่า",
  })
})

test("shoe image upload rejects files larger than the limit", () => {
  assert.deepEqual(
    validateShoeImageFile({
      type: "image/png",
      size: MAX_SHOE_IMAGE_BYTES + 1,
    }),
    {
      ok: false,
      message: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB",
    },
  )
})

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

test("shoe image upload creates a safe deterministic file name", () => {
  const fileName = buildShoeImageFileName({
    mimeType: "image/webp",
    now: new Date("2026-06-21T12:34:56.000Z"),
    randomId: "ABC_123",
  })

  assert.equal(fileName, "shoe-20260621-123456-abc123.webp")
})
