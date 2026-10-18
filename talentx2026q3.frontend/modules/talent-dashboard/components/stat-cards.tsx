import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export function StatBar({ label, value, percentage, color }: StatBarProps) {
  return (
    <div className="flex items-center gap-3 px-1 py-1.5">
      <span className="w-24 shrink-0 text-xs font-medium text-slate-500">
        {label}
      </span>
      <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-100">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded transition-all duration-700 ease-out',
            color,
          )}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
        {percentage > 0 && (
          <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-bold text-white/90">
            {percentage}%
          </span>
        )}
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-slate-900">
        {value}
      </span>
    </div>
  );
}
