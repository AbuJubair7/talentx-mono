export function Initials({ value }: { value: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
      {value}
    </span>
  )
}
