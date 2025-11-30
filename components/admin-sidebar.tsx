"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  CreditCard,
  Menu,
  X,
  UserCheck,
  Wrench,
  Package,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const links = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/admin/work-orders",
      icon: FileText,
      label: "Work Orders",
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
    },
    {
      href: "/admin/public-users",
      icon: UserCheck,
      label: "Public Users",
    },
    {
      href: "/admin/public-repair-requests",
      icon: Wrench,
      label: "Public Repair Requests",
    },
    {
      href: "/admin/parts-requests",
      icon: Package,
      label: "Parts Requests",
    },
    {
      href: "/admin/warranty-checks",
      icon: Shield,
      label: "Warranty Checks",
    },
    ...(isSuperAdmin
      ? [
          {
            href: "/admin/payments",
            icon: CreditCard,
            label: "Payments",
          },
        ]
      : []),
    {
      href: "/admin/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-20 left-4 z-40">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          size="sm"
          variant="outline"
          className="bg-background shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 w-64 border-r border-border bg-card p-6
          transform transition-transform duration-200 ease-in-out
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="mb-8 mt-16 md:mt-0">
          <h2 className="text-lg font-bold text-orange-600">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-orange-600" : ""}`}
                  />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
