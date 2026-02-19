import { create } from "zustand"

export interface CartItem {
    shoeId: string
    name: string
    price: number
    image: string
    size: string
    quantity: number
}

interface CartState {
    items: CartItem[]
    addItem: (item: CartItem) => void
    clearCart: () => void
    removeItem: (shoeId: string, size: string) => void
    updateQuantity: (shoeId: string, size: string, quantity: number) => void

    getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (item) =>
        set((state) => {
            const existing = state.items.find(
                i => i.shoeId === item.shoeId && i.size === item.size
            )


            if (existing) {
                return {
                    items: state.items.map(i =>
                        i.shoeId === item.shoeId
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                }
            }

            return { items: [...state.items, item] }
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
                    ? { ...i, quantity }
                    : i
            )
        })),


    clearCart: () => set({ items: [] }),

    getTotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}))
