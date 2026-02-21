import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default async function AccountPage() {

  const user = await getCurrentUser()
  if (!user) return null

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 opacity-[0.20] bg-[url('/images/noise.jpg')] bg-repeat pointer-events-none" />
    

      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-40 pb-40 space-y-24">

        {/* ================= HERO ================= */}
        <div className="space-y-6">

          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            Welcome Back
          </p>

          <h1 className="text-5xl md:text-6xl tracking-tight leading-tight">
            {user.email}
          </h1>

          <p className="text-white/50 max-w-xl">
            Manage your orders, review your collection,
            and explore your account details.
          </p>

        </div>

        {/* ================= ACCOUNT OVERVIEW ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          <div className="
            border border-white/10
            p-12
            rounded-3xl
            bg-white/2
            transition
            hover:border-white/20
          ">
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-6">
              Account Type
            </p>
            <p className="text-2xl font-medium">
              {user.role}
            </p>
          </div>

          <div className="
            border border-white/10
            p-12
            rounded-3xl
            bg-white/2
            transition
            hover:border-white/20
          ">
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-6">
              Status
            </p>
            <p className="text-2xl font-medium text-green-400">
              Active
            </p>
          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="border-t border-white/10 pt-20">

          <h2 className="text-sm uppercase tracking-[0.3em] text-white/40 mb-12">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            <Link
              href="/account/orders"
              className="
                border border-white/10
                p-10
                rounded-2xl
                hover:border-white/20
                transition
              "
            >
              <p className="text-white/40 text-sm mb-4">
                Orders
              </p>
              <p className="text-xl">
                View Order History
              </p>
            </Link>

            <Link
              href="/"
              className="
                border border-white/10
                p-10
                rounded-2xl
                hover:border-white/20
                transition
              "
            >
              <p className="text-white/40 text-sm mb-4">
                Explore
              </p>
              <p className="text-xl">
                Continue Shopping
              </p>
            </Link>

            <div className="
              border border-white/10
              p-10
              rounded-2xl
              opacity-60
            ">
              <p className="text-white/40 text-sm mb-4">
                Settings
              </p>
              <p className="text-xl">
                Coming Soon
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  )
}