"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import AppLogo from "@/app/component/ui/AppLogo"

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Shoes", href: "/admin/shoes" },
    { name: "Add Shoe", href: "/admin/shoes/new" },
  ]

  async function handleLogout() {
    try {
      setLoggingOut(true)

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 hidden md:block">
        <div className="mb-10">
          <AppLogo inverse subLabel="Admin Panel" />
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-2 rounded-lg transition
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-8">
          <div className="text-sm text-gray-400">Admin Dashboard</div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Logged in as Admin</div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
