import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const pathname = (await headers()).get("x-next-pathname") ?? ""

  const navItems = [
    { name: "Overview", href: "/account" },
    { name: "Orders", href: "/account/orders" },
    { name: "Favorites", href: "/account/favorites" },
  ]

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 opacity-[0.20] bg-[url('/images/noise.jpg')] bg-repeat pointer-events-none" />
      

      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-40 pb-40">

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-24">

          {/* ================= SIDEBAR ================= */}
          <aside className="space-y-16">

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                Account
              </p>
              <h2 className="text-3xl tracking-tight">
                Your Profile
              </h2>
              <p className="text-white/40 text-sm">
                {user.email}
              </p>
            </div>

            <nav className="flex flex-col gap-8 text-sm uppercase tracking-[0.25em]">

              {navItems.map(item => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative
                      transition
                      ${isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white"
                      }
                    `}
                  >
                    {item.name}

                    {isActive && (
                      <span className="absolute -bottom-2 left-0 w-full h-px bg-white/40" />
                    )}
                  </Link>
                )
              })}

            </nav>

          </aside>

          {/* ================= CONTENT ================= */}
          <div className="min-h-[60vh]">
            {children}
          </div>

        </div>

      </section>

    </main>
  )
}