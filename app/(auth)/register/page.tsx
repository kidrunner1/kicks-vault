"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"
import FormInput from "../../component/ui/FormInput"

export default function RegisterPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok)
        throw new Error(data.error || "ไม่สามารถสมัครสมาชิกได้")

      router.push("/login?registered=true")

    } catch (err: any) {
      setError(err.message)
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
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-sm text-red-600"
          >
            {error}
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
          />

          <FormInput
            type="password"
            label="Password"
            icon={<Lock size={18} />}
            value={password}
            onChange={setPassword}
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
