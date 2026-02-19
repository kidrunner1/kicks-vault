import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-32 px-8">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-20">

        {/* Sidebar */}
        <aside className="space-y-12">

          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-6">
              Account
            </p>
            <h2 className="text-3xl tracking-tight">
              Your Profile
            </h2>
          </div>

          <nav className="flex flex-col gap-6 text-sm uppercase tracking-widest">

            <Link
              href="/account"
              className="text-white/60 hover:text-white transition"
            >
              Overview
            </Link>

            <Link
              href="/account/orders"
              className="text-white/60 hover:text-white transition"
            >
              Orders
            </Link>

            <Link
              href="/account/favorites"
              className="text-white/60 hover:text-white transition"
            >
              Favorites
            </Link>

          </nav>

        </aside>

        {/* Content */}
        <div>
          {children}
        </div>

      </div>

    </div>
  )
}
