"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import { z } from "zod"
import FormInput from "../../component/ui/FormInput"
import { toast } from "sonner"

export default function RegisterPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [loading, setLoading] = useState(false)

  const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  const handleRegister = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Unable to register")
        return
      }

      // 🎉 Success Toast
      toast.success("Account created successfully")

      // Smooth redirect
      setTimeout(() => {
        router.push("/login")
      }, 1000)

    } catch {
      setFormError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
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
            Create Account
          </h1>
          <p className="text-zinc-500">
            Join the curated archive of modern sneaker culture.
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
      text-red-500
      border border-red-500/20
      bg-red-500/5
      px-4 py-3
      rounded-lg
    "
          >
            {formError}
          </motion.div>
        )}

        {/* Form */}
        <form
          onSubmit={handleRegister}
          className="space-y-6"
        >

          <FormInput
            type="email"
            label="Email"
            icon={<Mail size={18} />}
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
          />

          <FormInput
            type="password"
            label="Password"
            icon={<Lock size={18} />}
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
          />

          <FormInput
            type="password"
            label="Confirm Password"
            icon={<Lock size={18} />}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={fieldErrors.confirmPassword}
          />

          {/* Submit */}
          <button
            type="submit"
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
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <div className="mt-10 text-sm text-zinc-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-black tracking-wide hover:underline"
          >
            Sign In
          </button>
        </div>

      </motion.div>

    </div>
  )
}
