"use client"

import { motion } from "framer-motion"
import { JSX } from "react/jsx-runtime"

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

export default function EditorialSection(): JSX.Element {
  return (
    <section className="bg-white text-black px-6 md:px-12 py-40">

      {/* Massive Statement */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="max-w-6xl mx-auto mb-32"
      >
        <h2 className="
          font-[var(--font-bebas)]
          text-[12vw]
          leading-none
          tracking-tight
        ">
          MORE THAN
        </h2>
        <h2 className="
          font-[var(--font-bebas)]
          text-[12vw]
          leading-none
          tracking-tight
        ">
          A STORE
        </h2>

        <p className="mt-10 max-w-xl text-lg text-gray-600">
          KicksVault is a digital space where sneaker culture meets elevated design.
          Every interaction is crafted with intention.
        </p>
      </motion.div>

      {/* Editorial Blocks */}
      <div className="space-y-40 max-w-6xl mx-auto">

        {statements.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: index * 0.15,
              ease: [0.22, 1, 0.36, 1]
            }}
            className={`
              grid md:grid-cols-2 gap-16 items-center
              ${index % 2 !== 0 ? "md:flex-row-reverse" : ""}
            `}
          >
            {/* Big Title */}
            <div>
              <h3 className="
                font-[var(--font-bebas)]
                text-6xl md:text-7xl
                tracking-wide
              ">
                {item.title}
              </h3>
            </div>

            {/* Text Content */}
            <div>
              <p className="
                text-sm
                uppercase
                tracking-widest
                text-gray-400
                mb-6
              ">
                {item.subtitle}
              </p>

              <p className="
                text-lg
                text-gray-700
                leading-relaxed
              ">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}

      </div>
    </section>
  )
}
