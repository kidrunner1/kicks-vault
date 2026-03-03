"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import FormInput from "../../component/ui/FormInput"
import { z } from "zod"

export default function LoginPage() {

  const router = useRouter()
  const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
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

    // Client validation
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

      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
      })

      const user = await meRes.json()

      router.push(user.role === "ADMIN" ? "/admin" : "/")

    } catch (err: any) {
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="max-w-md"
      >

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl tracking-tight mb-3">
            Welcome Back
          </h1>
          <p className="text-zinc-500">
            Sign in to continue your collection.
          </p>
        </div>

        {/* Error */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-600"
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
          />

          <FormInput
            type="password"
            label="Password"
            icon={<Lock size={18} />}
            value={password}
            onChange={handlePasswordChange}
            error={fieldErrors.password}
          />


          {/* Submit Button */}
          <button
            disabled={loading}
            className="
              w-full
              py-4
              border-b
              border-black
              text-black
              text-sm
              tracking-widest
              uppercase
              transition-all
              hover:tracking-[0.2em]
              disabled:opacity-50
            "
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-xs text-zinc-400 tracking-widest">
            OR
          </span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>

        {/* Register Link */}
        <div className="text-sm text-zinc-500">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-black tracking-wide hover:underline"
          >
            Create one
          </button>

        </div>

      </motion.div >
    </div >
  )
}
