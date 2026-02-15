"use client"

import { LogOut, Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Navbar() {

  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    router.push("/login")
  }

  return (

    <div className="fixed top-[10px] left-0 right-0 z-50 flex z-[9999] justify-center pointer-events-none">

      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
    pointer-events-auto

    backdrop-blur-md

    border border-white/10
    shadow-lg shadow-black/30

    rounded-2xl

    px-6 py-2.5

    flex items-center justify-between

    w-[min(92%,900px)]
  "
      >

        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-white">

          <span className="tracking-wide text-black">
            WEB STORE
          </span>

        </div>


        {/* Right side */}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2

            bg-white/10
            hover:bg-white/20

            border border-white/10
            hover:border-white/20

            px-4 py-1.5
            rounded-xl

            text-sm text-white

            transition-all duration-200

            hover:scale-105
            active:scale-95
            shadow-sm hover:shadow-md
          "
        >
          <LogOut size={16} className="text-black" />
          <h1 className="text-black">Logout</h1>
        </button>

      </motion.div>

    </div>

  )

}
