"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
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
import AppLogo from "./AppLogo"
import { useAuthStore } from "@/lib/auth-store"
import { uiAction } from "@/lib/ui-interactions"
import { Skeleton } from "./Skeleton"

interface Props {
  onClose: () => void
}

type MenuItem = {
  name: string
  href: string
  description: string
  icon: LucideIcon
}

function menuCardClass(active: boolean) {
  if (active) {
    return "border-black bg-[#d8ff6a] shadow-sm hover:bg-[#e4ff84]"
  }

  return "border-black/10 bg-white hover:border-black/35 hover:bg-[#f8f7f3] hover:shadow-sm"
}

function menuIconClass(active: boolean) {
  if (active) {
    return "border-black bg-white text-black"
  }

  return "border-black/10 bg-[#f8f7f3] text-black/70 group-hover:border-black/25 group-hover:bg-white group-hover:text-black"
}

const images = [
  "/images/shoes/nike-01.jpg",
  "/images/shoes/nike-02.jpg",
  "/images/shoes/nike-03.jpg",
  "/images/shoes/nike-04.jpg",
]

const guestMenu: MenuItem[] = [
  {
    name: "หน้าแรก",
    href: "/",
    description: "กลับสู่หน้าแรกของ Kicks Vault",
    icon: Home,
  },
  {
    name: "Store",
    href: "/product",
    description: "เลือกดู drop, ไซซ์, ราคา และ Stock ล่าสุด",
    icon: ShoppingBag,
  },
  {
    name: "เข้าสู่ระบบ",
    href: "/login",
    description: "เข้าถึงที่อยู่ที่บันทึกไว้และประวัติออเดอร์",
    icon: LogIn,
  },
  {
    name: "สมัครสมาชิก",
    href: "/register",
    description: "สร้างบัญชีสมาชิกเพื่อ Checkout ได้ครบ",
    icon: UserPlus,
  },
]

const userMenu: MenuItem[] = [
  {
    name: "หน้าแรก",
    href: "/",
    description: "กลับสู่หน้าแรกของ Kicks Vault",
    icon: Home,
  },
  {
    name: "Store",
    href: "/product",
    description: "เลือกดู drop, ไซซ์, ราคา และ Stock ล่าสุด",
    icon: ShoppingBag,
  },
  {
    name: "โปรไฟล์",
    href: "/account",
    description: "ดูพื้นที่สมาชิกและข้อมูลที่บันทึกไว้",
    icon: UserRound,
  },
]

const accountLinks = [
  {
    label: "ออเดอร์",
    href: "/account/orders",
    icon: PackageCheck,
  },
  {
    label: "ที่อยู่",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "รายการโปรด",
    href: "/account/favorites",
    icon: Heart,
  },
]

export default function FullscreenMenu({ onClose }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

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
  const canUseMotion = !prefersReducedMotion

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
      initial={prefersReducedMotion ? false : { y: "-100%" }}
      animate={{ y: 0 }}
      exit={prefersReducedMotion ? undefined : { y: "-100%" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.58,
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
                  y:
                    imageShift && canUseMotion
                      ? index % 2 === 0
                        ? -14
                        : 14
                      : 0,
                  x:
                    imageShift && canUseMotion
                      ? index < 2
                        ? -8
                        : 8
                      : 0,
                }}
                transition={{
                  duration: canUseMotion ? 0.7 : 0,
                  ease: [0.65, 0, 0.35, 1],
                }}
                className="relative overflow-hidden rounded-lg"
              >
                <Image
                  src={img}
                  alt="สินค้า sneaker ที่คัดไว้"
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
              Drop ที่คัดมา พร้อมเส้นทางที่ชัดขึ้น
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
              สลับระหว่างการเลือกซื้อ Checkout และ archive ส่วนตัว โดยยังคงความรู้สึกของร้านระดับพรีเมียม
            </p>
          </div>
        </div>

        <div className="flex min-h-screen flex-col px-5 pb-8 pt-24 md:px-10 lg:px-12 lg:pb-12">
          <div className="mb-8 max-w-xl">
            <AppLogo subLabel="เมนูนำทาง" />
            <p className="mt-4 text-sm leading-7 text-black/65">
              ไปที่ Store จัดการข้อมูลสมาชิก หรือเข้าสู่ระบบก่อน Checkout ได้จากที่นี่
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
              <div className="flex items-center gap-3" aria-busy="true" aria-label="กำลังตรวจสอบสถานะบัญชี">
                <Skeleton tone="soft" className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton tone="soft" className="h-4 w-44" />
                  <Skeleton tone="soft" className="h-3 w-32" />
                </div>
                <span className="sr-only">
                กำลังตรวจสอบสถานะบัญชี...
                </span>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#f8f7f3] text-sm font-semibold text-black shadow-sm">
                    {accountInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.email ?? "สมาชิก"}
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
                        className={`h-11 px-3 text-sm font-medium ${
                          active ? uiAction.accent : uiAction.surface
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
                  className={`h-11 w-full px-4 text-sm font-medium ${uiAction.danger}`}
                >
                  <LogOut size={16} />
                  {isLoggingOut && <Skeleton tone="light" className="h-4 w-28 bg-white/45" />}
                  <span className={isLoggingOut ? "sr-only" : ""}>
                  {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">โหมดผู้เยี่ยมชม</p>
                  <p className="mt-1 text-sm text-black/60">
                    เข้าสู่ระบบเพื่อใช้ที่อยู่ รายการโปรด และประวัติออเดอร์
                  </p>
                </div>
                <Link
                  href="/login"
                  onClick={onClose}
                  className={`h-11 px-5 text-sm font-semibold ${uiAction.accent}`}
                >
                  <LogIn size={16} />
                  เข้าสู่ระบบ
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
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.08 + index * 0.05,
        duration: prefersReducedMotion ? 0 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={item.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={`group grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-lg border p-4 transition-colors duration-200 ease-out md:p-5 ${menuCardClass(
          active
        )}`}
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 ease-out ${menuIconClass(
            active
          )}`}
        >
          <Icon size={18} />
        </span>

        <span className="min-w-0">
          <span className="block text-2xl font-semibold leading-tight text-black transition md:text-3xl">
            {item.name}
          </span>
          <span
            className={`mt-1 block text-sm leading-6 transition ${
              active
                ? "text-black/70"
                : "text-black/60"
            }`}
          >
            {item.description}
          </span>
        </span>

        <ArrowUpRight
          size={18}
          className={
            active
              ? "text-black"
              : "text-black/45 transition duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black/70"
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
