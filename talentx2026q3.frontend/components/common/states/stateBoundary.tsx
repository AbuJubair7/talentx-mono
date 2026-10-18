'use client'

import { ReactNode } from 'react'
import { LoadingState } from './loadingState'
import { ErrorState } from './errorState'
import { EmptyState } from './emptyState'

interface StateBoundaryProps {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  onRetry?: () => void
  skeleton?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyClassName?: string
  errorTitle?: string
  errorDescription?: string
  errorClassName?: string
  children: ReactNode
}

export function StateBoundary({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  skeleton,
  emptyTitle,
  emptyDescription,
  emptyClassName,
  errorTitle,
  errorDescription,
  errorClassName,
  children,
}: StateBoundaryProps) {
  if (isLoading) return <LoadingState skeleton={skeleton} />
  if (isError) return <ErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} className={errorClassName} />
  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} className={emptyClassName} />

  return <>{children}</>
}