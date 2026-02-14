"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    router.push("/login")
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Floating Animated Background */}
      <motion.div
        className="absolute w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-30"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-30"
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 120, -120, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: show ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold mb-6"
        >
          Welcome Back 👋
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 mb-8"
        >
          Your authentication system is now fully secure.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-white text-black px-6 py-3 rounded-full font-medium"
        >
          Logout
        </motion.button>
      </motion.div>
    </div>
  )
}
