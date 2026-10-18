import { ArrowDown } from 'lucide-react'

export function StepConnector() {
  return (
    <div aria-hidden="true" className="relative flex h-24 items-center justify-center lg:h-32">
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
      <span className="relative flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_0_0_6px_rgba(16,185,129,0.10),0_6px_14px_rgba(4,120,87,0.30)]">
        <ArrowDown className="size-5" strokeWidth={2.5} />
      </span>
    </div>
  )
}

export function StepRail() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
    >
      <span className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.35)]" />
      <span className="animate-rail-flow absolute inset-0" />
    </span>
  )
}
