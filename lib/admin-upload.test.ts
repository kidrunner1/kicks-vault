import test from "node:test"
import assert from "node:assert/strict"
import {
  MAX_SHOE_IMAGE_BYTES,
  buildShoeImageFileName,
  getShoeImageExtension,
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

test("shoe image upload creates a safe deterministic file name", () => {
  const fileName = buildShoeImageFileName({
    mimeType: "image/webp",
    now: new Date("2026-06-21T12:34:56.000Z"),
    randomId: "ABC_123",
  })

  assert.equal(fileName, "shoe-20260621-123456-abc123.webp")
})
