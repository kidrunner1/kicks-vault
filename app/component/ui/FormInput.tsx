"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FormInputProps {
  type: string
  label: string
  icon?: React.ReactNode
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function FormInput({
  type,
  label,
  icon,
  value,
  onChange,
  error,
  disabled,
}: FormInputProps) {

  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>(error)

  const isPassword = type === "password"

  // sync error from parent
  useEffect(() => {
    setLocalError(error)
  }, [error])

  const handleChange = (val: string) => {
    onChange(val)

    // remove error when user types
    if (localError) {
      setLocalError(undefined)
    }
  }

  return (
    <div className="relative">

      {icon && (
        <div className="absolute left-3 top-3.5 text-gray-400">
          {icon}
        </div>
      )}

      <input
        type={
          isPassword
            ? showPassword ? "text" : "password"
            : type
        }
        placeholder=" "
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={!!localError}
        className={`
          peer w-full
          pl-10 pr-10 pt-5 pb-2
          rounded-xl
          bg-gray-100
          border
          ${localError
            ? "border-red-400 bg-red-50"
            : "border-transparent focus:border-gray-300 focus:bg-white"}
          outline-none
          transition
          text-gray-700
        `}
      />

      <label
        className="
          absolute left-10
          text-gray-500 text-sm
          top-3.5
          transition-all

          peer-focus:-top-2
          peer-focus:text-xs
          peer-focus:bg-white
          peer-focus:px-1

          peer-not-placeholder-shown:-top-2
          peer-not-placeholder-shown:text-xs
          peer-not-placeholder-shown:bg-white
          peer-not-placeholder-shown:px-1
        "
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="
            absolute right-3 top-3.5
            text-gray-400
            hover:text-gray-600
            transition-colors
          "
        >
          {showPassword
            ? <EyeOff size={18} />
            : <Eye size={18} />
          }
        </button>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {localError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="
              mt-2
              text-xs
              text-red-500
              tracking-wide
            "
          >
            {localError}
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  )
}