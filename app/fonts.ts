// app/fonts.ts

import { Bebas_Neue, Orbitron } from "next/font/google"

export const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
})

export const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})
