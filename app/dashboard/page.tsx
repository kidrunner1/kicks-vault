"use client"

import SmoothScroll from "../component/ui/SmoothScroll"
import HeroSection from "../component/landing/HeroSection"
import FeatureSection from "../component/landing/FeatureSection"
import CinematicSection from "../component/landing/CinematicSection"

import ShowcaseSectionDatabase from "../component/landing/ShowcaseSectionDatabase"
export default function LandingPage() {

  return (

    <SmoothScroll>

      <main>

        <HeroSection />

        {/* <RevealSection /> */}

        <CinematicSection />

        {/* <IntroSection /> */}
        <ShowcaseSectionDatabase />

        <FeatureSection />

        {/* <CTASection /> */}

      </main>

    </SmoothScroll>

  )
}
