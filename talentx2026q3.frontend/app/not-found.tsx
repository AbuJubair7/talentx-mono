import Link from 'next/link'
import { EmptyState } from '@/components/common/states'

// Global 404. A page can call notFound() (e.g. invalid job id) to trigger this.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
      />
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-emerald-600">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}