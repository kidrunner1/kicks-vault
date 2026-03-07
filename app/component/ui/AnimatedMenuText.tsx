"use client"

import { motion } from "framer-motion"

interface AnimatedMenuTextProps {
    letters: string[]
}

export default function AnimatedMenuText({ letters }: AnimatedMenuTextProps) {
    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="
        flex
        text-[56px] lg:text-[72px]
        font-semibold
        tracking-[-0.02em]
        leading-none
        overflow-hidden
      "
        >
            {letters.map((char, i) => (
                <div key={i} className="relative overflow-hidden h-[72px]">

                    {/* Default Text */}
                    <motion.span
                        variants={{
                            rest: { y: 0 },
                            hover: { y: -80 },
                        }}
                        transition={{
                            duration: 0.45,
                            delay: i * 0.035,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="block text-neutral-700"
                    >
                        {char}
                    </motion.span>

                    {/* Hover Text */}
                    <motion.span
                        variants={{
                            rest: { y: 80 },
                            hover: { y: 0 },
                        }}
                        transition={{
                            duration: 0.45,
                            delay: i * 0.035,
                            ease: [0.65, 0, 0.35, 1],
                        }}
                        className="absolute left-0 top-0 text-black"
                    >
                        {char}
                    </motion.span>

                </div>
            ))}
        </motion.div>
    )
}