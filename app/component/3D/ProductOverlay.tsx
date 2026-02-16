"use client"

import { Children, ReactNode, JSX } from "react"
import { motion, Variants } from "framer-motion"


import { useStore } from "../../store/store"

const container: Variants = {
    hidden: {
        opacity: 0,
        height: 0,
        transition: {
            staggerChildren: 0.05,
        },
    },

    show: {
        opacity: 1,
        height: "auto",
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.05,
        },
    },
}

const item: Variants = {
    hidden: {
        opacity: 0,
        y: "100%",
    },

    show: {
        opacity: 1,
        y: 0,
    },
}

interface ListProps {
    children: ReactNode
    open: boolean
}
function List({ children, open }: ListProps): JSX.Element {
    return (
        <motion.ul
            variants={container}
            initial="hidden"
            animate={open ? "show" : "hidden"}
        >
            {Children.map(children, (child, i) => (
                <li key={i}>
                    <motion.div variants={item}>
                        {child}
                    </motion.div>
                </li>
            ))}
        </motion.ul>
    )
}

export default function ProductOverlay(): JSX.Element {

    const state = useStore()

    return (
        <>
            {/* Fullscreen overlay layer */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 30,
                }}
            >

            </div>

            {/* Center info */}
            <div className="info">

                <h1>KicksVault</h1>

                <List open={state.open}>

                    <h3>DISCOVER</h3>

                    <h3>COLLECT</h3>

                    <h3>
                        <span className="accent">
                            YOUR STYLE
                        </span>
                    </h3>

                    <h4>Premium Sneaker Platform</h4>

                    <p className="price">Explore Now</p>

                    <p>
                        Welcome to KicksVault — your destination for exploring the world of sneakers.
                        Discover iconic designs, modern releases, and timeless classics all in one place.
                        Built for sneaker enthusiasts who value style, authenticity, and innovation.
                        Start your journey and find the perfect pair that defines you.
                    </p>

                </List>

            </div>

        </>
    )
}
