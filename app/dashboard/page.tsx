"use client"

import { JSX } from "react"

import Navbar from "../component/Navbar"
import Model3D from "../component/Model3D"


export default function LandingPage(): JSX.Element {

  return (
    <div
      className="
        min-h-screen
        bg-gray-300
        flex
        flex-col
      ">

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
