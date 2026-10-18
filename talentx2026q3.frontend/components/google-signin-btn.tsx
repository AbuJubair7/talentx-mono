'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGoogleSignIn } from '@/modules/auth/signup/hooks/use-google-signin'
import { cn } from '@/lib/utils'
import { GOOGLE_CLIENT_ID } from '@/lib/config'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon'
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with'
              shape?: 'rectangular' | 'pill' | 'circle'
              width?: string | number
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

export function GoogleSignInButton({ className }: { className?: string }) {
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const { mutate: googleSignIn, isPending, isSuccess, error } = useGoogleSignIn()

  const isBusy = isPending || isSuccess
  const clientId = GOOGLE_CLIENT_ID

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential && !isBusy) {
        googleSignIn({ idToken: response.credential })
      }
    },
    [googleSignIn, isBusy]
  )

  useEffect(() => {
    if (!clientId) return

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(interval)
        setSdkReady(true)

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        })

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 320,
          })
        }
      }
    }, 150)

    return () => clearInterval(interval)
  }, [clientId, handleCredentialResponse])

  // Fallback / Custom click trigger if native button is not rendered
  const handleCustomClick = () => {
    if (isBusy) return
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt()
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      {/* Loading & Redirecting State */}
      {isBusy && (
        <Button
          type="button"
          disabled
          className={cn(
            'w-full h-11 gap-2.5 bg-white text-slate-800 font-semibold border border-slate-200 shadow-xs transition-all rounded-full cursor-not-allowed opacity-90 mx-auto inline-flex items-center justify-center',
            className
          )}
        >
          <Loader2 className="size-4 animate-spin text-slate-900" />
          <span>{isSuccess ? 'Redirecting to Dashboard...' : 'Signing in with Google...'}</span>
        </Button>
      )}

      {/* Native Google rendered button container (Rounded pill shape) */}
      <div
        ref={googleBtnRef}
        className={cn(
          'flex justify-center items-center w-full min-h-[44px] [&>div]:mx-auto [&_iframe]:!rounded-full',
          (!sdkReady || isBusy) && 'hidden',
          className
        )}
      />

      {/* Fallback clean white rounded button while SDK initializes */}
      {!sdkReady && !isBusy && (
        <Button
          type="button"
          onClick={handleCustomClick}
          disabled={!clientId}
          className={cn(
            'w-full h-11 gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all rounded-full active:scale-[0.99] mx-auto',
            className
          )}
        >
          <GoogleIcon className="size-4 shrink-0" />
          <span>Continue with Google</span>
        </Button>
      )}

      {error && (
        <p className="text-xs text-red-600 text-center font-medium">{error.message}</p>
      )}
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}
