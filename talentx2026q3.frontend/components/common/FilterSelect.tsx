import { LucideIcon, X } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterSelectProps<T extends string> {
  icon?: LucideIcon
  value: T | ''
  onChange: (value: T | '') => void
  options: readonly T[]
  allLabel?: string

  /** Filter category title, e.g. "Type", "Experience", "Work Mode" */
  label: string

  /** Optional map of value → human-readable display label. Falls back to raw value. */
  labels?: Partial<Record<T, string>>

  className?: string
  triggerClassName?: string
}

export function FilterSelect<T extends string>({
  icon: Icon,
  value,
  onChange,
  options,
  allLabel = 'All',
  label,
  labels,
  className = '',
  triggerClassName,
}: FilterSelectProps<T>) {
  const isSelected = Boolean(value) && value !== 'all'

  const displayValue = isSelected
    ? (labels?.[value as T] ?? value)
    : allLabel

  const handleClear = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation()
    clickEvent.preventDefault()
    onChange('')
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Select
        value={value || 'all'}
        onValueChange={(selectedValue) =>
          onChange(selectedValue === 'all' ? '' : (selectedValue as T))
        }
      >
        <SelectTrigger
          className={cn(
            'h-11 w-auto min-w-fit gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
            isSelected
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-2xs hover:bg-emerald-100/60 hover:border-emerald-400'
              : 'border-slate-200 bg-slate-50/70 text-slate-700 shadow-2xs hover:bg-white hover:border-slate-300',
            triggerClassName
          )}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {Icon && (
              <Icon
                className={`size-3.5 shrink-0 ${
                  isSelected
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              />
            )}

            {label ? (
              <span
                className={
                  isSelected
                    ? 'text-emerald-800 text-xs font-normal'
                    : 'text-slate-400 text-xs font-normal'
                }
              >
                {label}:
              </span>
            ) : null}

            <span
              className={`text-xs ${
                isSelected
                  ? 'font-bold text-emerald-950'
                  : 'font-medium text-slate-700'
              }`}
            >
              {displayValue}
            </span>

            {isSelected && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                    handleClear(keyboardEvent as unknown as React.MouseEvent)
                  }
                }}
                aria-label={`Clear ${label} filter`}
                className="ml-1 rounded-full p-0.5 text-emerald-700 hover:bg-emerald-200/70 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                <X className="size-3" />
              </span>
            )}
          </div>
        </SelectTrigger>

        <SelectContent
          side="bottom"
          sideOffset={6}
          align="start"
          alignItemWithTrigger={false}
          className="z-50 min-w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          <SelectGroup>
            <SelectLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </SelectLabel>

            <SelectItem
              value="all"
              className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
            >
              All {label}
            </SelectItem>

            <SelectSeparator className="my-1 bg-slate-100" />

            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-emerald-50/80 hover:text-emerald-950 focus:bg-emerald-50 focus:text-emerald-950"
              >
                {labels?.[option] ?? option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}