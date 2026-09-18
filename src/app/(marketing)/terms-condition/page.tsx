import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Terms of Service - JobaajOne",
  description: "JobaajOne Terms of Service",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">By accessing and using JobaajOne, you agree to be bound by these Terms of Service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Use of Services</h2>
            <p className="text-gray-600">You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Premium Membership</h2>
            <p className="text-gray-600">Premium features are available via subscription. Subscriptions auto-renew unless cancelled. Refunds per our Refund Policy.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Intellectual Property</h2>
            <p className="text-gray-600">All content and features of JobaajOne are owned by us and protected by intellectual property laws.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Limitation of Liability</h2>
            <p className="text-gray-600">We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Termination</h2>
            <p className="text-gray-600">We may terminate or suspend your account for violation of these terms.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Contact Us</h2>
            <p className="text-gray-600">Questions about these Terms? Contact us at legal@jobaajone.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}