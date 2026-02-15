"use client"

import dynamic from "next/dynamic"
import SmoothScroll from "../component/SmoothScroll"

const Model3D = dynamic(
  () => import("../component/Model3D"),
  { ssr: false }
)

export default function LandingPage() {

  return (
    <SmoothScroll>
      <main className="bg-gray-200">

        {/* SECTION 1 — HERO */}
        <section className="h-screen flex items-center justify-center">
          <Model3D />
        </section>


        {/* SECTION 2 */}
        <section className="h-screen flex items-center justify-center">
          <h2 className="text-5xl font-bold">
            Discover Your Style
          </h2>
        </section>


        {/* SECTION 3 */}
        <section className="h-screen flex items-center justify-center">
          <h2 className="text-5xl font-bold">
            Explore The Vault
          </h2>
        </section>


        {/* SECTION 4 */}
        <section className="h-screen flex items-center justify-center">
          <h2 className="text-5xl font-bold">
            Join KicksVault
          </h2>
        </section>

      </main>
    </SmoothScroll>
  )
}
