'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  SignInDialog,
  type SignInView,
} from '@/components/common/sign-in-dialog'

type SignInContextValue = {
  open: (view?: SignInView) => void
  close: () => void
}

// Safe no-op default so components (and tests) can call useSignIn()
// without a provider above them.
const SignInContext = createContext<SignInContextValue>({
  open: () => {},
  close: () => {},
})

export function useSignIn() {
  return useContext(SignInContext)
}

export function SignInProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<SignInView>('choose')

  const show = useCallback((nextView: SignInView = 'choose') => {
    setView(nextView)
    setOpen(true)
  }, [])

  const hide = useCallback(() => setOpen(false), [])

  const value = useMemo(() => ({ open: show, close: hide }), [show, hide])

  return (
    <SignInContext.Provider value={value}>
      {children}
      <SignInDialog
        open={open}
        view={view}
        onViewChange={setView}
        onClose={hide}
      />
    </SignInContext.Provider>
  )
}
