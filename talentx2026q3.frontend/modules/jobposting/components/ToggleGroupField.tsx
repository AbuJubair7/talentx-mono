import { FieldWrapper } from "./FieldWrapper"

interface ToggleGroupFieldOption<T extends string> {
  value: T
  label: string
}

interface ToggleGroupFieldProps<T extends string> {
  label: string
  value: T
  options: ToggleGroupFieldOption<T>[]
  onChange: (value: T) => void
  error?: string
  required?: boolean
}

export function ToggleGroupField<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  required,
}: ToggleGroupFieldProps<T>) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
              ].join(" ")}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </FieldWrapper>
  )
}
