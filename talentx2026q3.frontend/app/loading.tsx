import { LoadingState } from '@/components/common/states'

// Route-level loading UI. Next.js shows this during navigation while a
// page's data resolves. Complements the in-component StateBoundary.
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <LoadingState />
    </div>
  )
}