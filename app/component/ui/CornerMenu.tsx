"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, ShoppingBag, UserRound } from "lucide-react"
import MenuButton from "./Menubutton"
import FullscreenMenu from "./FullscreenMenu"
import { useAuthStore } from "@/lib/auth-store"

export default function CornerMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const storeActive = pathname?.startsWith("/product")
  const accountActive =
    pathname?.startsWith("/account") ||
    pathname === "/login" ||
    pathname === "/register"
  const accountHref = isAuthenticated ? "/account" : "/login"
  const accountLabel = isLoading
    ? "Account"
    : isAuthenticated
      ? "Profile"
      : "Sign in"
  const accountDetail = isLoading
    ? "Checking"
    : isAuthenticated
      ? user?.email ?? "Member"
      : "Member access"
  const accountInitial = user?.email?.[0]?.toUpperCase() ?? "K"
  const AccountIcon = isAuthenticated ? UserRound : LogIn

  return (
    <>
      <div className="fixed right-4 top-4 z-[10000] flex max-w-[calc(100vw-2rem)] items-center gap-1.5 rounded-full border border-black/10 bg-white/90 p-1.5 text-black shadow-[0_16px_48px_rgba(0,0,0,0.14)] backdrop-blur-xl md:right-6 md:top-6 md:gap-2">
        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/product"
            aria-current={storeActive ? "page" : undefined}
            className={`group inline-flex h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 ${
              storeActive
                ? "bg-black text-white"
                : "text-black hover:bg-black hover:text-white"
            }`}
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Store</span>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={accountHref}
            aria-current={accountActive ? "page" : undefined}
            className={`group inline-flex h-11 min-w-11 items-center gap-2 rounded-full px-1.5 pr-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white md:min-w-[176px] ${
              accountActive
                ? "bg-[#f4f3ef] text-black"
                : "text-black hover:bg-[#f4f3ef]"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isAuthenticated
                  ? "bg-black text-white"
                  : "bg-black/10 text-black"
              }`}
            >
              {isAuthenticated ? accountInitial : <AccountIcon size={15} />}
            </span>
            <span className="hidden min-w-0 flex-col leading-tight md:flex">
              <span className="font-medium">{accountLabel}</span>
              <span className="max-w-[118px] truncate text-xs text-black/60">
                {accountDetail}
              </span>
            </span>
          </Link>
        </motion.div>

        <MenuButton
          open={open}
          toggle={() => {
            setOpen((prev) => !prev)
          }}
        />
      </div>

      <AnimatePresence>
        {open && <FullscreenMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
