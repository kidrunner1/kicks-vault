"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { availabilityLabel, formatCurrency, type StockRow } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"
import { Skeleton } from "@/app/component/ui/Skeleton"
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminStatusBadge,
} from "../admin-ui"

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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="จัดการสินค้า"
        description="ตรวจรูป ราคา featured และ stock ของสินค้าในร้าน"
        actions={
          <AdminLinkButton href="/admin/shoes/new" variant="primary">
            + เพิ่มสินค้า
          </AdminLinkButton>
        }
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  รูป
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  ชื่อสินค้า
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  แบรนด์
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  ราคา
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  Stock
                </th>
                <th className="p-4 text-left text-sm font-semibold text-slate-600">
                  จัดการ
                </th>
              </tr>
            </thead>

            <tbody>
              {shoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    ยังไม่มีสินค้า
                  </td>
                </tr>
              )}

              {shoes.map((shoe) => (
                <tr
                  key={shoe.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50"
                >
                  <td className="p-4">
                    <Image
                      src={normalizeImagePath(
                        shoe.images?.[0]?.url || "/placeholder.png",
                      )}
                      alt={shoe.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain"
                    />
                  </td>

                  <td className="p-4 font-medium text-slate-950">
                    <div className="flex flex-col gap-2">
                      <span>{shoe.name}</span>
                      {shoe.featured && (
                        <AdminStatusBadge label="Featured" tone="accent" />
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-slate-600">{shoe.brand?.name}</td>

                  <td className="p-4 font-semibold text-slate-800">
                    {formatCurrency(shoe.price)}
                  </td>

                  <td className="p-4 text-slate-700">
                    {availabilityLabel(shoe.sizes ?? [])}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/admin/shoes/${shoe.id}`}
                        className="font-semibold text-slate-900 transition hover:text-black"
                      >
                        แก้ไข
                      </Link>

                      <button
                        onClick={() => deleteShoe(shoe.id)}
                        className="font-semibold text-red-600 transition hover:text-red-800"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AdminShoesSkeleton() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-label="กำลังโหลดสินค้า"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton tone="light" className="h-4 w-32" />
          <Skeleton tone="light" className="h-9 w-56" />
        </div>
        <Skeleton tone="light" className="h-10 w-36 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[88px_1.4fr_0.8fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} tone="light" className="h-4 w-full" />
          ))}
        </div>
        <div className="divide-y divide-slate-200">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[88px_1.4fr_0.8fr_0.7fr_0.8fr_0.7fr] items-center gap-4 p-4"
            >
              <Skeleton tone="light" className="h-16 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton tone="light" className="h-5 w-4/5" />
                <Skeleton tone="light" className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton tone="light" className="h-4 w-24" />
              <Skeleton tone="light" className="h-4 w-20" />
              <Skeleton tone="light" className="h-4 w-28" />
              <div className="flex gap-3">
                <Skeleton tone="light" className="h-4 w-10" />
                <Skeleton tone="light" className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
