"use client"

import { createDefaultStockRows, normalizeStockRows, type StockRow } from "@/lib/commerce"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export interface BrandOption {
  id: string
  name: string
}

export interface ShoeSpecFormValue {
  label: string
  value: string
}

export interface ShoeFormValues {
  name: string
  description: string
  images: string[]
  specs: ShoeSpecFormValue[]
  featured: boolean
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
  images: [""],
  specs: [
    { label: "Style", value: "Lifestyle" },
    { label: "Fit", value: "True to size" },
  ],
  featured: false,
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

  function updateField(
    field: keyof Pick<ShoeFormValues, "name" | "description" | "brandId" | "price">,
    value: string
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateImage(index: number, value: string) {
    setValues((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? value : image
      ),
    }))
  }

  function addImageRow() {
    setValues((current) => ({
      ...current,
      images: [...current.images, ""],
    }))
  }

  function removeImageRow(index: number) {
    setValues((current) => ({
      ...current,
      images: current.images.length === 1
        ? [""]
        : current.images.filter((_, imageIndex) => imageIndex !== index),
    }))
  }

  function updateSpec(index: number, field: keyof ShoeSpecFormValue, value: string) {
    setValues((current) => ({
      ...current,
      specs: current.specs.map((spec, specIndex) =>
        specIndex === index ? { ...spec, [field]: value } : spec
      ),
    }))
  }

  function addSpecRow() {
    setValues((current) => ({
      ...current,
      specs: [...current.specs, { label: "", value: "" }],
    }))
  }

  function removeSpecRow(index: number) {
    setValues((current) => ({
      ...current,
      specs: current.specs.length === 1
        ? [{ label: "", value: "" }]
        : current.specs.filter((_, specIndex) => specIndex !== index),
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
      setMessage("กรุณาระบุชื่อสินค้า แบรนด์ และราคาที่ถูกต้อง")
      return
    }

    const normalizedSizes = normalizeStockRows(values.sizes)

    if (normalizedSizes.length === 0) {
      setMessage("กรุณาเพิ่มข้อมูลไซซ์อย่างน้อย 1 แถว")
      return
    }

    const images = values.images
      .map((image) => image.trim())
      .filter(Boolean)
    const specs = values.specs
      .map((spec) => ({
        label: spec.label.trim(),
        value: spec.value.trim(),
      }))
      .filter((spec) => spec.label || spec.value)

    if (specs.some((spec) => !spec.label || !spec.value)) {
      setMessage("กรุณาระบุชื่อและค่าของ spec ให้ครบทุกแถว")
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
          featured: values.featured,
          brandId: values.brandId,
          price: numericPrice,
          images,
          specs,
          sizes: normalizedSizes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "ไม่สามารถบันทึกสินค้าได้")
        return
      }

      router.push("/admin/shoes")
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อกับ server ได้")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6 text-gray-100">
      <div>
        <h1 className="text-3xl font-semibold">
          {mode === "create" ? "เพิ่มสินค้า" : "แก้ไขสินค้า"}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          จัดการข้อมูลที่ลูกค้าเห็นใน Store, Product Detail, recommendation และ Checkout
        </p>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        {message && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-400">ชื่อสินค้า</label>
              <input
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
              {slug && (
                <p className="mt-2 text-xs text-gray-500">
                  Slug: {slug}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400">รายละเอียด</label>
              <textarea
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-5 rounded-lg border border-gray-800 bg-gray-950/50 p-4">
            <label className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    featured: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block text-sm font-medium text-gray-100">
                  Featured product
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  ใช้ดันสินค้าใน Store, หน้าแรก และ collection ทีมคัดให้
                </span>
              </span>
            </label>

            <div>
              <label className="text-sm text-gray-400">แบรนด์</label>
              <select
                value={values.brandId}
                onChange={(event) => updateField("brandId", event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">เลือกแบรนด์</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400">ราคา</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => updateField("price", event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">รูปสินค้า</h2>
              <p className="text-sm text-gray-500">
                รูปแรกจะใช้เป็นรูปหลักใน Store และ recommendation
              </p>
            </div>
            <button
              type="button"
              onClick={addImageRow}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              เพิ่มรูป
            </button>
          </div>

          <div className="space-y-3">
            {values.images.map((image, index) => (
              <div key={`image-${index}`} className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={image}
                  onChange={(event) => updateImage(index, event.target.value)}
                  placeholder={index === 0 ? "URL รูปหลัก" : "URL รูปเพิ่มเติม"}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImageRow(index)}
                  className="rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">Specs</h2>
              <p className="text-sm text-gray-500">
                ใช้แสดงจุดเด่นในหน้า Product Detail เช่น Style, Cushion, Upper, Fit
              </p>
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              เพิ่ม spec
            </button>
          </div>

          <div className="space-y-3">
            {values.specs.map((spec, index) => (
              <div key={`spec-${index}`} className="grid gap-3 md:grid-cols-[0.8fr_1fr_auto]">
                <input
                  value={spec.label}
                  onChange={(event) => updateSpec(index, "label", event.target.value)}
                  placeholder="ชื่อ spec"
                  className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <input
                  value={spec.value}
                  onChange={(event) => updateSpec(index, "value", event.target.value)}
                  placeholder="รายละเอียด"
                  className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">Stock ตามไซซ์</h2>
              <p className="text-sm text-gray-500">
                ข้อมูลนี้ใช้จำกัดจำนวนใน Cart และแสดงสถานะพร้อมขายหน้าร้าน
              </p>
            </div>
            <button
              type="button"
              onClick={addSizeRow}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              เพิ่มไซซ์
            </button>
          </div>

          <div className="space-y-3">
            {values.sizes.map((row, index) => (
              <div key={`${row.size}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input
                  value={row.size}
                  onChange={(event) => updateSize(index, "size", event.target.value)}
                  placeholder="ไซซ์"
                  className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  value={row.stock}
                  onChange={(event) => updateSize(index, "stock", event.target.value)}
                  placeholder="Stock"
                  className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : mode === "create" ? "สร้างสินค้า" : "อัปเดตสินค้า"}
        </button>
      </div>
    </div>
  )
}
