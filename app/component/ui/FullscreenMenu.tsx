"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
    onClose: () => void
}

const images = [
    "/images/shoes/nike-01.jpg",
    "/images/shoes/nike-02.jpg",
    "/images/shoes/nike-03.jpg",
    "/images/shoes/nike-04.jpg",
]

const menuItems = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/product" },
    // { name: "ACCOUNT", href: "/profile" },
]

export default function FullscreenMenu({ onClose }: Props) {
    const router = useRouter()
    const [imageShift, setImageShift] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        if (isLoggingOut) return

        setIsLoggingOut(true)

        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })

        onClose()
        router.push("/login")
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
            className="fixed inset-0 z-[9999] overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300" />

            <div className="relative z-10 grid lg:grid-cols-2 h-full">
                {/* =========================
            LEFT — IMAGE GRID
        ========================== */}
                <div
                    className="hidden lg:grid grid-cols-2 grid-rows-2 gap-6 p-16"
                    onMouseEnter={() => setImageShift(true)}
                    onMouseLeave={() => setImageShift(false)}
                >
                    {images.map((img, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: imageShift ? (i % 2 === 0 ? -15 : 15) : 0,
                                x: imageShift ? (i < 2 ? -10 : 10) : 0,
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.65, 0, 0.35, 1],
                            }}
                            className="relative overflow-hidden rounded-2xl shadow-xl"
                        >
                            <img
                                src={img}
                                alt="Menu Sneaker"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ))}
                </div>

                {/* =========================
            RIGHT — MENU
        ========================== */}
                <div className="flex flex-col justify-center items-end pr-24 space-y-16">

                    {/* Navigation Items */}
                    {menuItems.map((item) => {
                        const letters = item.name.split("")

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                            >
                                <AnimatedMenuText letters={letters} />
                            </Link>
                        )
                    })}

                    {/* Logout Button */}
                    <div
                        onClick={handleLogout}
                        className={`cursor-pointer ${isLoggingOut ? "opacity-50 pointer-events-none" : ""
                            }`}
                    >
                        <AnimatedMenuText letters={"LOGOUT".split("")} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/* ===================================
   Animated Text Component (Reusable)
=================================== */

interface AnimatedMenuTextProps {
    letters: string[]
}

function AnimatedMenuText({ letters }: AnimatedMenuTextProps) {
    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="
        flex
        text-7xl
        font-semibold
        tracking-tight
        overflow-hidden
      "
        >
            {letters.map((char, i) => (
                <div key={i} className="relative overflow-hidden h-20">

                    {/* Default Layer */}
                    <motion.span
                        variants={{
                            rest: { y: 0 },
                            hover: { y: -80 },
                        }}
                        transition={{
                            duration: 0.45,
                            delay: i * 0.04,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="block text-neutral-700"
                    >
                        {char}
                    </motion.span>

                    {/* Hover Layer */}
                    <motion.span
                        variants={{
                            rest: { y: 80 },
                            hover: { y: 0 },
                        }}
                        transition={{
                            duration: 0.45,
                            delay: i * 0.04,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="absolute left-0 top-0 text-black"
                    >
                        {char}
                    </motion.span>

                </div>
            ))}
        </motion.div>
    )
}
