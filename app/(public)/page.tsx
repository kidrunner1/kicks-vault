import { prisma } from "@/lib/prisma"
import ShowcaseSectionDatabase from "../component/landing/ShowcaseSectionDatabase"
import HeroSection from "../component/landing/HeroSection"
import FeatureSection from "../component/landing/FeatureSection"
import CinematicSection from "../component/landing/CinematicSection"

export default async function LandingPage() {

  const shoes = await prisma.shoe.findMany({
    include: {
      brand: true,
      images: {
        orderBy: { order: "asc" }
      },
      specs: true
    }
  })

  // 🔥 FIX: Convert Decimal → string
  const formattedShoes = shoes.map(shoe => ({
    ...shoe,
    price: shoe.price ? shoe.price.toString() : null
  }))

  return (
    <main>
      <HeroSection />
      <CinematicSection />
      <ShowcaseSectionDatabase shoes={formattedShoes} />
      <FeatureSection />
    </main>
  )
}
