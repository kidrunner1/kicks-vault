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

    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="
        fixed
        top-0
        left-0
        right-0
        z-[9999]

        bg-black
        border-b border-white/10

        shadow-lg shadow-black/40
      "
    >

      <div className="
        max-w-7xl
        mx-auto

        px-6
        h-14

        flex
        items-center
        justify-between

        text-white
      ">

        {/* Logo */}
        <div className="
          flex items-center gap-2
          font-semibold
          text-base
          tracking-wide
        ">

          <Rocket className="text-purple-500 w-5 h-5"/>

          WEB STORE

        </div>


        {/* Right side */}
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2

            bg-zinc-800
            hover:bg-zinc-700

            border border-zinc-700
            hover:border-zinc-600

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
