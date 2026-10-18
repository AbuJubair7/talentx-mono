
import { LucideIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FieldWrapper } from "./FieldWrapper"

interface SelectFieldOption<T extends string> {
  value: T
  label: string
}

interface SelectFieldProps<T extends string> {
  id: string
  label: string
  value: T | undefined
  options: SelectFieldOption<T>[]
  onChange: (value: T) => void
  error?: string
  required?: boolean
  placeholder?: string
  icon?: LucideIcon
  iconClassName?: string
}

export function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required,
  placeholder = "Select...",
  icon: Icon,
  iconClassName,
}: SelectFieldProps<T>) {
  const selectedOption = options.find((o) => o.value === value)

  return (
    <FieldWrapper label={label} htmlFor={id} error={error} required={required}>
      <div className="group relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute z-10 h-4 w-4 text-slate-400 transition-colors duration-200 group-hover:text-slate-600 ${
              iconClassName ?? "left-3 top-1/2 -translate-y-1/2"
            }`}
          />
        )}

        {/* Always pass a defined string ("" when unset) so the underlying Select
            is controlled from its very first render — passing `undefined` here
            makes Base UI treat it as uncontrolled, then it warns/misbehaves the
            moment a real value is set later (e.g. Salary Type starts unset). */}
        <Select value={value ?? ""} onValueChange={(val) => onChange(val as T)}>
          <SelectTrigger
            id={id}
            className={`h-auto w-full rounded-md border border-slate-300 bg-slate-50/80 py-3 pr-10 text-sm font-medium shadow-sm transition-all duration-200 hover:border-slate-500 hover:shadow hover:bg-white focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0 ${
              Icon ? "pl-11" : "pl-3.5"
            } ${selectedOption ? "text-slate-900" : "text-slate-400"} ${
              error ? "border-red-300 focus:border-red-400 focus:ring-0" : ""
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent
            side="bottom"
            sideOffset={8}
            align="start"
            alignItemWithTrigger={false}
            className="z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:bg-slate-100 focus:text-slate-900"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FieldWrapper>
  )
}

