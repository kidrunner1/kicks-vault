"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react"
import AppLogo from "@/app/component/ui/AppLogo"
import { uiAction } from "@/lib/ui-interactions"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()
  const entranceInitial = prefersReducedMotion ? false : { opacity: 0, y: 18 }
  const entranceTransition = {
    duration: prefersReducedMotion ? 0 : 0.42,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f3ef] text-black">
      <div className="absolute left-4 top-4 z-30 md:left-6 md:top-6">
        <Link
          href="/"
          className={`h-11 px-4 text-sm font-medium ${uiAction.surface}`}
        >
          <ArrowLeft size={16} />
          <AppLogo compact />
        </Link>
      </div>

      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.88fr)_minmax(420px,0.82fr)]">
        <section className="relative hidden min-h-screen overflow-hidden bg-black text-white lg:block">
          <div className="absolute inset-x-10 top-28 border-t border-white/15" />
          <div className="absolute bottom-24 right-12 h-px w-56 bg-white/15" />
          <div className="absolute bottom-32 right-12 h-px w-32 bg-[#d8ff6a]" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 pt-28 xl:p-14 xl:pt-32">
            <AppLogo
              inverse
              subLabel="พื้นที่สมาชิก"
              className="self-start"
            />

            <motion.div
              initial={entranceInitial}
              animate={{ opacity: 1, y: 0 }}
              transition={entranceTransition}
              className="max-w-xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm">
                <ShieldCheck size={16} />
                พื้นที่สมาชิกที่ปลอดภัย
              </div>

              <h1 className="text-6xl font-semibold leading-none tracking-tight xl:text-7xl">
                vault ของคุณ
                <br />
                พร้อมเสมอ
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/78">
                เก็บที่อยู่ รายการโปรด ประวัติออเดอร์ และ Checkout ไว้ในพื้นที่สมาชิกเดียว
              </p>

              <div className="mt-8 grid gap-3 text-sm text-white/82 sm:grid-cols-2">
                <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                    <ShoppingBag size={16} />
                  </span>
                  Checkout ที่อิง Stock จริงและผูกกับบัญชีของคุณ
                </div>
                <div className="rounded-lg border border-white/12 bg-white/8 p-4">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                    <PackageCheck size={16} />
                  </span>
                  ประวัติออเดอร์ถูกเก็บไว้ใน member archive
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 pb-10 pt-24 md:px-8 lg:px-12">
          <motion.div
            initial={entranceInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={entranceTransition}
            className="w-full max-w-md rounded-lg border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-8"
          >
            <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
              <AppLogo subLabel="เข้าสู่ระบบสมาชิก" />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black bg-[#d8ff6a] text-black">
                <ShieldCheck size={18} />
              </span>
            </div>

            {children}
          </motion.div>
        </section>
      </div>

      <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs text-black/45">
        (c) {new Date().getFullYear()} Kicks Vault
      </p>
    </main>
  )
}
