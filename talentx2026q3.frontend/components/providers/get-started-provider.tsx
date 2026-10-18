'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  GetStartedDialog,
  type GetStartedView,
} from '@/components/common/get-started-dialog'

type GetStartedContextValue = {
  open: (view?: GetStartedView) => void
  close: () => void
}

// Safe no-op default so components (and tests) can call useGetStarted()
// without a provider above them.
const GetStartedContext = createContext<GetStartedContextValue>({
  open: () => {},
  close: () => {},
})

export function useGetStarted() {
  return useContext(GetStartedContext)
}

export function GetStartedProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<GetStartedView>('choose')

  const show = useCallback((nextView: GetStartedView = 'choose') => {
    setView(nextView)
    setOpen(true)
  }, [])

  const hide = useCallback(() => setOpen(false), [])

  const value = useMemo(() => ({ open: show, close: hide }), [show, hide])

  return (
    <GetStartedContext.Provider value={value}>
      {children}
      <GetStartedDialog
        open={open}
        view={view}
        onViewChange={setView}
        onClose={hide}
      />
    </GetStartedContext.Provider>
  )
}
