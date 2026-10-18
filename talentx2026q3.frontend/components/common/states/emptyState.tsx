'use client'

import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  className?: string
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display right now.',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center my-6',
        className
      )}
    >
      <Inbox className="size-10 text-slate-400 mx-auto mb-3" />
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}