"use client"

import { motion } from "framer-motion"

const features = [
  {
    title: "DISCOVER",
    desc: "Explore curated sneaker collections from iconic classics to modern releases.",
    highlight: "1000+ sneakers"
  },
  {
    title: "IMMERSIVE",
    desc: "Experience sneakers in interactive 3D. Rotate, inspect, and feel every detail.",
    highlight: "3D interaction"
  },
  {
    title: "COLLECT",
    desc: "Save your favorite pairs and build your personal sneaker vault.",
    highlight: "Your collection"
  },
  {
    title: "AUTHENTIC",
    desc: "Every sneaker is verified and presented with premium accuracy.",
    highlight: "Trusted platform"
  },
  {
    title: "FAST",
    desc: "Built with modern tech for lightning-fast browsing and smooth experience.",
    highlight: "Next.js powered"
  },
  {
    title: "FUTURE",
    desc: "KicksVault evolves with sneaker culture and new digital experiences.",
    highlight: "Next generation"
  }
]

export default function FeatureSection() {

  return (

    <section className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-white
      px-6
      py-32
    ">

      {/* SECTION TITLE */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="
          font-[var(--font-bebas)]
          text-6xl
          tracking-widest
          text-gray-900
          mb-20
        "
      >
        THE PLATFORM
      </motion.h2>


      {/* GRID */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-10
        max-w-6xl
      ">

        {features.map((f, i) => (

          <motion.div
            key={i}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
            className="
              group
              bg-gray-50
              p-10
              rounded-3xl
              border border-gray-200

              hover:bg-black
              hover:text-white

              transition-all
              duration-500
            "
          >

            {/* highlight */}
            <div className="
              text-sm
              text-gray-400
              group-hover:text-gray-300
              mb-4
              font-[var(--font-orbitron)]
            ">
              {f.highlight}
            </div>

            {/* title */}
            <h3 className="
              font-[var(--font-bebas)]
              text-3xl
              tracking-wide
              mb-4
            ">
              {f.title}
            </h3>

            {/* desc */}
            <p className="
              text-gray-600
              group-hover:text-gray-300
              transition
            ">
              {f.desc}
            </p>

          </motion.div>

        ))}

      </div>

    </section>

  )
}
