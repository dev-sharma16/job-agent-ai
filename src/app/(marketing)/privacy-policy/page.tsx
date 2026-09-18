import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - JobaajOne",
  description: "JobaajOne Privacy Policy",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
            <p className="text-gray-600">We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="text-gray-600">We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Data Sharing</h2>
            <p className="text-gray-600">We do not sell your personal information. We may share data with service providers who help us operate our platform.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
            <p className="text-gray-600">We implement appropriate security measures to protect your personal information against unauthorized access.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
            <p className="text-gray-600">You have the right to access, update, or delete your personal information. Contact us to exercise these rights.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Contact Us</h2>
            <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us at privacy@jobaajone.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}