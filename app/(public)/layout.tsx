"use client"

import SmoothScroll from "../component/ui/SmoothScroll"
import CornerMenu from "../component/ui/CornerMenu"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <div className="min-h-screen bg-gray-100">
      <CornerMenu />
      <SmoothScroll>

        {children}

      </SmoothScroll>
    </div>
  )
}
