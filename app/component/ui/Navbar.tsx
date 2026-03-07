"use client"

import { useState } from "react"
import MegaMenu from "@/app/component/ui/MegaMenu"

export default function Navbar() {

  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const navItems = ["Men", "Women", "Kids", "Sports", "Outlet"]

  return (
    <div
      className="relative bg-white border-b"
      onMouseLeave={() => setActiveMenu(null)}
    >

      {/* NAVBAR */}

      <header className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}

        <div className="font-semibold text-lg">
          KicksVault
        </div>

        {/* Navigation */}

        <nav className="flex gap-8 text-sm">

          {navItems.map((item) => (
            <button
              key={item}
              onMouseEnter={() => setActiveMenu(item)}
              className="hover:text-black/70"
            >
              {item}
            </button>
          ))}

        </nav>

        {/* Search */}

        <input
          placeholder="Search sneakers"
          className="border rounded-full px-4 py-1 text-sm"
        />

      </header>

      {/* MegaMenu */}

      {activeMenu && (
        <div
          onMouseEnter={() => setActiveMenu(activeMenu)}
        >
          <MegaMenu category={activeMenu} />
        </div>
      )}

    </div>
  )
}