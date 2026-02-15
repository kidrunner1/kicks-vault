"use client"

import { JSX } from "react"

import Navbar from "../component/Navbar"
import Model3D from "../component/Model3D"


/**
 * Landing Page Component
 */
export default function LandingPage(): JSX.Element {

  const models = [
    {
      id:1,
      title: "Shoe Model",
      path: "/3D/nike_air_zoom_pegasus_36-transformed.glb"
    },
  ]

  return (
    <div
      className="
        min-h-screen
        bg-gray-300
        flex
        flex-col
      "
    >

      {/* Navbar */}
      <Navbar />

      {/* Model container */}
      <div
        className="
          flex
          flex-1
          items-center
          justify-center
        "
      >
        <Model3D />
      </div>

    </div>
  )
}
