"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus
} from "lucide-react"

import { FcGoogle } from "react-icons/fc"
import { FaFacebookF } from "react-icons/fa"

export default function RegisterPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


  const handleRegister = async (e: React.FormEvent) => {

    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "ไม่สามารถสมัครสมาชิกได้")
        return
      }

      router.push("/login?registered=true")

    } catch {

      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")

    } finally {

      setLoading(false)

    }

  }


  return (

    <div className="  ">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full max-w-md
          backdrop-blur-xl
          bg-white/70
          border border-white/40
          shadow-2xl
          rounded-3xl
          p-8
        "
      >

        {/* TOP ICON */}
        <div className="flex justify-center mb-6">
          <div className="
            w-14 h-14
            bg-white
            rounded-2xl
            shadow-md
            flex items-center justify-center
          ">
            <UserPlus size={24} />
          </div>
        </div>


        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-1">
          สร้างบัญชีผู้ใช้งาน
        </h2>

        <p className="text-gray-500 text-center mb-6 text-sm">
          สมัครสมาชิกเพื่อเริ่มต้นใช้งาน
        </p>


        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}


        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">


          {/* EMAIL */}
          <div className="relative">

            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />

            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                peer w-full
                pl-10 pr-4 pt-5 pb-2
                rounded-xl
                bg-gray-100
                border border-transparent
                focus:border-gray-300
                focus:bg-white
                outline-none
                transition
              "
            />

            <label className="
              absolute left-10
              text-gray-500 text-sm
              top-3.5
              transition-all

              peer-placeholder-shown:top-3.5
              peer-placeholder-shown:text-sm

              peer-focus:-top-2
              peer-focus:text-xs
              peer-focus:bg-white
              peer-focus:px-1

              peer-not-placeholder-shown:-top-2
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:bg-white
              peer-not-placeholder-shown:px-1
            ">
              Email
            </label>

          </div>


          {/* PASSWORD */}
          <div className="relative">

            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                peer w-full
                pl-10 pr-10 pt-5 pb-2
                rounded-xl
                bg-gray-100
                border border-transparent
                focus:border-gray-300
                focus:bg-white
                outline-none
                transition
              "
            />

            <label className="
              absolute left-10
              text-gray-500 text-sm
              top-3.5
              transition-all

              peer-placeholder-shown:top-3.5
              peer-placeholder-shown:text-sm

              peer-focus:-top-2
              peer-focus:text-xs
              peer-focus:bg-white
              peer-focus:px-1

              peer-not-placeholder-shown:-top-2
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:bg-white
              peer-not-placeholder-shown:px-1
            ">
              Password
            </label>


            {/* SHOW PASSWORD */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400"
            >
              {showPassword
                ? <EyeOff size={18} />
                : <Eye size={18} />
              }
            </button>

          </div>


          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              py-3
              rounded-xl
              text-white
              font-medium
              bg-linear-to-b from-gray-800 to-black
              shadow-md
              hover:scale-[1.02]
              transition
              disabled:opacity-50
            "
          >
            {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
          </button>

        </form>



        {/* LOGIN LINK */}
        <p className="text-sm mt-6 text-center text-gray-500">
          มีบัญชีอยู่แล้ว?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-black font-semibold cursor-pointer hover:underline"
          >
            เข้าสู่ระบบ
          </span>
        </p>


      </motion.div>

    </div>
  )
}
