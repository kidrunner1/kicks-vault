import type { Metadata } from "next"
import "./globals.css"
import { ibmThai, fjalla } from "./fonts"
import { Toaster } from "sonner"


export const metadata: Metadata = {
  title: "KicksVault",
  description: "Your trusted destination for premium sneakers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`
    ${ibmThai.className}
    ${fjalla.variable}
    antialiased
  `}
      >


        {children}
        <Toaster
          position="top-right"
          theme="dark"
        />
      </body>
    </html>
  )
}
