"use client"

import { useState } from "react"
import MegaMenu from "@/app/component/ui/MegaMenu"
import { Menu, X } from "lucide-react"

export default function Navbar() {

  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = ["Men", "Women", "Kids", "Sports", "Outlet"]

  return (
    <div className="relative bg-white border-b">

      {/* NAVBAR */}

      <header className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* LEFT */}

        <div className="flex items-center gap-4">

          {/* Hamburger */}

          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}

          <div className="font-semibold text-lg">
            KicksVault
          </div>

        </div>

        {/* Desktop Navigation */}

        <nav className="hidden lg:flex gap-10 text-sm absolute left-1/2 -translate-x-1/2">

          {navItems.map((item) => (
            <button
              key={item}
              onClick={() =>
                setActiveMenu(activeMenu === item ? null : item)
              }
              className="hover:text-black/70 transition"
            >
              {item}
            </button>
          ))}

        </nav>

      </header>

      {/* Desktop MegaMenu */}

      {activeMenu && (
        <div className="hidden lg:block">
          <MegaMenu category={activeMenu} />
        </div>
      )}

      {/* Mobile Menu */}

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">

          <div className="flex flex-col p-6 gap-4">

            {navItems.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setActiveMenu(activeMenu === item ? null : item)
                }
                className="text-left text-lg font-medium"
              >
                {item}
              </button>
            ))}

          </div>

          {/* Mobile MegaMenu */}

          {activeMenu && (
            <MegaMenu category={activeMenu} />
          )}

        </div>
      )}

    </div>
  )
}