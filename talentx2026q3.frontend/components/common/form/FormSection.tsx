import { eyebrowLabelClass } from "./field-styles"

interface FormSectionProps {
  eyebrow: string
  title: string
  description: string
  step: number
  children: React.ReactNode
}

export function FormSection({ eyebrow, title, description, step, children }: FormSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <span className={`${eyebrowLabelClass} text-emerald-600`}>{eyebrow}</span>
          <h2 className="mt-1 text-base font-bold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
        <span className="font-mono text-xs font-bold text-slate-500">0{step}</span>
      </header>
      <div className="flex flex-col gap-5 px-5 py-5">{children}</div>
    </section>
  )
}
