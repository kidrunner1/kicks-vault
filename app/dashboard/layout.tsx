"use client"

import Navbar from "../component/ui/Navbar"
import SmoothScroll from "../component/ui/SmoothScroll"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <SmoothScroll>

      <div className="min-h-screen bg-gray-100">

        <Navbar />

        {children}

      </div>

    </SmoothScroll>

  )
}
