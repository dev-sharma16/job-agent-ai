import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2" aria-label="JobaajOne Home">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="font-bold text-xl text-gray-900">JobaajOne</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              Power your career with AI-driven tools for resume building, job tracking, interview practice, and LinkedIn optimization.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li><Link href="/dashboard" className="text-sm text-gray-600 hover:text-primary">Dashboard</Link></li>
              <li><Link href="/job-tracker" className="text-sm text-gray-600 hover:text-primary">Job Tracker</Link></li>
              <li><Link href="/resume-builder" className="text-sm text-gray-600 hover:text-primary">Resume Builder</Link></li>
              <li><Link href="/practice-interview" className="text-sm text-gray-600 hover:text-primary">Practice Interview</Link></li>
              <li><Link href="/linkedin-optimizer" className="text-sm text-gray-600 hover:text-primary">LinkedIn Optimizer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li><Link href="/contact-us" className="text-sm text-gray-600 hover:text-primary">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms-condition" className="text-sm text-gray-600 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-sm text-gray-600 hover:text-primary">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-3" role="list">
              <li><Link href="/feedback" className="text-sm text-gray-600 hover:text-primary">Feedback</Link></li>
              <li><Link href="#pricing" className="text-sm text-gray-600 hover:text-primary">Pricing</Link></li>
              <li><Link href="#faq" className="text-sm text-gray-600 hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} JobaajOne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}