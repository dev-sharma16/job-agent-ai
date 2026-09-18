import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "autoJob - Power Your Career with AI",
  description: "Track job applications, build winning resumes, prepare for interviews, and optimize your LinkedIn profile - all in one AI-powered platform.",
  keywords: ["job tracker", "resume builder", "interview practice", "linkedin optimizer", "career AI"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}