"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  FileText,
  CreditCard,
  Menu,
  X,
  Shield,
  Settings,
  User,
  MapPin,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const links = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Overview",
    },
    {
      href: "/dashboard/devices",
      icon: Smartphone,
      label: "My Devices",
    },
    {
      href: "/dashboard/work-orders",
      icon: FileText,
      label: "Work Orders",
    },
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: "Payments",
    },
    {
      href: "/services/warranty-device-check",
      icon: Shield,
      label: "Warranty Check",
    },
    {
      href: "/dashboard/invoices",
      icon: Download,
      label: "Invoices",
    },
  ];

  const settingsLinks = [
    {
      href: "/dashboard/settings/profile",
      icon: User,
      label: "Profile",
    },
    {
      href: "/dashboard/settings/account",
      icon: Settings,
      label: "Account",
    },
    {
      href: "/dashboard/settings/addresses",
      icon: MapPin,
      label: "Addresses",
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
        <nav className="space-y-6 mt-16 md:mt-0">
          {/* Main Navigation */}
          <div className="space-y-2">
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
          </div>

          {/* Settings Section */}
          <div className="space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </div>
            {settingsLinks.map((link) => {
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
          </div>
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
