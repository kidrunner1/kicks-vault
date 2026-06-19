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
