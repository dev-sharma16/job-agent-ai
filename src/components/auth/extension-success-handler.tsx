"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"

function ExtensionSuccessHandlerInner() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const isExtension = searchParams.get("extension") === "true"
  const extensionId = searchParams.get("extId")

  useEffect(() => {
    const userId = session?.user?.id
    if (isExtension && userId && extensionId) {
      try {
        if (typeof window !== 'undefined' && (window as any).chrome?.runtime?.sendMessageExternal) {
          (window as any).chrome.runtime.sendMessageExternal(extensionId, {
            type: 'AUTOJOB_AUTH_SUCCESS',
            userId
          }, () => {
            if ((window as any).chrome?.runtime?.lastError) {
              console.log('Extension messaging failed, falling back to postMessage:', (window as any).chrome.runtime.lastError.message)
              window.opener?.postMessage({
                type: 'AUTOJOB_AUTH_SUCCESS',
                userId
              }, '*')
            }
            window.close()
          })
        } else {
          throw new Error('Chrome runtime not available')
        }
      } catch {
        window.opener?.postMessage({
          type: 'AUTOJOB_AUTH_SUCCESS',
          userId
        }, '*')
        window.close()
      }
    }
  }, [isExtension, session, extensionId])

  return null
}

export function ExtensionSuccessHandler() {
  return (
    <SessionProvider>
      <ExtensionSuccessHandlerInner />
    </SessionProvider>
  )
}