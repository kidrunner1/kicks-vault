"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, ShoppingBag, UserRound } from "lucide-react"
import MenuButton from "./Menubutton"
import FullscreenMenu from "./FullscreenMenu"
import { useAuthStore } from "@/lib/auth-store"
import { filterActionClass } from "@/lib/ui-interactions"

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
            className={filterActionClass({
              active: Boolean(storeActive),
              className: "group h-11 justify-center px-3 font-medium sm:px-4",
              shape: "rounded-full",
            })}
          >
            <ShoppingBag size={17} className="transition" />
            {storeActive && (
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-black"
              />
            )}
            <span className="hidden transition sm:inline">Store</span>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={accountHref}
            aria-current={accountActive ? "page" : undefined}
            className={filterActionClass({
              active: accountActive,
              className: "group h-11 min-w-11 px-1.5 pr-3 md:min-w-[176px]",
              shape: "rounded-full",
            })}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
                isAuthenticated
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black"
              }`}
            >
              {isAuthenticated ? accountInitial : <AccountIcon size={15} />}
            </span>
            <span className="hidden min-w-0 flex-col leading-tight md:flex">
              <span className="font-medium text-black transition">
                {accountLabel}
              </span>
              <span className="max-w-[118px] truncate text-xs text-black/65 transition">
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
