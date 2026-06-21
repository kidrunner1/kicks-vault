"use client"

import Image from "next/image"
import { ImagePlus, Link as LinkIcon, Trash2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { normalizeImagePath } from "@/lib/image"
import { adminButtonClass, adminInputClass, cn } from "../admin-ui"

interface UploadResponse {
  paths?: string[]
  error?: string
}

export default function ShoeImageManager({
  images,
  onImagesChange,
}: {
  images: string[]
  onImagesChange: (images: string[]) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const visibleImages = images.length > 0 ? images : [""]

  function updateImage(index: number, value: string) {
    onImagesChange(
      visibleImages.map((image, imageIndex) =>
        imageIndex === index ? value : image,
      ),
    )
  }

  function removeImage(index: number) {
    const nextImages = visibleImages.filter(
      (_, imageIndex) => imageIndex !== index,
    )
    onImagesChange(nextImages.length > 0 ? nextImages : [""])
  }

  function addUrlRow() {
    onImagesChange([...visibleImages, ""])
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      setUploading(true)
      setUploadError(null)

      const response = await fetch("/api/admin/uploads/shoes", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const result = (await response.json()) as UploadResponse

      if (!response.ok || !result.paths) {
        setUploadError(result.error || "อัปโหลดรูปสินค้าไม่สำเร็จ")
        return
      }

      const keptImages = visibleImages
        .map((image) => image.trim())
        .filter(Boolean)

      onImagesChange([...keptImages, ...result.paths])
    } catch {
      setUploadError("ไม่สามารถเชื่อมต่อระบบอัปโหลดรูปได้")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">รูปสินค้า</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            อัปโหลดรูปจากเครื่อง หรือใส่ URL สำรองสำหรับรูปเดิม
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => uploadFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={adminButtonClass.primary}
          >
            <Upload size={16} />
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
          </button>
          <button
            type="button"
            onClick={addUrlRow}
            className={adminButtonClass.secondary}
          >
            <LinkIcon size={16} />
            เพิ่ม URL
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {visibleImages.map((image, index) => {
          const trimmedImage = image.trim()

          return (
            <div
              key={`shoe-image-${index}`}
              className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-[88px_1fr_auto]"
            >
              <div className="relative flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {trimmedImage ? (
                  <Image
                    src={normalizeImagePath(trimmedImage)}
                    alt={`รูปสินค้า ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : (
                  <ImagePlus className="text-slate-400" size={24} />
                )}
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  รูปที่ {index + 1}
                </span>
                <input
                  value={image}
                  onChange={(event) => updateImage(index, event.target.value)}
                  placeholder="อัปโหลดแล้ว path จะมาอยู่ตรงนี้ หรือใส่ URL รูป"
                  className={adminInputClass}
                />
              </label>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className={cn(adminButtonClass.danger, "self-end")}
              >
                <Trash2 size={16} />
                ลบ
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
