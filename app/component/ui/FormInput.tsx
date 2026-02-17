"use client"

import { ReactNode, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface FormInputProps {
  type?: "text" | "email" | "password"
  label: string
  icon?: ReactNode
  value: string
  onChange: (value: string) => void
}

export default function FormInput({
  type = "text",
  label,
  icon,
  value,
  onChange,
}: FormInputProps) {

  const [showPassword, setShowPassword] =
    useState(false)

  const isPassword = type === "password"

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
        onChange={(e) =>
          onChange(e.target.value)
        }
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
          text-gray-700
        "
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
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="
            absolute right-3 top-3.5
            text-gray-400
          "
        >
          {showPassword
            ? <EyeOff size={18} />
            : <Eye size={18} />
          }
        </button>
      )}

    </div>

  )
}
