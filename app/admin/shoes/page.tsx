"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { availabilityLabel, formatCurrency, type StockRow } from "@/lib/commerce"
import { normalizeImagePath } from "@/lib/image"

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
                credentials: "include"
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

            const res = await fetch(
                `/api/admin/shoes/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            )

            if (!res.ok)
                throw new Error()

            fetchShoes()

        } catch {

            alert("ลบสินค้าไม่สำเร็จ")

        }

    }

    useEffect(() => {
        fetchShoes()
    }, [])


    if (loading)
        return (
            <div className="text-gray-400">
                กำลังโหลดสินค้า...
            </div>
        )

    if (error)
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                {error}
            </div>
        )


    return (

        <div className="text-gray-100">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">

                <h1 className="text-3xl font-semibold">
                    จัดการสินค้า
                </h1>

                <Link
                    href="/admin/shoes/new"
                    className="
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        px-4 py-2
                        rounded-lg
                        transition
                    "
                >
                    + เพิ่มสินค้า
                </Link>

            </div>


            {/* TABLE CONTAINER */}
            <div className="
                bg-gray-900
                border border-gray-800
                rounded-xl
                overflow-hidden
            ">

                <table className="w-full">

                    {/* HEAD */}
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

                    {/* BODY */}
                    <tbody>
                        {shoes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    ยังไม่มีสินค้า
                                </td>
                            </tr>
                        )}

                        {shoes.map(shoe => (
                            <tr
                                key={shoe.id}
                                className="
                                    border-t border-gray-800
                                    hover:bg-gray-800/50
                                    transition
                                "
                            >
                                {/* IMAGE */}
                                <td className="p-4">

                                    <Image
                                        src={normalizeImagePath(
                                            shoe.images?.[0]?.url ||
                                            "/placeholder.png"
                                        )}
                                        alt={shoe.name}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-contain rounded-lg border border-gray-700 bg-white"
                                    />

                                </td>

                                {/* NAME */}
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

                                {/* BRAND */}
                                <td className="p-4 text-gray-400">
                                    {shoe.brand?.name}
                                </td>
                                {/* PRICE */}
                                <td className="p-4 text-gray-300 font-medium">
                                    {formatCurrency(shoe.price)}
                                </td>

                                <td className="p-4 text-gray-300">
                                    {availabilityLabel(shoe.sizes ?? [])}
                                </td>

                                {/* ACTIONS */}
                                <td className="p-4 flex gap-4">

                                    <Link
                                        href={`/admin/shoes/${shoe.id}`}
                                        className="
                                            text-blue-400
                                            hover:text-blue-300
                                        "
                                    >
                                        แก้ไข
                                    </Link>

                                    <button
                                        onClick={() =>
                                            deleteShoe(shoe.id)
                                        }
                                        className="
                                            text-red-400
                                            hover:text-red-300
                                        "
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
