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
    <main className="min-h-screen bg-[#f3f3f1] text-black pt-24 pb-32 px-6">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">

        {/* ================= SIDEBAR ================= */}
        <aside className="space-y-8">

          {/* PROFILE CARD */}
          <div className="bg-white border border-black/10 rounded-3xl p-8">

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                {user.email[0].toUpperCase()}
              </div>

              <div>
                <p className="font-medium">
                  {user.email}
                </p>
                <p className="text-xs text-black/50">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="h-px bg-black/10 my-6" />

            {/* NAVIGATION */}
            <nav className="flex flex-col gap-2">

              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/account" &&
                    pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-3
                      rounded-xl
                      text-sm
                      transition
                      flex items-center justify-between
                      ${isActive
                        ? "bg-black text-white"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                      }
                    `}
                  >
                    {item.name}

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                )
              })}

            </nav>

          </div>

          {/* EXTRA PANEL (Optional future use) */}
          <div className="bg-white border border-black/10 rounded-3xl p-6 text-sm text-black/60">
            Premium perks and member benefits will appear here.
          </div>

        </aside>

        {/* ================= CONTENT ================= */}
        <div className="space-y-10">

          {/* Page Container */}
          <div className="bg-white border border-black/10 rounded-3xl p-10 min-h-[60vh]">
            {children}
          </div>

        </div>
      </div> 
    </main>
  )
}