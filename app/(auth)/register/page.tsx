"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { AlertCircle, ArrowRight, Lock, Mail, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import FormInput from "../../component/ui/FormInput"
import { uiAction } from "@/lib/ui-interactions"
import { Skeleton } from "@/app/component/ui/Skeleton"

const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "กรุณากรอก Email")
      .email("กรุณากรอก Email ให้ถูกต้อง"),
    password: z
      .string()
      .min(1, "กรุณากรอกรหัสผ่าน")
      .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  })

type RegisterFieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (loading) return

    setFormError("")
    setFieldErrors({})
    setLoading(true)

    const parsed = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
    })

    if (!parsed.success) {
      const errors: RegisterFieldErrors = {}

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]

        if (
          field === "email" ||
          field === "password" ||
          field === "confirmPassword"
        ) {
          errors[field] = issue.message
        }
      })

      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "ไม่สามารถสร้างบัญชีนี้ได้")
        return
      }

      toast.success("สร้างบัญชีสำเร็จ")
      router.replace("/login")
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

  const handleConfirmChange = (val: string) => {
    setConfirmPassword(val)
    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
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
          <UserPlus size={20} />
        </div>

        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          สร้าง vault ของคุณ
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/65">
          บันทึกที่อยู่ เก็บรายการโปรด และเตรียม Checkout ให้พร้อมสำหรับทุก drop
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

      <form onSubmit={handleRegister} className="space-y-5">
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
          name="new-password"
          label="รหัสผ่าน"
          icon={<Lock size={18} />}
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          disabled={loading}
          required
          autoComplete="new-password"
        />

        <FormInput
          type="password"
          name="confirm-password"
          label="ยืนยันรหัสผ่าน"
          icon={<Lock size={18} />}
          value={confirmPassword}
          onChange={handleConfirmChange}
          error={fieldErrors.confirmPassword}
          disabled={loading}
          required
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className={`h-12 w-full px-5 text-sm font-semibold ${uiAction.accent}`}
        >
          <UserPlus size={16} />
          {loading && <Skeleton tone="light" className="h-4 w-28 bg-white/45" />}
          <span className={loading ? "sr-only" : ""}>
          {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </span>
        </button>
      </form>

      <div className="mt-7 border-t border-black/10 pt-5">
        <p className="mb-3 text-sm text-black/60">
          มีบัญชีอยู่แล้ว?
        </p>
        <Link
          href="/login"
          className={`h-11 w-full px-4 text-sm font-medium ${uiAction.surface}`}
        >
          เข้าสู่ระบบ
          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  )
}
