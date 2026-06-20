"use client"

import { useEffect, useId, useState } from "react"
import type { HTMLInputTypeAttribute, ReactNode } from "react"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface FormInputProps {
  type: HTMLInputTypeAttribute
  label: string
  icon?: ReactNode
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
  autoComplete?: string
}

export default function FormInput({
  type,
  label,
  icon,
  value,
  onChange,
  error,
  disabled,
  required = false,
  name,
  autoComplete,
}: FormInputProps) {
  const inputId = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>(error)

  const isPassword = type === "password"

  useEffect(() => {
    setLocalError(error)
  }, [error])

  const handleChange = (val: string) => {
    onChange(val)

    if (localError) {
      setLocalError(undefined)
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-black"
      >
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div
        className={`group relative rounded-lg border transition duration-200 ease-out ${
          localError
            ? "border-red-400 bg-red-50/80"
            : "border-black/10 bg-white hover:border-black/35 focus-within:border-black focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 focus-within:ring-offset-white"
        } ${disabled ? "opacity-70" : ""}`}
      >
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-black/45 transition group-focus-within:text-black">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          autoComplete={autoComplete}
          type={
            isPassword
              ? showPassword ? "text" : "password"
              : type
          }
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!localError}
          aria-describedby={localError ? `${inputId}-error` : undefined}
          className={`h-14 w-full rounded-lg bg-transparent py-3 text-sm text-black outline-none placeholder:text-black/35 disabled:cursor-not-allowed disabled:text-black/45 ${
            icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-12" : "pr-4"}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black/45 transition hover:bg-[#f8f7f3] hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:text-black/30"
          >
            {showPassword
              ? <EyeOff size={18} />
              : <Eye size={18} />
            }
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {localError && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600"
          >
            <AlertCircle size={13} />
            {localError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
