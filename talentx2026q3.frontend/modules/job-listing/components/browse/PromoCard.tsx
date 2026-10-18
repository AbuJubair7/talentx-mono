import Link from 'next/link'
import { FileText } from 'lucide-react'

export function PromoCard() {
  return (
    <section
      aria-labelledby="promo-heading"
      className="rounded-2xl bg-slate-900 p-5 text-white shadow-[0_12px_32px_-16px_rgba(15,23,42,0.6)]"
    >
      <p className="text-xs font-medium text-slate-400">Boost Your Visibility</p>
      <h2 id="promo-heading" className="mt-2 text-lg font-semibold leading-snug tracking-[-0.015em]">
        Keep Your Resume Up to Date
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Employers see your latest resume and profile when you apply. Make sure yours is current.
      </p>
      <Link
        href="/profile?tab=media-resume"
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 motion-reduce:transition-none"
      >
        <FileText className="size-4" aria-hidden="true" />
        Update Resume
      </Link>
    </section>
  )
}
