"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import AnimatedMenuText from "./AnimatedMenuText"
import { useAuthStore } from "@/lib/auth-store"

interface Props {
  onClose: () => void
}

const images = [
  "/images/shoes/nike-01.jpg",
  "/images/shoes/nike-02.jpg",
  "/images/shoes/nike-03.jpg",
  "/images/shoes/nike-04.jpg",
]

const guestMenu = [
  { name: "HOME", href: "/" },
  { name: "SHOP", href: "/product" },
  { name: "LOGIN", href: "/login" },
  { name: "REGISTER", href: "/register" },
]

const userMenu = [
  { name: "HOME", href: "/" },
  { name: "SHOP", href: "/product" },
  { name: "PROFILE", href: "/account" },
]

export default function FullscreenMenu({ onClose }: Props) {
  const router = useRouter()


  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const [imageShift, setImageShift] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const menuItems = isAuthenticated ? userMenu : guestMenu
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    await logout()

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
        duration: 0.9,
        ease: [0.76, 0, 0.24, 1],
      }}
      className="fixed inset-0 z-9999 bg-neutral-100"
    >
      <div className="grid lg:grid-cols-2 h-full">

        {/* LEFT IMAGE GRID */}

        <div
          className="hidden lg:grid grid-cols-2 grid-rows-2 gap-6 p-20 h-[80vh] self-center"
          onMouseEnter={() => setImageShift(true)}
          onMouseLeave={() => setImageShift(false)}
        >
          {images.map((img, i) => (
            <motion.div
              key={i}
              animate={{
                y: imageShift ? (i % 2 === 0 ? -18 : 18) : 0,
                x: imageShift ? (i < 2 ? -10 : 10) : 0,
              }}
              transition={{
                duration: 0.8,
                ease: [0.65, 0, 0.35, 1],
              }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt="Sneaker"
              />
            </motion.div>
          ))}
        </div>

        {/* RIGHT MENU */}

        <div className="flex flex-col justify-center items-center gap-14">

          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} onClick={onClose}>
              <AnimatedMenuText letters={item.name.split("")} />
            </Link>
          ))}

          {isAuthenticated && (
            <div
              onClick={handleLogout}
              className={`cursor-pointer ${isLoggingOut ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <AnimatedMenuText letters={"LOGOUT".split("")} />
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}