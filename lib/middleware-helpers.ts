import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"

export async function checkAdminAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if ((session.user as any).role !== "admin") {
    throw new Error("Admin access required")
  }

  return session
}
