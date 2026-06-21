"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Boxes,
  LogOut,
  PackagePlus,
  ReceiptText,
} from "lucide-react"
import { useState } from "react"
import AppLogo from "@/app/component/ui/AppLogo"
import { Skeleton } from "@/app/component/ui/Skeleton"
import { adminButtonClass, cn } from "./admin-ui"

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "ออเดอร์", href: "/admin/orders", icon: ReceiptText },
    { name: "สินค้า", href: "/admin/shoes", icon: Boxes },
    { name: "เพิ่มสินค้า", href: "/admin/shoes/new", icon: PackagePlus },
  ]

  const activeHref = navItems.reduce<string | undefined>((current, item) => {
    const matches =
      item.href === "/admin"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)

    if (!matches) {
      return current
    }

    return !current || item.href.length > current.length ? item.href : current
  }, undefined)

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
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <AppLogo subLabel="Admin Panel" />
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = item.href === activeHref
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-semibold transition",
                  active
                    ? "border-black bg-[#d8ff6a] text-black shadow-sm"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Admin mode</p>
          <p className="mt-1 leading-6">
            จัดการร้าน สินค้า ออเดอร์ และ stock
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                KicksVault Admin
              </p>
              <p className="text-xs text-slate-500">
                เข้าสู่ระบบในฐานะ Admin
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const active = item.href === activeHref
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      active
                        ? "border-black bg-[#d8ff6a] text-black"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-black",
                    )}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(adminButtonClass.danger, "w-fit")}
            >
              {loggingOut ? (
                <Skeleton tone="light" className="h-4 w-24 bg-red-200" />
              ) : (
                <>
                  <LogOut size={16} aria-hidden="true" />
                  ออกจากระบบ
                </>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
