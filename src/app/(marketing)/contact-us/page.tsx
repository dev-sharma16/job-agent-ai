import { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact Us - autoJob",
  description: "Get in touch with the autoJob team",
}

function ContactFormWrapper() {
  return <ContactForm />
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Contact Us</h1>
            <p className="text-gray-500 mt-2">Have questions? We'd love to hear from you.</p>
          </div>
          <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <ContactFormWrapper />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}