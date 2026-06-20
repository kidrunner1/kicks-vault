"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { uiAction } from "@/lib/ui-interactions"

const navItems = [
  { name: "ภาพรวม", href: "/account" },
  { name: "ออเดอร์", href: "/account/orders" },
  { name: "ที่อยู่", href: "/account/addresses" },
  { name: "รายการโปรด", href: "/account/favorites" },
]

function isActiveAccountPath(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/account") return pathname === href

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = isActiveAccountPath(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`px-4 py-3 text-sm ${
              isActive ? uiAction.navActive : uiAction.navItem
            }`}
          >
            {item.name}

            {isActive && (
              <span className="h-2 w-2 rounded-full bg-black" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
