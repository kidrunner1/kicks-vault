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
            setError("Unable to load products.")

        } finally {

            setLoading(false)

        }

    }


    async function deleteShoe(id: string) {

        if (!confirm("Delete this shoe?")) return

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

            alert("Delete failed")

        }

    }

    useEffect(() => {
        fetchShoes()
    }, [])


    if (loading)
        return (
            <div className="text-gray-400">
                Loading shoes...
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
                    Shoes Management
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
                    + Add Shoe
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
                            <th className="p-4 text-left text-gray-300">Image</th>
                            <th className="p-4 text-left text-gray-300">Name</th>
                            <th className="p-4 text-left text-gray-300">Brand</th>
                            <th className="p-4 text-left text-gray-300">Price</th>
                            <th className="p-4 text-left text-gray-300">Stock</th>
                            <th className="p-4 text-left text-gray-300">Actions</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        {shoes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No products yet.
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
                                    {shoe.name}
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
                                        Edit
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
                                        Delete
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
