import type { LucideIcon } from 'lucide-react'

interface FeedMessageProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  role?: 'alert' | 'status'
}

export function FeedMessage({ icon: Icon, title, description, action, role = 'status' }: FeedMessageProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Icon className="size-5 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold tracking-[-0.01em] text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
