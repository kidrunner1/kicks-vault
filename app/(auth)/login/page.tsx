"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { AlertCircle, ArrowRight, Lock, LogIn, Mail } from "lucide-react"
import { z } from "zod"
import FormInput from "../../component/ui/FormInput"
import { useAuthStore } from "@/lib/auth-store"
import { uiAction } from "@/lib/ui-interactions"

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "กรุณากรอก Email")
    .email("กรุณากรอก Email ให้ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
})

type LoginFieldErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const prefersReducedMotion = useReducedMotion()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (loading) return

    setFormError("")
    setFieldErrors({})
    setLoading(true)

    const parsed = loginSchema.safeParse({ email, password })

    if (!parsed.success) {
      const errors: LoginFieldErrors = {}

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]

        if (field === "email" || field === "password") {
          errors[field] = issue.message
        }
      })

      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Email หรือรหัสผ่านไม่ถูกต้อง")
        return
      }

      setUser(data.user)
      router.push(data.user.role === "ADMIN" ? "/admin" : "/")
    } catch {
      setFormError("ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    setFieldErrors((prev) => ({ ...prev, email: undefined }))
    setFormError("")
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    setFieldErrors((prev) => ({ ...prev, password: undefined }))
    setFormError("")
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black bg-[#d8ff6a] text-black shadow-sm">
          <LogIn size={20} />
        </div>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          ยินดีต้อนรับกลับ
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/65">
          เข้าสู่ระบบเพื่อใช้ที่อยู่ที่บันทึกไว้ รายการโปรด และประวัติออเดอร์
        </p>
      </div>

      {formError && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          {formError}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <FormInput
          type="email"
          name="email"
          label="Email"
          icon={<Mail size={18} />}
          value={email}
          onChange={handleEmailChange}
          error={fieldErrors.email}
          disabled={loading}
          required
          autoComplete="email"
        />

        <FormInput
          type="password"
          name="password"
          label="รหัสผ่าน"
          icon={<Lock size={18} />}
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          disabled={loading}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className={`h-12 w-full px-5 text-sm font-semibold ${uiAction.accent}`}
        >
          <LogIn size={16} />
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <div className="mt-7 border-t border-black/10 pt-5">
        <p className="mb-3 text-sm text-black/60">
          ยังไม่มีบัญชี Kicks Vault?
        </p>
        <Link
          href="/register"
          className={`h-11 w-full px-4 text-sm font-medium ${uiAction.surface}`}
        >
          สร้างบัญชี
          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  )
}
