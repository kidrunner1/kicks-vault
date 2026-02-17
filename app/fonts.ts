// app/fonts.ts

import { IBM_Plex_Sans_Thai, Fjalla_One } from "next/font/google"

export const ibmThai = IBM_Plex_Sans_Thai({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-thai",
  display: "swap",
})

export const fjalla = Fjalla_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fjalla",
  display: "swap",
})
