"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  Wrench,
  BookOpen,
  HelpCircle,
  ChevronDown,
  Shield,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  SearchCheckIcon,
  SearchIcon,
  Cog,
  InfoIcon,
  Ticket,
  LifeBuoy,
  HandHelping,
  Headset,
  LogOut,
  User,
  UserCog2,
  UserCog,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/50 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="Servixing Home"
            >
              <Image
                src="/images/clear-logo.png"
                alt="Servixing"
                width={32}
                height={32}
                className="h-8 w-8 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                priority
              />
              <span className="text-xl font-bold text-foreground hidden sm:inline transition-colors duration-300 group-hover:text-brand-orange">
                Servixing
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Find Parts */}
              <Link
                href="/parts"
                className={`nav-link px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/parts") ? "active" : "text-muted-foreground"
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Find Parts</span>
              </Link>

              {/* Shop */}
              <Link
                href="/shop"
                className={`nav-link px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/shop") ? "active" : "text-muted-foreground"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shop</span>
              </Link>

              {/* Services dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className={`nav-link px-3 py-2 text-sm font-medium rounded-lg ${
                      isActive("/services") ? "active" : "text-muted-foreground"
                    }`}
                    aria-label="Services menu"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Services</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2 text-popover-foreground shadow-lg animate-slide-down z-50"
                    align="start"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/services"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <Wrench className="mr-2 text-blue-600" /> All Services
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/parts"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <SearchIcon className="mr-2 text-blue-600" /> Find Parts
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/services/book"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <Cog className="mr-2 text-blue-600" /> Book Repairs{" "}
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/shop"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <ShoppingBag className="mr-2 text-blue-600" /> Shop
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-2" />
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/services/warranty-device-check"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <Shield className=" fill mr-2 text-blue-600" />
                        Warranty & Device Check
                      </Link>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Help dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className={`nav-link px-3 py-2 text-sm font-medium rounded-lg ${
                      isActive("/help") ||
                      isActive("/knowledge-base") ||
                      isActive("/support")
                        ? "active"
                        : "text-muted-foreground"
                    }`}
                    aria-label="Help menu"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2 text-popover-foreground shadow-lg animate-slide-down z-50"
                    align="start"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/help"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <Headset className="mr-2 text-blue-600" /> Help Center
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/knowledge-base"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <BookOpen className=" mr-2 text-blue-600" />
                        Knowledge Base
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-2" />
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/support/create-ticket"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <Ticket className="mr-2 text-blue-600" /> Create Ticket
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        href="/support"
                        className="flex items-center px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none hover:bg-accent focus:bg-accent transition-colors duration-200"
                      >
                        <HandHelping className="mr-2 text-blue-600" /> Support
                      </Link>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              <Link
                href="/about-us"
                className={`nav-link px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/about-us") ? "active" : "text-muted-foreground"
                }`}
              >
                <UserCog className="h-4 w-4" />
                <span>About Us</span>
              </Link>
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2">
              {session ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="md"
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>
                  {((session.user as any)?.role === "ADMIN" ||
                    (session.user as any)?.role === "SUPER_ADMIN") && (
                    <Button
                      asChild
                      variant="ghost"
                      size="md"
                      className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                    >
                      <Link href="/admin" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    variant="ghost"
                    size="md"
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="md"
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    size="md"
                    className=" text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              variant="ghost"
              className="lg:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu - Full Width Slide Down */}
      <div
        className={`fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] bg-background border-b border-border shadow-2xl z-40 lg:hidden transform transition-transform duration-300 ease-out overflow-y-auto ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="p-4 pb-6">
          {/* Main Navigation - Grid Layout */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <Link
              href="/parts"
              className={`flex flex-col items-center gap-2 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive("/parts")
                  ? "bg-brand-orange-light text-brand-orange"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Search className="h-6 w-6" />
              <span>Find Parts</span>
            </Link>
            <Link
              href="/shop"
              className={`flex flex-col items-center gap-2 px-4 py-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive("/shop")
                  ? "bg-brand-orange-light text-brand-orange"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-6 w-6" />
              <span>Shop</span>
            </Link>
          </div>

          {/* Services Section */}
          <div className="border-t border-border pt-4 pb-4">
            <div className="px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Services
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/services"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <Wrench className="h-6 w-6" />
                <span className="text-xs">All Services</span>
              </Link>
              <Link
                href="/services/book"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <Cog className="h-6 w-6" />
                <span className="text-xs">Book Repairs</span>
              </Link>
              <Link
                href="/services/warranty-device-check"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <Shield className="h-6 w-6" />
                <span className="text-xs text-center">Warranty Check</span>
              </Link>
              <Link
                href="/about-us"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <UserCog className="h-6 w-6" />
                <span className="text-xs text-center">About Us</span>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-border pt-4 pb-4">
            <div className="px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Help & Support
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/help"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <HelpCircle className="h-6 w-6" />
                <span className="text-xs">Help Center</span>
              </Link>
              <Link
                href="/knowledge-base"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-xs text-center">Knowledge Base</span>
              </Link>
              <Link
                href="/support/create-ticket"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <Ticket className="h-6 w-6" />
                <span className="text-xs text-center">Create Ticket</span>
              </Link>
              <Link
                href="/support"
                className="flex flex-col items-center gap-2 px-3 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300"
              >
                <HandHelping className="h-6 w-6" />
                <span className="text-xs">Support</span>
              </Link>
            </div>
          </div>

          {/* Account Section */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-2">
              {session ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-auto flex-col py-3 px-3"
                  >
                    <Link
                      href="/dashboard"
                      className="flex flex-col items-center gap-2"
                    >
                      <LayoutDashboard className="h-6 w-6" />
                      <span className="text-xs">Dashboard</span>
                    </Link>
                  </Button>
                  {((session.user as any)?.role === "ADMIN" ||
                    (session.user as any)?.role === "SUPER_ADMIN") && (
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto flex-col py-3 px-3"
                    >
                      <Link
                        href="/admin"
                        className="flex flex-col items-center gap-2"
                      >
                        <Settings className="h-6 w-6" />
                        <span className="text-xs">Admin</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    variant="ghost"
                    className="h-auto flex-col py-3 px-3 text-red-600"
                  >
                    <LogOut className="h-6 w-6" />
                    <span className="text-xs">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    className="h-auto flex-col py-3 px-3"
                  >
                    <Link
                      href="/auth/signin"
                      className="flex flex-col items-center gap-2"
                    >
                      <User className="h-6 w-6" />
                      <span className="text-xs">Sign In</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="h-auto flex-col py-3 px-3 bg-brand-orange hover:bg-brand-orange-dark text-white"
                  >
                    <Link
                      href="/auth/signup"
                      className="flex flex-col items-center gap-2"
                    >
                      <User className="h-6 w-6" />
                      <span className="text-xs">Get Started</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      <Link href="/cart">
        <button className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-50 flex items-center justify-center">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            0
          </span>
        </button>
      </Link>
    </>
  );
}
