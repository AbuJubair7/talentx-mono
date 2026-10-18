'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center my-6',
        className
      )}
    >
      <AlertCircle className="size-10 text-red-500 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{description}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4 h-9 gap-2 text-xs border-red-200 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}