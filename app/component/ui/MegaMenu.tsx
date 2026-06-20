"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface MegaMenuProps {
    category: string
}

export default function MegaMenu({ category }: MegaMenuProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="
        absolute
        left-0
        top-full
        w-full
        bg-white
        border-t
        shadow-xl
        py-12
        z-40
      "
        >

            {/* CONTAINER */}

            <div className="max-w-7xl mx-auto px-6">

                {/* CATEGORY TITLE */}

                <div className="mb-10">

                    <h3 className="text-lg font-semibold">
                        {category}
                    </h3>

                </div>

                {/* GRID */}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">

                    <div>

                        <h4 className="font-semibold mb-4 text-sm">
                            แนะนำ
                        </h4>

                        <ul className="space-y-3 text-sm text-neutral-500">

                            <li className="hover:text-black cursor-pointer">
                                สินค้าเข้าใหม่
                            </li>

                            <li className="hover:text-black cursor-pointer">
                                ขายดี
                            </li>

                            <li className="hover:text-black cursor-pointer">
                                Limited Drops
                            </li>

                            <li className="hover:text-black cursor-pointer">
                                สิทธิ์เฉพาะสมาชิก
                            </li>

                        </ul>

                    </div>

                    <div>

                        <h4 className="font-semibold mb-4 text-sm">
                            รองเท้า
                        </h4>

                        <ul className="space-y-3 text-sm text-neutral-500">

                            <li>Basketball</li>
                            <li>Running</li>
                            <li>Lifestyle</li>
                            <li>Skateboarding</li>
                            <li>Training</li>

                        </ul>

                    </div>

                    <div>

                        <h4 className="font-semibold mb-4 text-sm">
                            เสื้อผ้า
                        </h4>

                        <ul className="space-y-3 text-sm text-neutral-500">

                            <li>Hoodies</li>
                            <li>เสื้อยืด</li>
                            <li>แจ็กเก็ต</li>
                            <li>กางเกงขาสั้น</li>

                        </ul>

                    </div>

                    <div>

                        <h4 className="font-semibold mb-4 text-sm">
                            Accessories
                        </h4>

                        <ul className="space-y-3 text-sm text-neutral-500">

                            <li>กระเป๋า</li>
                            <li>ถุงเท้า</li>
                            <li>หมวก</li>
                            <li>Backpacks</li>

                        </ul>

                    </div>

                    <div>

                        <h4 className="font-semibold mb-4 text-sm">
                            Collections
                        </h4>

                        <ul className="space-y-3 text-sm text-neutral-500">

                            <li>Air Jordan</li>
                            <li>Nike Dunk</li>
                            <li>Adidas Samba</li>
                            <li>New Balance 550</li>

                        </ul>

                    </div>

                    <div className="space-y-3">

                        <div className="relative h-40 rounded-xl overflow-hidden">

                            <Image
                                src="/images/shoes/nike-01.jpg"
                                alt="รองเท้า sneaker คู่แนะนำในโปรโมชัน"
                                fill
                                className="object-cover"
                            />

                        </div>

                        <p className="text-sm font-medium">
                            Mid Season Sale
                        </p>

                        <p className="text-xs text-red-500">
                            ลดสูงสุด 50% สำหรับ sneaker ที่ร่วมรายการ
                        </p>

                    </div>

                </div>

            </div>

        </motion.div>
    )
}
