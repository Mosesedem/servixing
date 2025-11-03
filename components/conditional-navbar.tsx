"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar on dashboard and admin pages
  const hideNavbar =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  if (hideNavbar) {
    return null;
  }

  return <Navbar />;
}
