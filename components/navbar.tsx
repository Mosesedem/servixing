"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LayoutDashboard, Settings } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Profile%20Pic-CGHiNUVT0jvOJgTXBzeDVNkuVnryYp.png"
            alt="Servixing Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-foreground">Servixing</span>
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <Link href="/knowledge-base" className="text-sm text-muted-foreground hover:text-foreground">
                Help
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              {(session.user as any).role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <button onClick={() => signOut()} className="text-sm text-muted-foreground hover:text-foreground">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/knowledge-base" className="text-sm text-muted-foreground hover:text-foreground">
                Help
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
