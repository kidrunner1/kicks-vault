"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import MenuButton from "./Menubutton"
import FullscreenMenu from "./FullscreenMenu"
import { ShoppingBag } from "lucide-react"

export default function CornerMenu() {

    const [open, setOpen] = useState(false)
    const router = useRouter()
    const text = "Store".split("")

    return (
        <>
            {/* FIXED CONTAINER */}
            <div className="
        fixed
        top-6
        right-6
        mr-20
        z-10000
        flex
        items-center
        gap-4
      ">

                {/* STORE BUTTON */}
                <motion.button
                    onClick={() => router.push("/product")}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    className="
    relative
    h-14
    px-8
    rounded-2xl
    overflow-hidden
    border border-white/20
    bg-white/5
    backdrop-blur-xl
    text-white
    uppercase
    tracking-widest
    text-sm
    flex items-center gap-3
  "
                >
                    <ShoppingBag size={18} />

                    <div className="flex overflow-hidden h-5">

                        {text.map((char, i) => (
                            <div key={i} className="relative overflow-hidden">

                                {/* Default Layer */}
                                <motion.span
                                    variants={{
                                        rest: { y: 0 },
                                        hover: { y: -20 }
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: i * 0.05
                                    }}
                                    className="block"
                                >
                                    {char}
                                </motion.span>

                                {/* Hover Layer */}
                                <motion.span
                                    variants={{
                                        rest: { y: 20 },
                                        hover: { y: 0 }
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        delay: i * 0.05
                                    }}
                                    className="absolute left-0 top-0 text-black"
                                >
                                    {char}
                                </motion.span>

                            </div>
                        ))}

                    </div>

                    {/* Hover Background */}
                    <motion.div
                        variants={{
                            rest: { opacity: 0 },
                            hover: { opacity: 1 }
                        }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-white -z-10"
                    />

                </motion.button>

                {/* MENU BUTTON */}
                <MenuButton
                    open={open}
                    toggle={() => {
                        setOpen(prev => !prev)
                    }}
                />

            </div>

            <AnimatePresence>
                {open && (
                    <FullscreenMenu onClose={() => setOpen(false)} />
                )}
            </AnimatePresence>
        </>
    )
}
