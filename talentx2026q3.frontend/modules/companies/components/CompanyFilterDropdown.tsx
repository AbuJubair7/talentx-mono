'use client';

import { X, type LucideIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface CompanyFilterDropdownOption {
  value: string;
  label: string;
}

interface CompanyFilterDropdownProps {
  /** Filter category shown before the value, e.g. "Size", "Industry", "Sort". */
  label: string;
  icon?: LucideIcon;
  /** Currently selected value. `defaultValue` means "no filter". */
  value: string;
  /** Value treated as unselected. Defaults to `''` (the "All" entry). */
  defaultValue?: string;
  /** Label of the reset entry, e.g. "All Sizes". */
  allLabel?: string;
  /** When false, no reset entry is rendered (for always-selected dropdowns like Sort). */
  showAllOption?: boolean;
  options: readonly CompanyFilterDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const ALL_TOKEN = 'all';

/**
 * Modern dropdown for the companies filter bar, built on the shared shadcn
 * `Select` (Base UI popover) instead of a native `<select>`.
 *
 * - Trigger matches the filter-bar density (compact, rounded-xl) and turns
 *   emerald with an inline clear button while a non-default value is active.
 * - Menu is a rounded-xl popover with a group label, reset entry, and
 *   scrollable options; width follows the trigger and clamps to the viewport
 *   so it stays usable on small screens.
 */
export function CompanyFilterDropdown({
  label,
  icon: Icon,
  value,
  defaultValue = '',
  allLabel = 'All',
  showAllOption = true,
  options,
  onChange,
  ariaLabel,
  align = 'start',
  className,
}: CompanyFilterDropdownProps) {
  const isActive = value !== defaultValue;
  const displayLabel = isActive
    ? (options.find((option) => option.value === value)?.label ?? value)
    : allLabel;

  const handleClear = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();
    clickEvent.preventDefault();
    onChange(defaultValue);
  };

  return (
    <div className={cn('inline-flex min-w-0 flex-1 items-center sm:flex-none', className)}>
      <Select
        value={showAllOption && !isActive ? ALL_TOKEN : value}
        onValueChange={(selectedValue) => {
          if (selectedValue === null || (showAllOption && selectedValue === ALL_TOKEN)) {
            onChange(defaultValue);
          } else {
            onChange(selectedValue);
          }
        }}
      >
        <SelectTrigger
          aria-label={ariaLabel ?? `${label} filter`}
          className={cn(
            'w-full min-w-0 gap-1.5 rounded-xl border-slate-200 bg-white px-2.5 text-xs font-medium shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto',
            isActive &&
              'border-emerald-300 bg-emerald-50 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100/60',
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
            {Icon && (
              <Icon
                className={cn('size-3.5 shrink-0', isActive ? 'text-emerald-700' : 'text-slate-400')}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                'shrink-0 text-xs font-normal',
                isActive ? 'text-emerald-800' : 'text-slate-400',
              )}
            >
              {label}:
            </span>
            <span
              className={cn(
                'truncate text-xs',
                isActive ? 'font-bold text-emerald-950' : 'font-medium text-slate-700',
              )}
            >
              {displayLabel}
            </span>
            {isActive && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                    handleClear(keyboardEvent as unknown as React.MouseEvent);
                  }
                }}
                aria-label={`Clear ${label} filter`}
                className="ml-0.5 shrink-0 rounded-full p-0.5 text-emerald-700 transition-colors hover:bg-emerald-200/70 hover:text-emerald-950 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <X className="size-3" aria-hidden="true" />
              </span>
            )}
          </span>
        </SelectTrigger>

        <SelectContent
          side="bottom"
          sideOffset={6}
          align={align}
          alignItemWithTrigger={false}
          className="z-50 max-w-[calc(100vw-2rem)] min-w-44 rounded-xl border-slate-200 p-1 shadow-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <SelectGroup>
            <SelectLabel className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {label}
            </SelectLabel>

            {showAllOption && (
              <>
                <SelectItem
                  value={ALL_TOKEN}
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-xs text-slate-600 transition-colors outline-none hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900"
                >
                  {allLabel}
                </SelectItem>
                <SelectSeparator className="my-1 bg-slate-100" />
              </>
            )}

            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 transition-colors outline-none hover:bg-emerald-50/80 hover:text-emerald-950 focus:bg-emerald-50 focus:text-emerald-950"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
