"use client"

import { LogOut, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
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
          relative w-full max-w-6xl
          rounded-2xl
          px-6
          h-16
          flex
          items-center
          justify-between
          bg-linear-to-b
          from-white/10
          to-white/5
          backdrop-blur-xl
          backdrop-saturate-150
          border border-white/10
          shadow
          shadow-black/40
          text-white
        "
      >

        {/* subtle glow border */}
        <div className="
          absolute inset-0
          rounded-2xl
          pointer-events-none
          border border-white/5
        "/>

        {/* LEFT: LOGO */}
        <div
          onClick={() => router.push("/")}
          className="
            flex items-center gap-3

            cursor-pointer
            select-none

            group
          "
        >

          {/* logo icon */}
          <div className="
            w-9 h-9
            rounded-xl
            bg-linear-to-br
            from-white/20
            to-white/5
            flex items-center justify-center
            border border-white/10
            group-hover:scale-110
            transition
          ">
            👟
          </div>

          {/* logo text */}
          <div className="flex flex-col leading-none">

            <span className="
              font-semibold
              tracking-wide
              text-sm
              text-white/90
            ">
              KicksVault
            </span>
            <span className="
              text-[10px]
              text-white/40
              tracking-widest
            ">
              PREMIUM SNEAKERS
            </span>

          </div>

        </div>

        {/* CENTER: NAV LINKS */}
        <div className="
          hidden md:flex
          items-center
          gap-6
        ">

        </div>

        {/* RIGHT: USER + LOGOUT */}
        <div className="
          flex items-center gap-3
        ">

          {/* user avatar */}
          <div className="
            flex items-center gap-2
            px-3 py-1.5
            bg-white/5
            border border-white/10
            rounded-lg
            text-sm
            text-white/80
          ">
            <User size={15} />

          </div>

          {/* logout button */}
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-2
              px-4 py-1.5
              rounded-lg
              bg-linear-to-b
              from-white/10
              to-white/5
              border border-white/10
              hover:border-white/20
              hover:bg-white/10
              text-sm
              transition
              hover:scale-105
              active:scale-95
            "
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>

    </motion.nav>

  )

}
