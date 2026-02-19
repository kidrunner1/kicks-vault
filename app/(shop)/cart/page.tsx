"use client"
import { useState } from "react"
import { useCartStore } from "@/app/store/cart-store"
import { useRouter } from "next/navigation"
import { createOrder } from "@/app/actions/create-order"
import { toast } from "sonner"

export default function CartPage() {

    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        items,
        removeItem,
        updateQuantity,
        clearCart
    } = useCartStore()

    const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    )

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
        <main className="min-h-screen bg-black text-white pt-40 pb-40 px-8">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-4xl mb-16 tracking-tight">
                    Your Cart
                </h1>

                {items.length === 0 && (
                    <p className="text-white/40">
                        Your cart is empty.
                    </p>
                )}

                <div className="space-y-10">

                    {items.map(item => (
                        <div
                            key={`${item.shoeId}-${item.size}`}
                            className="border border-white/10 p-8 rounded-xl flex justify-between items-center"
                        >

                            <div className="space-y-2">
                                <p className="text-xl">{item.name}</p>
                                <p className="text-white/50 text-sm">
                                    Size: {item.size}
                                </p>
                                <p className="text-white/70">
                                    ${item.price}
                                </p>
                            </div>

                            <div className="flex items-center gap-6">

                                <div className="flex items-center gap-3">

                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.shoeId,
                                                item.size,
                                                Math.max(1, item.quantity - 1)
                                            )
                                        }
                                        className="px-3 py-1 border border-white/20 hover:bg-white/10 active:scale-95 transition-all duration-200"
                                    >
                                        -
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.shoeId,
                                                item.size,
                                                item.quantity + 1
                                            )
                                        }
                                        className="px-3 py-1 border border-white/20 hover:bg-white/10 active:scale-95 transition-all duration-200"
                                    >
                                        +
                                    </button>

                                </div>

                                <button
                                    onClick={() => removeItem(item.shoeId, item.size)}
                                    className="text-red-400 text-sm hover:text-red-300 transition-colors duration-200"

                                >
                                    Remove
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

                {items.length > 0 && (
                    <div className="mt-20 border-t border-white/10 pt-10 flex justify-between items-center">

                        <p className="text-2xl">
                            Total: ${total.toFixed(2)}
                        </p>

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="px-10 py-4 bg-white text-black rounded-full disabled:opacity-50 transition-all duration-300 hover:scale-[1.02]
                             hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed" >

                            {loading ? "Processing..." : "Checkout"}
                        </button>

                    </div>
                )}

            </div>

        </main>
    )
}
