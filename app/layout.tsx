import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { ConditionalFooter } from "@/components/conditional-footer";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: "400",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Servixing - Professional Device Repair Management",
  description:
    "Track your device repairs from drop-off to pickup. Real-time updates, expert technicians, warranty protection.",
  keywords: [
    "device repair",
    "repair tracking",
    "laptop repair",
    "phone repair",
    "tablet repair",
  ],
  authors: [{ name: "Servixing" }],
  creator: "Servixing",
  icons: [
    { url: "/images/clear-logo.png", type: "image/x-icon" },
    { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://servixing.com",
    title: "Servixing - Professional Device Repair Management",
    description: "Track your device repairs from drop-off to pickup.",
    images: [
      {
        url: "/images/clear-logo.png",
        width: 1200,
        height: 630,
        alt: "Servixing",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <Providers session={session}>
          <ConditionalNavbar />

          {children}
          <ConditionalFooter />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
