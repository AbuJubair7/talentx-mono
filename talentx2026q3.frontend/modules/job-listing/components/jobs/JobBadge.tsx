import type { LucideIcon } from 'lucide-react'

interface JobBadgeProps {
  icon: LucideIcon
  label: string
  /** Slightly stronger text for the one detail worth reading first (salary). */
  emphasis?: boolean
  /** Render the brightened state without a pointer (used for static previews). */
  active?: boolean
}

export function JobBadge({ icon: Icon, label, emphasis = false, active = false }: JobBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-[background-color,border-color] duration-200 ease-out motion-reduce:transition-none ${
        active
          ? 'border-slate-300 bg-white'
          : 'border-slate-200 bg-slate-50 group-hover:border-slate-300 group-hover:bg-white'
      } ${emphasis ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}
    >
      <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" strokeWidth={2} />
      {label}
    </span>
  )
}
