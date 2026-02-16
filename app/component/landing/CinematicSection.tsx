"use client"

import {
    motion,
    useScroll,
    useTransform,
    useSpring
} from "framer-motion"

import { useRef } from "react"
import MarqueeText from "./MarqueeText"

export default function CinematicSection() {

    const ref = useRef(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    })

    // smooth physics
    const smooth = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        mass: 0.5
    })

    // IMAGE SPLIT
    const leftImageX = useTransform(smooth, [0, 1], [-300, 0])
    const rightImageX = useTransform(smooth, [0, 1], [300, 0])

    // PARALLAX
    const bgY = useTransform(smooth, [0, 1], [-150, 150])

    // SCALE (3D feel)
    const scale = useTransform(smooth, [0, 1], [0.8, 1.2])

    // TEXT REVEAL
    const leftTextX = useTransform(smooth, [0, 1], [-200, 0])
    const rightTextX = useTransform(smooth, [0, 1], [200, 0])

    const opacity = useTransform(smooth, [0, 0.4], [0, 1])

    return (

        <section
            ref={ref}
            className="
        h-[300vh]
        bg-black
        relative
      "
        >

            {/* STICKY CONTAINER */}
            <div className="
        sticky
        top-0
        h-screen
        flex
        items-center
        justify-center
        overflow-hidden
      ">

                {/* PARALLAX BACKGROUND */}
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
                {/* BACKGROUND MARQUEE LAYER */}
                <div className="absolute top-20 w-full">
                    <MarqueeText text="KICKSV AULT" speed={2} />

                </div>

                <div className="absolute bottom-20 w-full">
                    <MarqueeText text="ENTER THE FUTURE" speed={-2} />
                </div>

                {/* LEFT IMAGE */}
                <motion.img
                    src="/images/shoes/nike-01.jpg"
                    style={{
                        x: leftImageX,
                        scale
                    }}
                    className="
            absolute
            w-[400px]
            left-1/2
            -translate-x-[110%]
            z-10
          "
                />

                {/* RIGHT IMAGE */}
                <motion.img
                    src="/images/shoes/nike-01.jpg"
                    style={{
                        x: rightImageX,
                        scale
                    }}
                    className="
            absolute
            w-[400px]
            left-1/2
            translate-x-[10%]
            z-10
          "
                />
                {/* LEFT TEXT */}
                <motion.h2
                    style={{
                        x: leftTextX,
                        opacity
                    }}
                    className="
            absolute
            left-16
            text-white
            text-8xl
            font-bold
            font-[var(--font-bebas)]
            tracking-widest
          "
                >
                    KICKS
                </motion.h2>

                {/* RIGHT TEXT */}
                <motion.h2
                    style={{
                        x: rightTextX,
                        opacity
                    }}
                    className="
            absolute
            right-16
            text-white
            text-8xl
            font-bold
            font-[var(--font-bebas)]
            tracking-widest
          "
                >
                    VAULT
                </motion.h2>


                {/* CENTER TEXT stagger */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="
            absolute
            bottom-10
            text-white
            text-center
          "
                >

                    {"ENTER THE FUTURE".split("").map((char, i) => (

                        <motion.span
                            key={i}
                            initial={{
                                opacity: 0,
                                y: 50
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: i * 0.05
                            }}
                            className="
                inline-block
                text-2xl
                font-[var(--font-orbitron)]
              "
                        >
                            {char}
                        </motion.span>

                    ))}

                </motion.div>

            </div>

        </section>

    )
}
