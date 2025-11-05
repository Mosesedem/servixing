import type React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("=== DASHBOARD LAYOUT START ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    console.log("Layout: Fetching session...");
    const session = await getServerSession(authOptions);

    console.log("Layout: Session result:", {
      hasSession: !!session,
      user: session?.user
        ? {
            email: session.user.email,
            name: session.user.name,
          }
        : null,
    });

    if (!session) {
      console.log("Layout: No session found - redirecting to /auth/signin");
      redirect("/auth/signin");
    }

    console.log("Layout: Session valid - rendering layout");
  } catch (error) {
    console.error("=== DASHBOARD LAYOUT ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }

  return (
    <div className="flex min-h-screen bg-background ">
      <DashboardSidebar />
      {/* Main Content - add padding for mobile menu button */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
