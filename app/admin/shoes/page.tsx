"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Shoe {
    id: string
    name: string
    brand: { name: string }
    images: { url: string }[]
}

export default function AdminShoesPage() {

    const [shoes, setShoes] = useState<Shoe[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchShoes() {

        try {

            setLoading(true)

            const res = await fetch("/api/shoes", {
                credentials: "include"
            })

            const result = await res.json()

            setShoes(result.data ?? [])

        } catch (err) {

            console.error(err)

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

                            <th className="p-4 text-left text-gray-300">
                                Image
                            </th>

                            <th className="p-4 text-left text-gray-300">
                                Name
                            </th>

                            <th className="p-4 text-left text-gray-300">
                                Brand
                            </th>

                            <th className="p-4 text-left text-gray-300">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    {/* BODY */}
                    <tbody>

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

                                    <img
                                        src={
                                            shoe.images?.[0]?.url ||
                                            "/placeholder.png"
                                        }
                                        className="
                                            w-16 h-16
                                            object-cover
                                            rounded-lg
                                            border border-gray-700
                                        "
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
