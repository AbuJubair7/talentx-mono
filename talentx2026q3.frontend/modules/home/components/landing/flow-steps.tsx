import { ChevronRight } from 'lucide-react'

type FlowStepsProps = {
  steps: string[]
}

export function FlowSteps({ steps }: FlowStepsProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2" aria-label="How it flows">
      {steps.map((step, i) => {
        const last = i === steps.length - 1
        return (
          <li key={step} className="flex items-center gap-1.5">
            <span
              className={`whitespace-nowrap rounded-md border px-2 py-1 text-xs font-medium ${
                last
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {step}
            </span>
            {!last && <ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}
