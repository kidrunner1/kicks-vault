import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/jwt"

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("accessToken")?.value

  if (!token) {
    redirect("/login")
  }

  try {
    await verifyToken(token)
    redirect("/dashboard")
  } catch {
    redirect("/login")
  } 
}
