import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    title: "AI Resume Builder",
    description: "Transform your job applications with AI-driven resumes tailored to each role, ensuring you stand out to recruiters every time.",
    icon: "📄",
    benefits: ["AI-crafted for every job role", "Build job-winning resumes in minutes", "Professional resumes, instantly ready"],
  },
  {
    title: "Job Application Tracker",
    description: "Stay Organized and Ahead: Track every job application, follow-ups, and updates effortlessly with JobaajOne.",
    icon: "📋",
    benefits: ["Streamline your job search", "Stay organized, Stay ahead", "Track every application in one place"],
  },
  {
    title: "Bookmark Jobs",
    description: "Keep all your favorite job opportunities at your fingertips by bookmarking them for easy access later.",
    icon: "🔖",
    benefits: ["Save job postings directly", "Manage all saved jobs in one place", "Quickly revisit bookmarked jobs"],
  },
  {
    title: "AI Interview Practice",
    description: "Boost your confidence with AI-driven mock interviews, real-time feedback, and personalized practice questions.",
    icon: "🎤",
    benefits: ["Ace interviews with smart insights", "Practice with AI-driven precision", "Enhance confidence with realistic mock sessions"],
  },
]

const companies = [
  { name: "Amazon", logo: "📦" },
  { name: "BMW", logo: "🚗" },
  { name: "Google", logo: "🔍" },
  { name: "Bosch", logo: "⚙️" },
  { name: "P&G", logo: "🧴" },
  { name: "L&T", logo: "🏗️" },
]

const stats = [
  { value: "487K+", label: "JobaajOne Members" },
  { value: "1.6M+", label: "Jobs Bookmarked" },
  { value: "689K+", label: "Resumes Created" },
]

const methodologySteps = [
  { number: 1, title: "Sign Up", description: "Create your free account and define your career goals" },
  { number: 2, title: "Search", description: "Explore opportunities anytime, anywhere with our job search extension" },
  { number: 3, title: "Apply", description: "Craft exceptional applications that help you stand out from the competition" },
  { number: 4, title: "Grow", description: "Utilize data and insights to understand your worth and negotiate with confidence" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-purple-100/50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                JobaajOne: Platform to <br />
                <span className="relative">
                  Power Your Career!
                  <span className="absolute -bottom-2 left-0 right-0 h-2 bg-primary/20" />
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Track job applications, build winning resumes, prepare for interviews, and much more - All in one place.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg">
                    Sign Up - It's 100% Free!
                  </Button>
                </Link>
                <span className="text-gray-400">OR</span>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 text-lg" onClick={() => window.location.href = "/api/auth/signin/google"}>
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Companies Marquee */}
        <section className="py-12 bg-gray-50 border-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-wider">
              Professionals placed in
            </h2>
            <div className="overflow-hidden">
              <div className="flex animate-marquee" style={{ animationDuration: "30s" }}>
                {companies.map((company, i) => (
                  <div key={i} className="flex-shrink-0 w-48 sm:w-56 px-6 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">{company.logo} {company.name}</span>
                  </div>
                ))}
                {companies.map((company, i) => (
                  <div key={i + 100} className="flex-shrink-0 w-48 sm:w-56 px-6 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">{company.logo} {company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Sections */}
        {features.map((feature, index) => (
          <section key={feature.title} className={`py-20 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {index % 2 === 0 ? (
                  <>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="mt-4 text-lg text-gray-600">{feature.description}</p>
                      <ul className="mt-6 space-y-3">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </span>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup" className="mt-8 inline-block">
                        <Button size="lg">Get Started Free</Button>
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-purple-100 flex items-center justify-center">
                        <span className="text-6xl">{feature.icon}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-purple-100 flex items-center justify-center">
                        <span className="text-6xl">{feature.icon}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="mt-4 text-lg text-gray-600">{feature.description}</p>
                      <ul className="mt-6 space-y-3">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </span>
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/signup" className="mt-8 inline-block">
                        <Button size="lg">Get Started Free</Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Stats Section */}
        <section className="py-20 bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-green-400">{stat.value}</div>
                  <div className="mt-2 text-lg text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">JobaajOne Proven Methodology</h2>
              <p className="mt-4 text-lg text-gray-600">Our proven methodology ensures efficient and effective solutions for job seekers and employers alike.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-purple-100/50 flex items-center justify-center">
                  <svg className="w-3/4 h-3/4 text-primary/20" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="400" rx="20" fill="currentColor" fillOpacity="0.1"/>
                    <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
                    <path d="M200 80 L200 140 M200 260 L200 320 M80 200 L140 200 M260 200 L320 200" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-8">
                {methodologySteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
                <Link href="/signup" className="mt-8 inline-block">
                  <Button size="lg">Get Started for Free!</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {methodologySteps.map((step) => (
                <div key={step.number} className="text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/signup">
                <Button size="lg">Get Started for Free!</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}