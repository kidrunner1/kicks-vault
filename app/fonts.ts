// app/fonts.ts

import { Prompt } from "next/font/google"

export const prompt = Prompt({
  subsets: ["latin", "thai"],  // ⭐ สำคัญสำหรับภาษาไทย
  weight: [
    "300",
    "400",
    "500",
    "600",
    "700"
  ],
  variable: "--font-prompt",
  display: "swap",
})
