"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const pathname = usePathname()
  const router = useRouter()

  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
    },
    {
      name: "Shoes",
      href: "/admin/shoes",
    },
    {
      name: "Add Shoe",
      href: "/admin/shoes/new",
    },
  ]


  // ⭐ LOGOUT FUNCTION
  async function handleLogout() {

    try {

      setLoggingOut(true)

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })

      // redirect to login
      router.push("/login")

      // optional: force refresh
      router.refresh()

    } catch (err) {

      console.error("Logout failed:", err)

    } finally {

      setLoggingOut(false)

    }

  }


  return (

    <div className="min-h-screen bg-gray-950 text-gray-100 flex">

      {/* SIDEBAR */}
      <aside className="
        w-64
        bg-gray-900
        border-r border-gray-800
        p-6
        hidden md:block
      ">

        {/* Logo */}
        <div className="mb-10">

          <h1 className="
            text-xl
            font-semibold
            tracking-wide
          ">
            KicksVault
          </h1>

          <p className="text-sm text-gray-400">
            Admin Panel
          </p>

        </div>

        {/* Navigation */}
        <nav className="space-y-2">

          {navItems.map((item) => {

            const active = pathname === item.href

            return (

              <Link
                key={item.href}
                href={item.href}
                className={`
                  block
                  px-4 py-2
                  rounded-lg
                  transition

                  ${active
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


      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="
          h-16
          border-b border-gray-800
          bg-gray-900
          flex
          items-center
          justify-between
          px-8
        ">

          <div className="text-sm text-gray-400">
            Admin Dashboard
          </div>


          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            <div className="text-sm text-gray-400">
              Logged in as Admin
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                px-4 py-2
                text-sm
                bg-red-600
                hover:bg-red-700
                rounded-lg
                transition
                disabled:opacity-50
              "
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>

          </div>

        </header>


        {/* CONTENT */}
        <main className="
          flex-1
          p-8
        ">

          {children}

        </main>

      </div>

    </div>

  )

}
