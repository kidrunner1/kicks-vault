"use client"

import { motion } from "framer-motion"
import { useStore } from "../../store/store"

export default function ProductOverlay() {

    const snap = useStore()
    const open = snap.open

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        pointer-events-none
        px-6
      "
        >

            <div
                className="
          text-white
          max-w-md
          md:max-w-lg
          border-l
          border-white/40
          pl-6
          md:pl-10
          space-y-4
          text-center
          md:text-left
        "
            >

                <h1 className="text-3xl md:text-5xl font-semibold tracking-wide">
                    KicksVault
                </h1>

                <div className="space-y-1 text-lg md:text-xl font-medium">

                    <h3>DISCOVER</h3>
                    <h3>COLLECT</h3>

                    <h3>
                        <span className="accent">
                            YOUR STYLE
                        </span>
                    </h3>

                </div>

                <h4 className="text-sm md:text-base text-white/70">
                    Premium Sneaker Platform
                </h4>

                <span
                    className="
            inline-block
            font-mono
            bg-white
            text-black
            px-3
            py-1
            rounded-md
            text-xs
            tracking-widest
          "
                >
                    Explore Now
                </span>

                <p className="
          text-xs
          md:text-sm
          text-white/70
          leading-relaxed
        ">
                    Welcome to KicksVault — your destination for exploring the
                    world of sneakers. Discover iconic designs, modern releases,
                    and timeless classics all in one place.
                </p>

            </div>

        </motion.div>

    )
}