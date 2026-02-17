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
            <div className="fixed top-6 right-6 mr-20 z-10000 flex items-center gap-4">
                {/* STORE BUTTON */}
                <motion.button
                    onClick={() => router.push("/product")}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    className="
        relative h-14 px-8 
        rounded-2xl 
        overflow-hidden
        border border-neutral-700
        bg-neutral-900
        text-white 
        uppercase tracking-widest text-sm 
        flex items-center gap-3
        transition-colors duration-300
    "
                >
                    <div className="relative overflow-hidden h-4.5 w-4.5 z-10">

                        {/* Default Icon */}
                        <motion.div
                            variants={{
                                rest: { y: 0 },
                                hover: { y: -20 }
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <ShoppingBag size={18} className="text-white" />
                        </motion.div>

                        {/* Hover Icon */}
                        <motion.div
                            variants={{
                                rest: { y: 20 },
                                hover: { y: 0 }
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <ShoppingBag size={18} className="text-neutral-900" />
                        </motion.div>

                    </div>


                    <div className="flex overflow-hidden h-5 relative z-10">
                        {text.map((char, i) => (
                            <div key={i} className="relative overflow-hidden">

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
                        className="absolute inset-0 bg-white"
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
