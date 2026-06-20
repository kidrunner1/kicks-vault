import { requireAdmin } from "@/lib/auth"
import { AuthError } from "@/lib/errors/auth-error"
import { redirect } from "next/navigation"
import AdminShell from "./AdminShell"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(error.statusCode === 403 ? "/" : "/login")
    }

    throw error
  }

  return <AdminShell>{children}</AdminShell>
}
