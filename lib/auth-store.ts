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

            if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้")

            const data: { user: User | null } = await res.json()

            set({
                user: data.user,
                isAuthenticated: !!data.user,
                isLoading: false,
            })
        } catch {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
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
