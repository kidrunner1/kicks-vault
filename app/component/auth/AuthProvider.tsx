"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const setUser = useAuthStore((state) => state.setUser)

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                    cache: "no-store",
                })

                if (!res.ok) {
                    setUser(null)
                    return
                }

                const data = await res.json()

                setUser(data.user)
            } catch {
                setUser(null)
            }
        }

        loadUser()
    }, [setUser])

    return <>{children}</>
}