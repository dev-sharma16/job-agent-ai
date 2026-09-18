import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Refund Policy - autoJob",
  description: "autoJob Refund Policy",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
            <p className="text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Refund Eligibility</h2>
            <p className="text-gray-600">We offer refunds within 7 days of purchase for monthly and quarterly plans, and within 30 days for yearly plans.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Refund Process</h2>
            <p className="text-gray-600">To request a refund, contact us at support@autojob.com with your order details. Refunds are processed within 5-10 business days.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Non-Refundable Items</h2>
            <p className="text-gray-600">Coin redemptions and used premium features are non-refundable. Partial usage may result in prorated refunds.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Subscription Cancellation</h2>
            <p className="text-gray-600">You can cancel your subscription at any time. Access continues until the end of the billing period.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Contact Us</h2>
            <p className="text-gray-600">For refund inquiries, contact us at billing@autojob.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}