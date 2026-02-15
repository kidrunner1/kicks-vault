"use client"

import dynamic from "next/dynamic"
import { JSX } from "react"

const Model3D = dynamic(
  () => import("../component/Model3D"),
  { ssr: false }
)

export default function LandingPage(): JSX.Element {

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">

      <div className="flex flex-1 items-center justify-center">
        <Model3D />
      </div>

    </div>
  )
}
