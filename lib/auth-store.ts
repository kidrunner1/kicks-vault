import { create } from "zustand"

interface User {
    id: string
    email: string
    role: "USER" | "ADMIN"
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean

    setUser: (user: User | null) => void
    fetchUser: () => Promise<void>
    logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
        }),

    fetchUser: async () => {
        try {
            const res = await fetch("/api/auth/me", {
                credentials: "include",
            })

            if (!res.ok) throw new Error()

            const data = await res.json()

            set({
                user: data.user,
                isAuthenticated: true,
            })
        } catch {
            set({
                user: null,
                isAuthenticated: false,
            })
        }
    },

    logout: async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })

        set({
            user: null,
            isAuthenticated: false,
        })
    },
}))