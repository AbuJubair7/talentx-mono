import React from "react"

interface SectionProps {
  step: number
  title: string
  description: string
  required?: boolean
  children: React.ReactNode
}

export function Section({ step, title, description, required = false, children }: SectionProps) {
  return (
    <section className="border-t border-slate-200 px-6 py-7 first:border-t-0 sm:px-8">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 font-mono text-[11px] text-slate-500">
          {step}
        </span>
        <div>
          <h2 className="font-sans text-base font-bold tracking-tight text-slate-900">
            {title}
            {required ? (
              <span className="ml-0.5 text-red-500" aria-hidden="true">
                *
              </span>
            ) : null}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 sm:pl-9">{children}</div>
    </section>
  )
}
