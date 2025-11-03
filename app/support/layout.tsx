import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://servixing.com",
    title: "Servixing - Professional Device Repair Management",
    description: "Track your device repairs from drop-off to pickup.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile%20Pic-CGHiNUVT0jvOJgTXBzeDVNkuVnryYp.png",
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
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
