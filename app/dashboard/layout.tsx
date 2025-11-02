import type React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { LayoutDashboard, Smartphone, FileText } from "lucide-react";

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
    <>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card p-6">
          <nav className="space-y-2">
            <SidebarLink href="/dashboard" icon={LayoutDashboard}>
              Overview
            </SidebarLink>
            <SidebarLink href="/dashboard/devices" icon={Smartphone}>
              My Devices
            </SidebarLink>
            <SidebarLink href="/dashboard/work-orders" icon={FileText}>
              Work Orders
            </SidebarLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors">
        <Icon className="h-5 w-5 text-orange-600" />
        <span>{children}</span>
      </div>
    </Link>
  );
}
