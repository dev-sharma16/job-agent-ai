import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/contact-us">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}