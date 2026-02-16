"use client"

import { motion } from "framer-motion"
import { useStore } from "../../store/store"

export default function ProductOverlay() {

    const snap = useStore()
    const open = snap.open

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
            }}
        >

            <div className="info">

                <h1>KicksVault</h1>

                <h3>DISCOVER</h3>
                <h3>COLLECT</h3>

                <h3> <span className="accent"> YOUR STYLE </span> </h3>
                <h4>Premium Sneaker Platform</h4>
                <p className="price">Explore Now</p>
                <p> Welcome to KicksVault — your destination for exploring the world of sneakers. Discover iconic designs, modern releases, and timeless classics all in one place. Built for sneaker enthusiasts who value style, authenticity, and innovation. Start your journey and find the perfect pair that defines you.

                </p>
            </div>

        </motion.div>

    )
}
