import { prisma } from "@/lib/prisma"
import ShowcaseSectionDatabase from "../component/landing/ShowcaseSectionDatabase"
import HeroSection from "../component/landing/HeroSection"
import FeatureSection from "../component/landing/FeatureSection"
import CinematicSection from "../component/landing/CinematicSection"

export default async function LandingPage() {
  const shoes = await prisma.shoe.findMany({
    take: 8,
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      brand: true,
      images: {
        orderBy: { order: "asc" },
      },
      specs: true,
      sizes: {
        orderBy: { size: "asc" },
      },
    },
  })

  const formattedShoes = shoes.map((shoe) => ({
    ...shoe,
    price: shoe.price == null ? null : shoe.price.toString(),
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
