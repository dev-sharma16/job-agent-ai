import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/actions/dashboard"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const quickStats = stats ? [
    { label: "Jobs Tracked", value: stats.jobsTracked.toString(), icon: "📋", href: "/job-tracker" },
    { label: "Resumes Created", value: stats.resumesCreated.toString(), icon: "📄", href: "/resume-builder" },
    { label: "Interviews Practiced", value: stats.interviewsPracticed.toString(), icon: "🎤", href: "/practice-interview" },
    { label: "Coins Earned", value: stats.coins.toString(), icon: "🪙", href: "/account" },
  ] : [
    { label: "Jobs Tracked", value: "0", icon: "📋", href: "/job-tracker" },
    { label: "Resumes Created", value: "0", icon: "📄", href: "/resume-builder" },
    { label: "Interviews Practiced", value: "0", icon: "🎤", href: "/practice-interview" },
    { label: "Coins Earned", value: "0", icon: "🪙", href: "/account" },
  ]

  const quickActions = [
    { label: "Add Job Application", href: "/job-tracker", icon: "➕", description: "Start tracking a new job application" },
    { label: "Build Resume with AI", href: "/resume-builder", icon: "🤖", description: "Generate a tailored resume for your target role" },
    { label: "Start Mock Interview", href: "/practice-interview", icon: "🎯", description: "Practice with AI-powered interview simulations" },
    { label: "Optimize LinkedIn", href: "/linkedin-optimizer", icon: "🔗", description: "Get AI suggestions to improve your profile" },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back! 👋</h1>
        <p className="mt-2 text-primary-100">Ready to power your career today? Let's make progress on your job search.</p>
      </div>

      {/* Quick Stats */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="block">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <span className="text-3xl" aria-hidden="true">{stat.icon}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">1</div>
              <div>
                <p className="font-medium text-gray-900">Add your first job application</p>
                <p className="text-sm text-gray-500">Use the Job Tracker to bookmark and track applications</p>
              </div>
              <Link href="/job-tracker" className="ml-auto">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">2</div>
              <div>
                <p className="font-medium text-gray-900">Build your AI resume</p>
                <p className="text-sm text-gray-500">Generate an ATS-optimized resume tailored to your target role</p>
              </div>
              <Link href="/resume-builder" className="ml-auto">
                <Button size="sm" variant="outline">Try Now</Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">3</div>
              <div>
                <p className="font-medium text-gray-900">Practice for interviews</p>
                <p className="text-sm text-gray-500">Mock interviews with AI feedback and scoring</p>
              </div>
              <Link href="/practice-interview" className="ml-auto">
                <Button size="sm" variant="outline">Practice</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}