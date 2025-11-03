"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide navbar on dashboard and admin pages
  const hideNavbar =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth");

  if (hideNavbar) {
    return null;
  }

  return <Footer />;
}
