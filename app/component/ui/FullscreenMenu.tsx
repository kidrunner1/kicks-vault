"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Heart,
  Home,
  LogIn,
  LogOut,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"

interface Props {
  onClose: () => void
}

type MenuItem = {
  name: string
  href: string
  description: string
  icon: LucideIcon
  emphasis?: "primary"
}

const images = [
  "/images/shoes/nike-01.jpg",
  "/images/shoes/nike-02.jpg",
  "/images/shoes/nike-03.jpg",
  "/images/shoes/nike-04.jpg",
]

const guestMenu: MenuItem[] = [
  {
    name: "Home",
    href: "/",
    description: "Return to the KicksVault entrance.",
    icon: Home,
  },
  {
    name: "Shop",
    href: "/product",
    description: "Browse drops, sizes, prices, and live stock.",
    icon: ShoppingBag,
  },
  {
    name: "Login",
    href: "/login",
    description: "Access saved addresses and order history.",
    icon: LogIn,
    emphasis: "primary",
  },
  {
    name: "Register",
    href: "/register",
    description: "Create a member account for checkout.",
    icon: UserPlus,
  },
]

const userMenu: MenuItem[] = [
  {
    name: "Home",
    href: "/",
    description: "Return to the KicksVault entrance.",
    icon: Home,
  },
  {
    name: "Shop",
    href: "/product",
    description: "Browse drops, sizes, prices, and live stock.",
    icon: ShoppingBag,
  },
  {
    name: "Profile",
    href: "/account",
    description: "Review your member space and saved details.",
    icon: UserRound,
    emphasis: "primary",
  },
]

const accountLinks = [
  {
    label: "Orders",
    href: "/account/orders",
    icon: PackageCheck,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Favorites",
    href: "/account/favorites",
    icon: Heart,
  },
]

export default function FullscreenMenu({ onClose }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const logout = useAuthStore((state) => state.logout)

  const [imageShift, setImageShift] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const menuItems = isLoading
    ? guestMenu.slice(0, 2)
    : isAuthenticated
      ? userMenu
      : guestMenu
  const accountInitial = user?.email?.[0]?.toUpperCase() ?? "K"

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await logout()
    } catch {
      setIsLoggingOut(false)
      return
    }

    router.refresh()
    onClose()
    router.push("/")
  }

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{
        duration: 0.78,
        ease: [0.76, 0, 0.24, 1],
      }}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[#f4f3ef] text-black"
    >
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)]">
        <div
          className="relative hidden min-h-screen overflow-hidden bg-black p-8 text-white lg:block"
          onMouseEnter={() => setImageShift(true)}
          onMouseLeave={() => setImageShift(false)}
        >
          <div className="grid h-[calc(100vh-4rem)] grid-cols-2 grid-rows-2 gap-4">
            {images.map((img, index) => (
              <motion.div
                key={img}
                animate={{
                  y: imageShift ? (index % 2 === 0 ? -14 : 14) : 0,
                  x: imageShift ? (index < 2 ? -8 : 8) : 0,
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.65, 0, 0.35, 1],
                }}
                className="relative overflow-hidden rounded-lg"
              >
                <Image
                  src={img}
                  alt="Curated sneaker product"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 28vw, 1px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-x-8 bottom-8 rounded-lg border border-white/15 bg-black/70 p-6 backdrop-blur-md">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
              <Sparkles size={18} />
            </div>
            <p className="text-3xl font-semibold leading-tight">
              Curated drops, clearer paths.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
              Move between shopping, checkout, and your archive without losing the premium storefront feel.
            </p>
          </div>
        </div>

        <div className="flex min-h-screen flex-col px-5 pb-8 pt-24 md:px-10 lg:px-12 lg:pb-12">
          <div className="mb-8 max-w-xl">
            <p className="text-sm font-medium text-black/60">
              Navigation
            </p>
            <h2 className="mt-2 text-4xl font-semibold leading-tight md:text-5xl">
              KicksVault
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/65">
              Go straight to the store, manage your member archive, or sign in before checkout.
            </p>
          </div>

          <nav className="grid gap-3" aria-label="Primary navigation">
            {menuItems.map((item, index) => (
              <MenuLink
                key={item.href}
                item={item}
                index={index}
                active={isActivePath(pathname, item.href)}
                onClose={onClose}
              />
            ))}
          </nav>

          <div className="mt-6 rounded-lg border border-black/10 bg-white p-4 md:p-5">
            {isLoading ? (
              <div className="flex items-center gap-3 text-sm text-black/60">
                <span className="h-10 w-10 rounded-full bg-[#f4f3ef]" />
                Checking account status...
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                    {accountInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.email ?? "Member"}
                    </p>
                    <p className="text-xs text-black/55">
                      {user?.role ?? "USER"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {accountLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActivePath(pathname, link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium transition ${
                          active
                            ? "border-black bg-black text-white"
                            : "border-black/10 text-black/70 hover:border-black hover:bg-black hover:text-white"
                        }`}
                      >
                        <Icon size={15} />
                        {link.label}
                      </Link>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-black/45"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Guest mode</p>
                  <p className="mt-1 text-sm text-black/60">
                    Sign in to use saved addresses, favorites, and order history.
                  </p>
                </div>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  <LogIn size={16} />
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MenuLink({
  item,
  index,
  active,
  onClose,
}: {
  item: MenuItem
  index: number
  active: boolean
  onClose: () => void
}) {
  const Icon = item.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.36 }}
    >
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`group grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-lg border p-4 transition md:p-5 ${
          active
            ? "border-black bg-black"
            : item.emphasis === "primary"
              ? "border-black bg-white hover:bg-black"
              : "border-black/10 bg-white hover:border-black hover:bg-black"
        }`}
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            active
              ? "bg-white text-black"
            : item.emphasis === "primary"
                ? "bg-black text-white group-hover:bg-white group-hover:text-black"
                : "bg-[#f4f3ef] text-black group-hover:bg-white group-hover:text-black"
          }`}
        >
          <Icon size={18} />
        </span>

        <span className="min-w-0">
          <span
            className={`block text-2xl font-semibold leading-tight transition md:text-3xl ${
              active ? "text-white" : "text-black group-hover:text-white"
            }`}
          >
            {item.name}
          </span>
          <span
            className={`mt-1 block text-sm leading-6 transition ${
              active
                ? "text-white/70"
                : "text-black/60 group-hover:text-white/70"
            }`}
          >
            {item.description}
          </span>
        </span>

        <ArrowUpRight
          size={18}
          className={
            active
              ? "text-white"
              : "text-black/45 transition group-hover:text-white"
          }
        />
      </Link>
    </motion.div>
  )
}

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
