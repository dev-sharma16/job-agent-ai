"use client"

import { Providers } from "@/app/providers"
import { ReactNode } from "react"

export default function MarketingLayout({
  children,
}: {
  children: ReactNode
}) {
  return <Providers>{children}</Providers>
}