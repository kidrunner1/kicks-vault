"use client"

import Navbar from "../ui/Navbar"
import { motion } from "framer-motion"
import Image from "next/image"

const trending = [
  {
    name: "Nike Dunk Low Orange",
    price: 320,
    image: "/images/shoes/nike-02.jpg",
  },
  {
    name: "Nike SB Retro",
    price: 280,
    image: "/images/shoes/nike-02.jpg",
  },
  {
    name: "Air Jordan Vintage",
    price: 450,
    image: "/images/shoes/nike-03.jpg",
  },
  {
    name: "Nike Dunk Premium",
    price: 390,
    image: "/images/shoes/nike-04.jpg",
  },
]

const brands = [
  { name: "Nike", image: "/images/shoes/nike.png" },
  { name: "Jordan", image: "/images/shoes/Puma-icon.jpg" },
  { name: "Adidas", image: "/images/shoes/adidas.png" },
  { name: "Converse", image: "/images/shoes/convers-icon.jpg" },
]

export default function DiscoverySection() {

  return (
    <div className="bg-neutral-50 min-h-screen overflow-x-hidden">

      {/* NAVBAR */}

      <Navbar />

      {/* MAIN CONTAINER */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

        {/* HERO SECTION */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* HERO BANNER */}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 h-[420px] sm:h-[480px] relative rounded-3xl overflow-hidden"
          >

            <Image
              src="/images/shoes/logo.jpg"
              alt="Hero"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute left-6 bottom-6 md:left-12 md:bottom-12 text-white max-w-sm md:max-w-md">

              <h1 className="text-2xl md:text-4xl font-semibold mb-4">
                Discover the Future of Sneaker Culture
              </h1>

              <p className="text-sm opacity-90 mb-6">
                Limited drops, rare releases and iconic silhouettes curated
                for modern collectors.
              </p>

              <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition">
                Shop Collection
              </button>

            </div>

          </motion.div>

          {/* PROMO CARD */}

          <div className="bg-neutral-100 rounded-3xl p-6 md:p-8 flex flex-col justify-between">

            <div>

              <h3 className="text-lg font-semibold mb-2">
                Limited Drop
              </h3>

              <p className="text-sm text-neutral-500">
                Exclusive sneakers available only for a short time.
              </p>

            </div>

            <Image
              src="/images/shoes/nike-02.jpg"
              alt="Promo"
              width={240}
              height={240}
              className="rounded-xl mt-8 mx-auto"
            />

          </div>

        </div>

        {/* TRENDING SNEAKERS */}

        <section>

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-2xl font-semibold">
              Trending Sneakers
            </h2>

            <button className="text-sm text-neutral-500 hover:text-black">
              View All →
            </button>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

            {trending.map((shoe) => (

              <motion.div
                key={shoe.name}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl shadow-sm p-4 transition"
              >

                <div className="aspect-square relative overflow-hidden rounded-xl">

                  <Image
                    src={shoe.image}
                    alt={shoe.name}
                    fill
                    className="object-cover"
                  />

                </div>

                <div className="mt-4">

                  <p className="text-sm font-medium">
                    {shoe.name}
                  </p>

                  <p className="text-sm text-neutral-500">
                    ${shoe.price}
                  </p>

                </div>

              </motion.div>

            ))}

          </div>

        </section>

        {/* POPULAR BRANDS */}
        <section>
          <h2 className="text-2xl font-semibold mb-8">
            Popular Brands
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.map((brand) => (<motion.div key={brand.name} whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm" >
              <Image src={brand.image} alt={brand.name} width={120} height={120} className="mx-auto mb-4" />
              <p className="text-sm font-medium">
                {brand.name}
              </p>
            </motion.div>))}
          </div>

        </section>

        {/* COMMUNITY */}

        <section className="bg-neutral-100 rounded-3xl p-8 md:p-16 text-center">

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Join the KicksVault Community
          </h2>

          <p className="text-neutral-600 max-w-xl mx-auto mb-6">
            Connect with sneaker collectors and discover rare releases,
            exclusive collaborations and stories behind every pair.
          </p>

        </section>

      </main>

    </div>
  )
}