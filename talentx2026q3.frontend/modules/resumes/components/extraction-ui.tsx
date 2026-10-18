'use client'

import type { ComponentType, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

import { MonthYearPicker } from '@/components/common/MonthYearPicker'
import { cn } from '@/lib/utils'

export const extractionInputClass =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-500/50 hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 aria-invalid:border-rose-400'

interface ExtractionSectionHeaderProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
  count?: number
  action?: ReactNode
}

export function ExtractionSectionHeader({
  icon: Icon,
  title,
  description,
  count,
  action,
}: ExtractionSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/70">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
            {typeof count === 'number' ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">
                {count}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

interface ExtractionFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ComponentType<{ className?: string }>
}

export function ExtractionField({ label, icon: Icon, className, ...props }: ExtractionFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <span className="relative block">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        ) : null}
        <input
          {...props}
          className={cn(extractionInputClass, Icon ? 'pl-10 pr-3.5' : 'px-3.5', className)}
        />
      </span>
    </label>
  )
}

interface ExtractionDateFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  placeholder?: string
}

export function ExtractionDateField({
  label,
  value,
  onChange,
  id,
  disabled,
  placeholder,
}: ExtractionDateFieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId

  return (
    <div>
      <label htmlFor={controlId} className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      <MonthYearPicker
        id={controlId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  )
}

interface ExtractionEmptyStateProps {
  icon: ComponentType<{ className?: string }>
  message: string
  hint?: string
}

export function ExtractionEmptyState({ icon: Icon, message, hint }: ExtractionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

interface ExtractionTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function ExtractionTextarea({ label, className, ...props }: ExtractionTextareaProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <textarea
        {...props}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-500/50 hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 aria-invalid:border-rose-400',
          className
        )}
      />
    </label>
  )
}
