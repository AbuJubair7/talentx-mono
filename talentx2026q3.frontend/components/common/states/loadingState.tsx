'use client'

import { ReactNode } from 'react'

interface LoadingStateProps {
  skeleton?: ReactNode
}

export function LoadingState({ skeleton }: LoadingStateProps) {
  if (skeleton) return <>{skeleton}</>

  return (
    <div className="flex justify-center py-12">
      <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
    </div>
  )
}