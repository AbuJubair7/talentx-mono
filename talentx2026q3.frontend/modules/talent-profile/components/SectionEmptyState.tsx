import type { ElementType } from "react"

export interface SectionEmptyStateProps {
  icon: ElementType
  title: string
  description: string
}

export function SectionEmptyState({
  icon: Icon,
  title,
  description,
}: SectionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <span className="text-emerald-700">
          <Icon aria-hidden="true" className="h-6 w-6 text-emerald-700" />
        </span>
      </div>
      <h3 className="mb-2 text-lg font-medium text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}
