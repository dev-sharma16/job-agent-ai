"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"

function ExtensionSuccessHandlerInner() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const isExtension = searchParams.get("extension") === "true"

  useEffect(() => {
    if (isExtension && session?.user && window.opener) {
      window.opener.postMessage({
        type: 'AUTOJOB_AUTH_SUCCESS',
        userId: session.user.id
      }, '*')
      window.close()
    }
  }, [isExtension, session])

  return null
}

export function ExtensionSuccessHandler() {
  return (
    <SessionProvider>
      <ExtensionSuccessHandlerInner />
    </SessionProvider>
  )
}