type MockFrameProps = {
  title?: string
  meta?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function MockFrame({ title, meta, children, className = '' }: MockFrameProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
          <span className="truncate text-xs font-bold text-slate-900">{title}</span>
          {meta && <span className="shrink-0 text-xs text-slate-500">{meta}</span>}
        </div>
      )}
      {children}
    </div>
  )
}
