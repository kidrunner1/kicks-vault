import type { Metadata } from "next"
import "./globals.css"
import { ibmThai, fjalla } from "./fonts"
import { Toaster } from "sonner"
import AuthProvider from "@/app/component/auth/AuthProvider"

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
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          theme="dark"
        />
      </body>
    </html>
  )
}