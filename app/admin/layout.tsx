import type React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.id ||
    ((session.user as any).role !== "ADMIN" &&
      (session.user as any).role !== "SUPER_ADMIN")
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      {/* Main Content - add padding for mobile menu button */}
      <main className="flex-1 p-8 md:p-8 pt-20 md:pt-8">{children}</main>
    </div>
  );
}
