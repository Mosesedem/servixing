"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  LayoutDashboard,
  Settings,
  Menu,
  X,
  Search,
  ShoppingBag,
  Wrench,
  BookOpen,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile%20Pic-CGHiNUVT0jvOJgTXBzeDVNkuVnryYp.png"
              alt="Servixing Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-foreground hidden sm:inline">
              Servixing
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`px-3 ${
                isActive("/parts")
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "text-muted-foreground"
              }`}
            >
              <Link href="/parts" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Find Parts</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`px-3 ${
                isActive("/shop")
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "text-muted-foreground"
              }`}
            >
              <Link href="/shop" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Shop</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`px-3 ${
                isActive("/services")
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "text-muted-foreground"
              }`}
            >
              <Link href="/services" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Services</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={`px-3 ${
                isActive("/help")
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "text-muted-foreground"
              }`}
            >
              <Link href="/help" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Help</span>
              </Link>
            </Button>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                {((session.user as any).role === "ADMIN" ||
                  (session.user as any).role === "SUPER_ADMIN") && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button onClick={() => signOut()} variant="ghost" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  isActive("/parts")
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "text-muted-foreground"
                }`}
              >
                <Link href="/parts" onClick={() => setMobileMenuOpen(false)}>
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Find Parts
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  isActive("/shop")
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "text-muted-foreground"
                }`}
              >
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  isActive("/services")
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "text-muted-foreground"
                }`}
              >
                <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                  <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Services
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  isActive("/help")
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "text-muted-foreground"
                }`}
              >
                <Link href="/help" onClick={() => setMobileMenuOpen(false)}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Help
                  </span>
                </Link>
              </Button>

              <div className="border-t border-border my-2"></div>

              {session ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </span>
                    </Link>
                  </Button>
                  {((session.user as any).role === "ADMIN" ||
                    (session.user as any).role === "SUPER_ADMIN") && (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground"
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Admin
                        </span>
                      </Link>
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
