interface FieldWrapperProps {
  label: string
  htmlFor?: string
  hint?: string
  hintClassName?: string
  hintStyle?: React.CSSProperties
  trailing?: React.ReactNode
  error?: string
  required?: boolean
  children: React.ReactNode
}

// Stable id conventions for a field's error/hint text, so a caller's <input>
// can point `aria-describedby` at whichever one FieldWrapper is about to
// render (error takes priority over hint — see FieldWrapper below).
export function fieldErrorId(htmlFor?: string): string | undefined {
  return htmlFor ? `${htmlFor}-error` : undefined
}

export function fieldHintId(htmlFor?: string): string | undefined {
  return htmlFor ? `${htmlFor}-hint` : undefined
}

export function fieldDescribedBy(htmlFor: string | undefined, hasError: boolean, hasHint: boolean): string | undefined {
  if (hasError) return fieldErrorId(htmlFor)
  if (hasHint) return fieldHintId(htmlFor)
  return undefined
}

export function FieldWrapper({ label, htmlFor, hint, hintClassName, hintStyle, trailing, error, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p id={fieldErrorId(htmlFor)} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={fieldHintId(htmlFor)} className={`text-xs text-slate-500 ${hintClassName ?? ''}`} style={hintStyle}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
