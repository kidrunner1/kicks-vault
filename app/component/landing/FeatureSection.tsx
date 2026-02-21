"use client"

import { motion } from "framer-motion"

interface StatementBlock {
  title: string
  subtitle: string
  description: string
}

const statements: StatementBlock[] = [
  {
    title: "DISCOVERY",
    subtitle: "Curated with intention",
    description:
      "Every silhouette, every colorway, every era — thoughtfully selected to represent sneaker culture at its highest level."
  },
  {
    title: "IMMERSION",
    subtitle: "Designed for presence",
    description:
      "Not just browsing. Experience form, proportion, and detail through fluid interaction and intentional motion."
  },
  {
    title: "COLLECTION",
    subtitle: "Personal, elevated",
    description:
      "Build a refined archive of pieces that define your style — a digital vault crafted for modern collectors."
  }
]

export default function EditorialSection() {

  return (
    <section className="relative bg-neutral-50 text-neutral-900 px-6 md:px-20 py-48 overflow-hidden">

      {/* Noise Texture */}
      <div
        className="
      pointer-events-none
      absolute
      inset-0
      opacity-[0.04]
      mix-blend-multiply
      bg-[url('/images/noise.jpg')]
      bg-repeat
      bg-size-[300px]
    "
      />

      {/* Subtle Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-225 h-225 bg-white blur-[180px] opacity-60 rounded-full" />
      </div>


      {/* Massive Statement */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative max-w-7xl mx-auto mb-40"
      >

        <div className="relative inline-block">

          <h2 className="
            font-(--font-bebas)
            text-[13vw]
            leading-[0.85]
            tracking-tight
          ">
            MORE THAN
          </h2>

          <h2 className="
            font-(--font-bebas)
            text-[13vw]
            leading-[0.85]
            tracking-tight
          ">
            A STORE
          </h2>

          {/* Accent Line */}
          <div className="absolute -left-6 top-4 w-0.5 h-[80%] bg-neutral-300" />

        </div>

        <p className="
          mt-16
          max-w-2xl
          text-xl
          text-neutral-600
          leading-relaxed
        ">
          KicksVault is a digital space where sneaker culture meets elevated design.
          Every interaction is crafted with intention — blending technology,
          editorial aesthetics, and modern craftsmanship.
        </p>

      </motion.div>

      {/* Divider */}
      <div className="w-full h-px bg-neutral-200 mb-40 max-w-7xl mx-auto" />

      {/* Editorial Blocks */}
      <div className="relative max-w-7xl mx-auto space-y-48">

        {statements.map((item, index) => {

          const isReversed = index % 2 !== 0

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`
                grid md:grid-cols-2 gap-24 items-center
              `}
            >

              {/* Big Title */}
              <div className={isReversed ? "md:order-2 text-right" : ""}>
                <h3 className="
                  font-(--font-bebas)
                  text-7xl md:text-8xl
                  tracking-tight
                  leading-[0.9]
                  text-neutral-900
                ">
                  {item.title}
                </h3>
              </div>

              {/* Content */}
              <div className={isReversed ? "md:order-1 text-left" : ""}>

                <p className="
                  text-xs
                  uppercase
                  tracking-[0.4em]
                  text-neutral-400
                  mb-8
                ">
                  {item.subtitle}
                </p>

                <div className="w-16 h-px bg-neutral-300 mb-8" />

                <p className="
                  text-lg
                  text-neutral-600
                  leading-relaxed
                  max-w-lg
                ">
                  {item.description}
                </p>

              </div>

            </motion.div>
          )
        })}

      </div>

    </section>
  )
}
