import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "autoJob - Power Your Career with AI",
    template: "%s | autoJob",
  },
  description: "Track job applications, build winning resumes, prepare for interviews, and optimize your LinkedIn profile - all in one AI-powered platform.",
  keywords: ["job tracker", "resume builder", "interview practice", "linkedin optimizer", "career AI", "job search", "ATS resume", "mock interview"],
  authors: [{ name: "autoJob" }],
  creator: "autoJob",
  publisher: "autoJob",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "autoJob - Power Your Career with AI",
    description: "Track job applications, build winning resumes, prepare for interviews, and optimize your LinkedIn profile - all in one AI-powered platform.",
    siteName: "autoJob",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "autoJob - AI-Powered Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "autoJob - Power Your Career with AI",
    description: "Track job applications, build winning resumes, prepare for interviews, and optimize your LinkedIn profile.",
    images: ["/og-image.png"],
    creator: "@autoJob",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}