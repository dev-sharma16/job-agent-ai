"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/job-tracker") || pathname.startsWith("/resume") || pathname.startsWith("/practice") || pathname.startsWith("/linkedin") || pathname.startsWith("/account") || pathname.startsWith("/feedback")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" aria-label="autoJob Home">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-xl text-gray-900">autoJob</span>
          </Link>

          {!isDashboard && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">How It Works</Link>
              <Link href="/contact-us" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Contact</Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}