import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In - autoJob",
  description: "Sign in to your autoJob account to access your dashboard",
}

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <LoginFormWrapper />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}