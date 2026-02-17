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

    /* =========================
       SCROLL TRANSFORMS
    ========================== */

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

                {/* =========================
            PARALLAX BACKGROUND
        ========================== */}
                <motion.div
                    style={{ y: bgY }}
                    className="
            absolute
            inset-0
            bg-[url('/images/shoes/nike-02.jpg')]
            bg-cover
            bg-center
            opacity-30
            scale-125
          "
                />

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

                {/* =========================
            MARQUEE BACKGROUND
        ========================== */}
                <div className="absolute top-20 w-full z-20">
                    <MarqueeText text="KICKSV AULT" speed={2} />
                </div>

                <div className="absolute bottom-20 w-full z-20">
                    <MarqueeText text="ENTER THE FUTURE" speed={-2} />
                </div>

                {/* =========================
            LIGHT SWEEP
        ========================== */}
                <motion.div
                    style={{ x: lightSweepX }}
                    className="
            absolute
            inset-0
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
            blur-3xl
            z-30
            pointer-events-none
          "
                />

                {/* LEFT IMAGE*/}
                <motion.img
                    src="/images/shoes/nike-01.jpg"
                    alt="Sneaker Left"
                    style={{
                        x: leftImageX,
                        scale,
                        filter: blurFilter

                    }}
                    className="
            absolute
            w-[420px]
            left-1/2
            -translate-x-[115%]
            z-40
            will-change-transform
          "
                />

                {/* Reflection */}
                <motion.img
                    src="/images/shoes/nike-01.jpg"
                    alt="Sneaker Reflection"
                    style={{
                        x: leftImageX,
                        scale,
                        opacity: 0.15
                    }}
                    className="
            absolute
            w-105
            left-1/2
            -translate-x-[115%]
            translate-y-[120%]
            scale-y-[-1]
            blur-md
            z-0
            pointer-events-none
          "
                />

                {/* =========================
            RIGHT IMAGE
        ========================== */}
                <motion.img
                    src="/images/shoes/nike-01.jpg"
                    alt="Sneaker Right"
                    style={{
                        x: rightImageX,
                        scale,
                        filter: blurFilter

                    }}
                    className="
            absolute
            w-[420px]
            left-1/2
            translate-x-[15%]
            z-40
            will-change-transform
          "
                />

                {/* =========================
            LEFT TEXT
        ========================== */}
                <motion.h2
                    style={{ x: leftTextX, opacity }}
                    className="
            absolute
            left-16
            text-white
            text-[9rem]
            font-[var(--font-bebas)]
            tracking-widest
            z-50
          "
                >
                    KICKS
                </motion.h2>

                {/* =========================
            RIGHT TEXT
        ========================== */}
                <motion.h2
                    style={{ x: rightTextX, opacity }}
                    className="
            absolute
            right-16
            text-white
            text-[9rem]
            font-[var(--font-bebas)]
            tracking-widest
            z-50
          "
                >
                    VAULT
                </motion.h2>

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
                font-[var(--font-orbitron)]
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
