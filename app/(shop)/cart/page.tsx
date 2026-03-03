"use client"

import { useState } from "react"
import { useCartStore } from "@/app/store/cart-store"
import { useRouter } from "next/navigation"
import { createOrder } from "@/app/actions/create-order"
import { toast } from "sonner"
import Image from "next/image"
import { normalizeImagePath } from "@/lib/image"

export default function CartPage() {

    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        items,
        removeItem,
        updateQuantity,
        clearCart
    } = useCartStore()

    const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    )

    const shipping = subtotal > 0 ? 0 : 0
    const total = subtotal + shipping

    const handleCheckout = async () => {
        if (loading) return
        if (items.length === 0) return

        setLoading(true)

        try {
            const orderId = await createOrder({
                items: items.map(i => ({
                    shoeId: i.shoeId,
                    size: i.size,
                    quantity: i.quantity,
                    price: i.price
                }))
            })

            clearCart()
            router.push(`/account/orders/${orderId}`)

        } catch (error: any) {
            toast.error(error?.message || "Unable to process order.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#f3f3f1] text-black pt-24 pb-32 px-6">

            <div className="max-w-7xl mx-auto">

                <h1 className="text-4xl font-semibold mb-16">
                    Your Cart
                </h1>

                {items.length === 0 && (
                    <div className="bg-white border border-black/10 rounded-2xl p-12 text-center">
                        <p className="text-black/50 mb-6">
                            Your cart is empty.
                        </p>
                        <button
                            onClick={() => router.push("/product")}
                            className="px-6 py-3 bg-black text-white rounded-full text-sm uppercase tracking-widest hover:bg-black/80 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                        {/* ================= LEFT — ITEMS ================= */}
                        <div className="lg:col-span-2 space-y-8">

                            {items.map(item => (
                                <div
                                    key={`${item.shoeId}-${item.size}`}
                                    className="bg-white border border-black/10 rounded-2xl p-6 flex gap-6"
                                >

                                    {/* Image */}
                                    <div className="w-28 h-28 bg-white border border-black/5 rounded-xl flex items-center justify-center overflow-hidden">
                                        <Image
                                            src={normalizeImagePath(item.image)}
                                            alt={item.name}
                                            width={110}
                                            height={110}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between">

                                        <div>
                                            <p className="font-medium text-lg">
                                                {item.name}
                                            </p>

                                            <p className="text-sm text-black/50">
                                                Size: {item.size}
                                            </p>

                                            <p className="mt-2 text-black/70">
                                                ${item.price}
                                            </p>
                                        </div>

                                        {/* Quantity + Remove */}
                                        <div className="flex items-center justify-between mt-6">

                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-4">

                                                <div className="flex items-center bg-black/5 rounded-full px-2 py-1">

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.shoeId,
                                                                item.size,
                                                                Math.max(1, item.quantity - 1)
                                                            )
                                                        }
                                                        className="
          w-8 h-8
          flex items-center justify-center
          rounded-full
          text-sm
          transition
          hover:bg-black/10
          active:scale-90
        "
                                                    >
                                                        −
                                                    </button>

                                                    <span className="w-10 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.shoeId,
                                                                item.size,
                                                                item.quantity + 1
                                                            )
                                                        }
                                                        className="
          w-8 h-8
          flex items-center justify-center
          rounded-full
          text-sm
          transition
          hover:bg-black/10
          active:scale-90
        "
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeItem(item.shoeId, item.size)}
                                                className="
      text-xs
      uppercase
      tracking-widest
      text-black/40
      hover:text-red-500
      transition
    "
                                            >
                                                Remove
                                            </button>

                                        </div>
                                    </div>

                                </div>
                            ))}

                        </div>

                        {/* ================= RIGHT — SUMMARY ================= */}
                        <div className="bg-white border border-black/10 rounded-2xl p-8 h-fit">

                            <h2 className="text-lg font-medium mb-6">
                                Order Summary
                            </h2>

                            <div className="space-y-4 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-black/60">
                                        Subtotal
                                    </span>
                                    <span>
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-black/60">
                                        Shipping
                                    </span>
                                    <span>
                                        {shipping === 0 ? "Free" : `$${shipping}`}
                                    </span>
                                </div>

                                <div className="border-t border-black/10 pt-4 flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="
                  mt-8
                  w-full
                  bg-black
                  text-white
                  py-4
                  rounded-full
                  uppercase
                  tracking-widest
                  text-sm
                  transition
                  hover:bg-black/80
                  disabled:opacity-50
                "
                            >
                                {loading ? "Processing..." : "Checkout"}
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </main>
    )
}