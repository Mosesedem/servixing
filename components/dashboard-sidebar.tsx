"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Wrench,
  ShoppingBag,
  Package,
  HeadphonesIcon,
  BookOpen,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close on ESC and on route change to keep UX tidy on mobile
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Dynamic title based on pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/devices")) return "My Devices";
    if (pathname.startsWith("/dashboard/work-orders")) return "Work Orders";
    if (pathname.startsWith("/dashboard/invoices")) return "Invoices";
    if (pathname.startsWith("/dashboard/payments")) return "Payments";
    if (pathname.startsWith("/dashboard/settings/profile")) return "Profile";
    if (pathname.startsWith("/dashboard/settings/account")) return "Account";
    if (pathname.startsWith("/dashboard/settings/addresses"))
      return "Addresses";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    if (pathname.startsWith("/services/warranty-device-check"))
      return "Warranty Check";
    if (pathname.startsWith("/services")) return "Services";
    if (pathname.startsWith("/shop")) return "Shop";
    if (pathname.startsWith("/parts")) return "Find Parts";
    if (pathname.startsWith("/support")) return "Support";
    if (pathname.startsWith("/knowledge-base")) return "Knowledge Base";
    if (pathname.startsWith("/help")) return "Help Center";
    return "Dashboard";
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  // Main Dashboard Links
  const dashboardLinks = [
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
      href: "/dashboard/invoices",
      icon: Download,
      label: "Invoices",
    },
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: "Payments",
    },
  ];

  // Services & Shop Links
  const servicesLinks = [
    {
      href: "/services",
      icon: Wrench,
      label: "Services",
    },
    {
      href: "/services/warranty-device-check",
      icon: Shield,
      label: "Warranty Check",
    },
    {
      href: "/shop",
      icon: ShoppingBag,
      label: "Shop",
    },
    {
      href: "/parts",
      icon: Package,
      label: "Find Parts",
    },
  ];

  // Support & Help Links
  const supportLinks = [
    {
      href: "/support",
      icon: HeadphonesIcon,
      label: "Support",
    },
    {
      href: "/knowledge-base",
      icon: BookOpen,
      label: "Knowledge Base",
    },
    {
      href: "/help",
      icon: HelpCircle,
      label: "Help Center",
    },
  ];

  // Settings Links
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

  const renderNavLink = (link: { href: string; icon: any; label: string }) => {
    const Icon = link.icon;
    const active = isActive(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-2.5 rounded-lg transition-colors text-center md:text-left ${
            active
              ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 font-semibold"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon
            className={`h-6 w-6 md:h-5 md:w-5 ${
              active ? "text-orange-600" : ""
            }`}
          />
          <span className="text-sm md:text-base truncate w-full md:w-auto">
            {link.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Top Header with Menu + User */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            size="icon"
            variant="ghost"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="text-sm font-semibold">{getPageTitle()}</div>

          {/* User Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="icon" variant="outline" aria-label="User menu">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2 text-popover-foreground shadow-lg z-50"
                align="end"
                sideOffset={8}
              >
                {session?.user && (
                  <>
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <DropdownMenu.Separator className="h-px bg-border my-2" />
                  </>
                )}
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/profile"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/account"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/addresses"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Addresses
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-2" />
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200 text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Sidebar - Fixed positioning */}
      <aside
        className={`
          fixed md:sticky inset-y-0 md:top-0 left-0 z-30 
          w-screen md:w-64 h-screen md:h-screen
          border-r border-border bg-card 
          transform transition-transform duration-200 ease-in-out
          overflow-y-auto overscroll-contain
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Desktop header inside sidebar */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b">
          <div className="text-sm font-semibold">{getPageTitle()}</div>

          {/* User Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button size="icon" variant="outline" aria-label="User menu">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2 text-popover-foreground shadow-lg z-50"
                align="end"
                sideOffset={8}
              >
                {session?.user && (
                  <>
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <DropdownMenu.Separator className="h-px bg-border my-2" />
                  </>
                )}
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/profile"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/account"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/settings/addresses"
                    className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Addresses
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-border my-2" />
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center w-full px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200 text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <nav className="space-y-6 p-4 md:p-6 mt-16 md:mt-0">
          {/* Dashboard Section */}
          <div className="space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dashboard
            </div>
            <div className="grid grid-cols-2 md:block gap-2">
              {dashboardLinks.map(renderNavLink)}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Services & Shop Section */}
          <div className="space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Services & Shop
            </div>
            <div className="grid grid-cols-2 md:block gap-2">
              {servicesLinks.map(renderNavLink)}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Support & Help Section */}
          <div className="space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Support & Help
            </div>
            <div className="grid grid-cols-2 md:block gap-2">
              {supportLinks.map(renderNavLink)}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Settings Section */}
          <div className="space-y-2 pb-8 md:pb-0">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Settings
            </div>
            <div className="grid grid-cols-2 md:block gap-2">
              {settingsLinks.map(renderNavLink)}
            </div>
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
