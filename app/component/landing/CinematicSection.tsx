"use client"

import {
    motion,
    useScroll,
    useTransform,
    useMotionTemplate
} from "framer-motion"

import { useRef } from "react"
import MarqueeText from "./MarqueeText"
import { JSX } from "react/jsx-runtime"

export default function CinematicSection(): JSX.Element {
    const ref = useRef<HTMLDivElement | null>(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    /* ========================= SCROLL TRANSFORMS========================== */


    const leftImageX = useTransform(scrollYProgress, [0, 1], [-300, 0])
    const rightImageX = useTransform(scrollYProgress, [0, 1], [300, 0])
    const bgY = useTransform(scrollYProgress, [0, 1], [-150, 150])
    const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1.15])

    // Depth blur (focus in/out)
    const blur = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8])
    const blurValue = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8])

    const blurFilter = useMotionTemplate`blur(${blurValue}px)`


    const leftTextX = useTransform(scrollYProgress, [0, 1], [-200, 0])
    const rightTextX = useTransform(scrollYProgress, [0, 1], [200, 0])
    const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])

    const lightSweepX = useTransform(
        scrollYProgress,
        [0, 1],
        ["-100%", "100%"]
    )

    return (
        <section
            ref={ref}
            className="h-[300vh] bg-black relative"
        >
            {/* Sticky Container */}
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

                {/* ================= PARALLAX BACKGROUND ================= */}
                <motion.div
                    style={{ y: bgY }}
                    className="
    absolute
    inset-0
    bg-[url('/images/shoes/nike-02.jpg')]
    bg-cover
    bg-center
    opacity-40
    scale-125
  "
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60 z-5" />

                {/* Vignette */}
                <div className="absolute inset-0 bg-linear-to-b from-black via-transparent to-black z-10 pointer-events-none" />

                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('/images/noise.jpg')] bg-repeat pointer-events-none z-20" />

                {/* =========================
            GRAIN TEXTURE
        ========================== */}
                <div
                    className="
            absolute
            inset-0
            opacity-10
            mix-blend-overlay
            pointer-events-none
            z-10
          "
                />

                {/* ========================= MARQUEE BACKGROUND========================== */}


                <div className="absolute top-20 w-full z-20">
                    <MarqueeText text="KICKSV AULT" speed={2} />
                </div>

                <div className="absolute bottom-20 w-full z-20">
                    <MarqueeText text="ENTER THE FUTURE" speed={-2} />
                </div>

                <motion.div
                    style={{ x: lightSweepX }}
                    className="
    absolute
    inset-0
    bg-linear-to-r
    from-transparent
    via-white/20
    to-transparent
    blur-3xl
    opacity-60
    z-30
    pointer-events-none
  "
                />

                {/* =========================
    LEFT IMAGE (OUTER)
========================== */}
                <motion.img
                    src="/images/man1.png"
                    alt="Male Profile"
                    style={{
                        x: leftImageX,
                        scale,
                    }}
                    className="
    absolute
    left-0
    bottom-0
    h-[90vh]
    object-contain
    z-40
    pointer-events-none
  "
                />

                {/* =========================
    RIGHT IMAGE (OUTER)
========================== */}
                <motion.img
                    src="/images/man2.png"
                    alt="Female Profile"
                    style={{
                        x: rightImageX,
                        scale,
                    }}
                    className="
    absolute
    right-0
    bottom-0
    h-[90vh]
    object-contain
    z-40
    pointer-events-none
  "
                />

                {/* =========================
    CENTER TEXT BLOCK
========================== */}
                <div className="relative z-50 grid grid-cols-1 md:grid-cols-2 gap-32 items-center text-center">

                    {/* LEFT TEXT */}
                    <motion.div
                        style={{ x: leftTextX, opacity }}
                        className="space-y-6"
                    >
                        <h2 className="
      text-[7rem]
      font-[var(--font-bebas)]
      tracking-widest text-white
    ">
                            KICKS
                        </h2>

                        <p className="
      text-white/60
      max-w-sm
      mx-auto
      text-sm
      leading-relaxed
      tracking-wide
    ">
                            Precision-engineered silhouettes inspired by
                            heritage performance and modern street culture.
                        </p>
                    </motion.div>

                    {/* RIGHT TEXT */}
                    <motion.div
                        style={{ x: rightTextX, opacity }}
                        className="space-y-6"
                    >
                        <h2 className="
      text-[7rem]
      font-[var(--font-bebas)]
      tracking-widest text-white
    ">
                            VAULT
                        </h2>

                        <p className="
      text-white/60
      max-w-sm
      mx-auto
      text-sm
      leading-relaxed
      tracking-wide
    ">
                            A curated archive of future-forward design,
                            where innovation meets timeless craftsmanship.
                        </p>
                    </motion.div>

                </div>

                {/* =========================
            MASK REVEAL CENTER TEXT
        ========================== */}
                <div className="absolute bottom-14 text-white text-center z-50">
                    <div className="overflow-hidden">
                        <motion.h3
                            initial={{ y: "100%" }}
                            whileInView={{ y: "0%" }}
                            transition={{
                                duration: 1.2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="
                text-2xl
                tracking-[0.4em]
                font-(--font-orbitron)
              "
                        >
                            ENTER THE FUTURE
                        </motion.h3>
                    </div>
                </div>

            </div>
        </section>
    )
}
