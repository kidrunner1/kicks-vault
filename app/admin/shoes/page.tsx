"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { availabilityLabel, formatCurrency, type StockRow } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { Skeleton } from "@/app/component/ui/Skeleton"

interface Shoe {
  id: string
  name: string
  price: string | number | null
  featured: boolean
  brand: { name: string }
  images: { url: string }[]
  sizes: StockRow[]
}

export default function AdminShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchShoes() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/shoes", {
        credentials: "include",
      })

      const result = await res.json()

      setShoes(result.data ?? [])
    } catch (err) {
      console.error(err)
      setError("ไม่สามารถโหลดสินค้าได้")
    } finally {
      setLoading(false)
    }
  }

  async function deleteShoe(id: string) {
    if (!confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) return

    try {
      const res = await fetch(`/api/admin/shoes/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) throw new Error()

      fetchShoes()
    } catch {
      alert("ลบสินค้าไม่สำเร็จ")
    }
  }

  useEffect(() => {
    fetchShoes()
  }, [])

  if (loading) return <AdminShoesSkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="text-gray-100">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          จัดการสินค้า
        </h1>

        <Link
          href="/admin/shoes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          + เพิ่มสินค้า
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4 text-left text-gray-300">รูป</th>
              <th className="p-4 text-left text-gray-300">ชื่อสินค้า</th>
              <th className="p-4 text-left text-gray-300">แบรนด์</th>
              <th className="p-4 text-left text-gray-300">ราคา</th>
              <th className="p-4 text-left text-gray-300">Stock</th>
              <th className="p-4 text-left text-gray-300">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {shoes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  ยังไม่มีสินค้า
                </td>
              </tr>
            )}

            {shoes.map((shoe) => (
              <tr
                key={shoe.id}
                className="border-t border-gray-800 transition hover:bg-gray-800/50"
              >
                <td className="p-4">
                  <Image
                    src={normalizeImagePath(shoe.images?.[0]?.url || "/placeholder.png")}
                    alt={shoe.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg border border-gray-700 bg-white object-contain"
                  />
                </td>

                <td className="p-4 font-medium">
                  <div className="flex flex-col gap-2">
                    <span>{shoe.name}</span>
                    {shoe.featured && (
                      <span className="w-fit rounded-full border border-lime-300/30 bg-lime-300/10 px-2 py-1 text-xs text-lime-200">
                        Featured
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-4 text-gray-400">
                  {shoe.brand?.name}
                </td>

                <td className="p-4 font-medium text-gray-300">
                  {formatCurrency(shoe.price)}
                </td>

                <td className="p-4 text-gray-300">
                  {availabilityLabel(shoe.sizes ?? [])}
                </td>

                <td className="flex gap-4 p-4">
                  <Link
                    href={`/admin/shoes/${shoe.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    แก้ไข
                  </Link>

                  <button
                    onClick={() => deleteShoe(shoe.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminShoesSkeleton() {
  return (
    <div className="space-y-8 text-gray-100" aria-busy="true" aria-label="กำลังโหลดสินค้า">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton tone="dark" className="h-4 w-32" />
          <Skeleton tone="dark" className="h-9 w-56" />
        </div>
        <Skeleton tone="dark" className="h-10 w-36 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="grid grid-cols-[88px_1.4fr_0.8fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-gray-800 bg-gray-800 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} tone="dark" className="h-4 w-full" />
          ))}
        </div>
        <div className="divide-y divide-gray-800">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[88px_1.4fr_0.8fr_0.7fr_0.8fr_0.7fr] items-center gap-4 p-4"
            >
              <Skeleton tone="dark" className="h-16 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton tone="dark" className="h-5 w-4/5" />
                <Skeleton tone="dark" className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton tone="dark" className="h-4 w-24" />
              <Skeleton tone="dark" className="h-4 w-20" />
              <Skeleton tone="dark" className="h-4 w-28" />
              <div className="flex gap-3">
                <Skeleton tone="dark" className="h-4 w-10" />
                <Skeleton tone="dark" className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
