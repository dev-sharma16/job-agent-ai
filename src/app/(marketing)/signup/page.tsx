import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up - JobaajOne",
  description: "Create your free JobaajOne account and power your career with AI",
}

function SignupFormWrapper() {
  return <SignupForm />
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <SignupFormWrapper />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}