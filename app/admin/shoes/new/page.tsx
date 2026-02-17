"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AddShoePage() {

    const router = useRouter()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [brandId, setBrandId] = useState("")
    const [brands, setBrands] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [price, setPrice] = useState("")

    useEffect(() => {

        fetch("/api/brands")
            .then(res => res.json())
            .then(data => setBrands(data))

    }, [])


    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
    }


    async function handleSubmit() {

        if (!name || !brandId) {
            alert("Name and Brand ID are required")
            return
        }

        try {

            setLoading(true)

            const res = await fetch("/api/admin/shoes", {

                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    name,
                    slug: generateSlug(name),
                    description,
                    featured: true,

                    brandId,

                    images: image ? [image] : [],
                    specs: []

                })

            })

            if (!res.ok) {

                const err = await res.json()
                alert(err.error || "Failed to create shoe")
                return

            }

            const numericPrice = parseFloat(price)

            if (!name || !brandId || isNaN(numericPrice)) {
                alert("Name, Brand and valid Price are required")
                return
            }


            router.push("/admin/shoes")

        } catch (err) {

            console.error(err)
            alert("Something went wrong")

        } finally {

            setLoading(false)

        }

    }


    return (

        <div className="max-w-xl space-y-4">

            <h1 className="text-3xl mb-4">
                Add Shoe
            </h1>


            <input
                className="w-full p-2 border bg-black"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />


            <input
                className="w-full p-2 border bg-black"
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />

            <input
                type="number"
                step="0.01"
                className="w-full p-2 border bg-black"
                placeholder="Price"
                value={price}
                onChange={e => setPrice(e.target.value)}
            />



            <input
                className="w-full p-2 border bg-black"
                placeholder="Image URL"
                value={image}
                onChange={e => setImage(e.target.value)}
            />


            <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full p-2 border bg-black"
            >

                <option value="">
                    Select Brand
                </option>

                {brands.map(brand => (

                    <option key={brand.id} value={brand.id}>
                        {brand.name}
                    </option>

                ))}

            </select>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-white text-black px-4 py-2"
            >
                {loading ? "Creating..." : "Add Shoe"}
            </button>

        </div>

    )

}
