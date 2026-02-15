"use client"

import { LogOut } from "lucide-react"
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

    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="
        fixed
        top-5
        left-0
        right-0
        z-[9999]

        flex
        justify-center
        px-4
      "
    >

      <div
        className="
          w-full
          max-w-5xl

          bg-gray-900/50
          backdrop-blur-xl
          backdrop-saturate-150

          border border-white/10

          rounded-2xl

          shadow-lg shadow-black/30

          px-6
          h-14

          flex
          items-center
          justify-between

          text-white
        "
      >

        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <span className="text-lg">👟</span>
          KicksVault
        </div>


        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2

            bg-white/5
            hover:bg-white/10

            border border-white/10
            hover:border-white/20

            px-4 py-1.5
            rounded-lg

            text-sm

            transition-all duration-200

            hover:scale-105
            active:scale-95
          "
        >
          <LogOut size={16}/>
          Logout
        </button>

      </div>

    </motion.nav>

  )

}
