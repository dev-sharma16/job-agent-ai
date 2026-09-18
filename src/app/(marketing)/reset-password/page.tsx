import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password - autoJob",
  description: "Reset your autoJob account password",
}

function ResetPasswordFormWrapper() {
  return <ResetPasswordForm />
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
          <ResetPasswordFormWrapper />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}