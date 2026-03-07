"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import { z } from "zod"
import FormInput from "../../component/ui/FormInput"
import { useAuthStore } from "@/lib/auth-store"


const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (loading) return

    setFormError("")
    setFieldErrors({})
    setLoading(true)

    const parsed = loginSchema.safeParse({ email, password })

    if (!parsed.success) {
      const errors: Record<string, string> = {}

      parsed.error.issues.forEach(issue => {
        const field = issue.path[0]
        if (typeof field === "string") {
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
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Invalid credentials")
        return
      }

      setUser(data.user)

      router.push(data.user.role === "ADMIN" ? "/admin" : "/")

    } catch {
      setFormError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    setFieldErrors(prev => ({ ...prev, email: undefined }))
    setFormError("")
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    setFieldErrors(prev => ({ ...prev, password: undefined }))
    setFormError("")
  }

  return (
    <div className="w-full">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >

        {/* Title */}
        <div className="mb-10">

          <h1 className="text-3xl font-medium tracking-tight">
            Welcome Back
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Sign in to access your sneaker archive.
          </p>

        </div>

        {/* Error */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              mb-6
              text-sm
              text-red-600
              bg-red-50
              border border-red-200
              rounded-xl
              px-4 py-3
            "
          >
            {formError}
          </motion.div>
        )}

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <FormInput
            type="email"
            label="Email"
            icon={<Mail size={18} />}
            value={email}
            onChange={handleEmailChange}
            error={fieldErrors.email}
            disabled={loading}
          />

          <FormInput
            type="password"
            label="Password"
            icon={<Lock size={18} />}
            value={password}
            onChange={handlePasswordChange}
            error={fieldErrors.password}
            disabled={loading}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              h-12
              rounded-xl
              bg-black
              text-white
              text-sm
              font-medium
              transition
              hover:bg-black/80
              disabled:opacity-50
              flex items-center justify-center
            "
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Register */}
        <div className="text-sm text-gray-500">

          Don’t have an account?{" "}

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="
              text-black
              font-medium
              hover:underline
            "
          >
            Create one
          </button>

        </div>

      </motion.div>

    </div>
  )
}