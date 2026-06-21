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

type SupportedImageMimeType = (typeof SUPPORTED_SHOE_IMAGE_TYPES)[number]

export type UploadValidationResult =
  | { ok: true }
  | { ok: false; message: string }

export function getShoeImageExtension(mimeType: string) {
  return imageExtensions[mimeType as SupportedImageMimeType]
}

export function validateShoeImageFile({
  type,
  size,
}: {
  type: string
  size: number
}): UploadValidationResult {
  if (!getShoeImageExtension(type)) {
    return {
      ok: false,
      message: "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ AVIF",
    }
  }

  if (size <= 0) {
    return {
      ok: false,
      message: "ไฟล์รูปภาพว่างเปล่า",
    }
  }

  if (size > MAX_SHOE_IMAGE_BYTES) {
    return {
      ok: false,
      message: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB",
    }
  }

  return { ok: true }
}

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

export function buildShoeImageFileName({
  mimeType,
  now,
  randomId,
}: {
  mimeType: string
  now: Date
  randomId: string
}) {
  const extension = getShoeImageExtension(mimeType)

  if (!extension) {
    throw new Error("Unsupported shoe image type")
  }

  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "-")
  const safeRandomId = randomId.toLowerCase().replace(/[^a-z0-9]/g, "")

  return `shoe-${timestamp}-${safeRandomId}${extension}`
}
