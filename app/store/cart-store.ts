import { create } from "zustand"

export interface CartItem {
    shoeId: string
    name: string
    price: number
    image: string
    size: string
    quantity: number
    maxStock: number
}

interface CartState {
    items: CartItem[]
    addItem: (item: CartItem) => void
    clearCart: () => void
    removeItem: (shoeId: string, size: string) => void
    updateQuantity: (shoeId: string, size: string, quantity: number) => void

    getTotal: () => number
}

function toPositiveInteger(value: number, fallback = 1) {
    const nextValue = Math.floor(value)

    return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : fallback
}

function toNonNegativeInteger(value: number) {
    const nextValue = Math.floor(value)

    return Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 0
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (item) =>
        set((state) => {
            const maxStock = toNonNegativeInteger(item.maxStock)
            const quantity = toPositiveInteger(item.quantity)

            if (maxStock === 0) {
                return state
            }

            const safeItem = {
                ...item,
                maxStock,
                quantity: Math.min(quantity, maxStock),
            }

            const existing = state.items.find(
                i => i.shoeId === item.shoeId && i.size === item.size
            )


            if (existing) {
                return {
                    items: state.items.map(i =>
                        i.shoeId === item.shoeId && i.size === item.size
                            ? {
                                ...i,
                                image: safeItem.image,
                                price: safeItem.price,
                                maxStock: safeItem.maxStock,
                                quantity: Math.min(
                                    i.quantity + safeItem.quantity,
                                    safeItem.maxStock
                                ),
                            }
                            : i
                    )
                }
            }

            return { items: [...state.items, safeItem] }
        }),

    removeItem: (shoeId, size) =>
        set((state) => ({
            items: state.items.filter(
                i => !(i.shoeId === shoeId && i.size === size)
            )
        })),


    updateQuantity: (shoeId, size, quantity) =>
        set((state) => ({
            items: state.items.map(i =>
                i.shoeId === shoeId && i.size === size
                    ? {
                        ...i,
                        quantity: Math.min(toPositiveInteger(quantity), i.maxStock),
                    }
                    : i
            )
        })),


    clearCart: () => set({ items: [] }),

    getTotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}))
