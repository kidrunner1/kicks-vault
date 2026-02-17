"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditShoePage() {

    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [brandId, setBrandId] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [price, setPrice] = useState("")

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
    }


    // fetch shoe
    useEffect(() => {

        async function fetchShoe() {

            try {

                const res = await fetch(`/api/shoes/${id}`)

                if (!res.ok)
                    throw new Error()

                const data = await res.json()

                setName(data.name)
                setDescription(data.description)
                setImage(data.images?.[0]?.url || "")
                setBrandId(data.brandId)
                setPrice(data.price ? String(data.price) : "")

            } catch {

                alert("Failed to load shoe")

            } finally {

                setLoading(false)

            }

        }

        fetchShoe()

    }, [id])



    async function handleUpdate() {

        try {

            setSaving(true)

            const numericPrice = parseFloat(price)

            if (isNaN(numericPrice)) {
                alert("Invalid price")
                setSaving(false)
                return
            }

            const res = await fetch(`/api/admin/shoes/${id}`, {

                method: "PUT",
                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name,
                    slug: generateSlug(name),
                    description,
                    brandId,
                    price: numericPrice,   // ✅ เพิ่มตรงนี้
                    images: image ? [image] : [],
                    specs: []

                })

            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || "Update failed")
                return
            }

            router.push("/admin/shoes")

        } catch {
            alert("Update failed")
        } finally {
            setSaving(false)
        }

    }

    if (loading)
        return (
            <div className="text-gray-400">
                Loading shoe...
            </div>
        )



    return (

        <div className="max-w-xl text-gray-100">

            {/* TITLE */}
            <h1 className="text-3xl font-semibold mb-6">
                Edit Shoe
            </h1>



            {/* FORM CONTAINER */}
            <div className="
                bg-gray-900
                border border-gray-800
                rounded-xl
                p-6
                space-y-5
            ">


                {/* IMAGE PREVIEW */}
                {image && (

                    <img
                        src={image}
                        className="
                            w-48
                            rounded-lg
                            border border-gray-700
                        "
                    />

                )}



                {/* NAME */}
                <div>

                    <label className="text-sm text-gray-400">
                        Name
                    </label>

                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="
                            w-full
                            mt-1
                            p-2
                            rounded-lg
                            bg-gray-800
                            border border-gray-700
                            text-white
                            focus:outline-none
                            focus:border-blue-500
                        "
                    />

                </div>



                {/* DESCRIPTION */}
                <div>

                    <label className="text-sm text-gray-400">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="
                            w-full
                            mt-1
                            p-2
                            rounded-lg
                            bg-gray-800
                            border border-gray-700
                            text-white
                            focus:outline-none
                            focus:border-blue-500
                        "
                    />

                </div>



                {/* IMAGE URL */}
                <div>

                    <label className="text-sm text-gray-400">
                        Image URL
                    </label>

                    <input
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        className="
                            w-full
                            mt-1
                            p-2
                            rounded-lg
                            bg-gray-800
                            border border-gray-700
                            text-white
                            focus:outline-none
                            focus:border-blue-500
                        "
                    />

                </div>

                {/* PRICE */}
                <div>

                    <label className="text-sm text-gray-400">
                        Price
                    </label>

                    <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="
      w-full
      mt-1
      p-2
      rounded-lg
      bg-gray-800
      border border-gray-700
      text-white
      focus:outline-none
      focus:border-blue-500
    "
                    />

                </div>


                {/* BRAND ID */}
                <div>

                    <label className="text-sm text-gray-400">
                        Brand ID
                    </label>

                    <input
                        value={brandId}
                        onChange={e => setBrandId(e.target.value)}
                        className="
                            w-full
                            mt-1
                            p-2
                            rounded-lg
                            bg-gray-800
                            border border-gray-700
                            text-white
                            focus:outline-none
                            focus:border-blue-500
                        "
                    />

                </div>



                {/* BUTTON */}
                <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        py-3
                        rounded-lg
                        font-medium
                        transition
                        disabled:opacity-50
                    "
                >
                    {saving ? "Updating..." : "Update Shoe"}
                </button>

            </div>

        </div>

    )

}
