'use client'

import { ErrorState } from '@/components/common/states'

// Route-level error boundary. Must be a Client Component. Next.js renders
// this when a page throws, and passes reset() to retry the segment.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ErrorState
        title="This page hit a snag"
        description={error.message || 'An unexpected error occurred.'}
        onRetry={reset}
      />
    </div>
  )
}