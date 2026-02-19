import { getCurrentUser } from "@/lib/auth"

export default async function AccountPage() {

  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-20">

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
          Welcome Back
        </p>
        <h1 className="text-5xl tracking-tight">
          {user.id}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="border border-white/10 p-10 rounded-2xl">
          <p className="text-white/40 text-sm mb-4">
            Account Type
          </p>
          <p className="text-xl">
            {user.role}
          </p>
        </div>

        <div className="border border-white/10 p-10 rounded-2xl">
          <p className="text-white/40 text-sm mb-4">
            Status
          </p>
          <p className="text-xl">
            Active
          </p>
        </div>

      </div>

    </div>
  )
}
