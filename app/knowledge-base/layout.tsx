import type React from "react";
import type { Metadata } from "next";

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
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <div className="py-16 md:p-4 lg:p-16 p-4 relative min-h-screen items-center justify-center overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
