export type MatchLabel = 'Strong match' | 'Good match' | 'Partial match'

const styles: Record<MatchLabel, string> = {
  'Strong match': 'bg-emerald-50 text-emerald-800',
  'Good match': 'bg-slate-100 text-slate-900',
  'Partial match': 'bg-amber-50 text-amber-700',
}

export function MatchBadge({ label }: { label: MatchLabel }) {
  return (
    <span
      className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold ${styles[label]}`}
    >
      {label}
    </span>
  )
}
