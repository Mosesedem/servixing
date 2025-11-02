import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {session.user?.name}!</h1>
          <p className="text-muted-foreground">Manage your devices and repair orders</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Active Repairs</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">$0</p>
          </div>
        </div>

        <p className="text-muted-foreground mt-12 text-center">More features coming soon in Phase 2!</p>
      </main>
    </>
  )
}
