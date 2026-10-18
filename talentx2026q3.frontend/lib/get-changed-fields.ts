// Generic partial-update-payload diff engine, promoted out of
// modules/jobposting. Deliberately has no reference — not even a type-only
// one — to any feature module's DTOs: each consumer (modules/jobposting,
// modules/talent-profile) supplies its own field-mapping config and calls
// this with its own type parameters, so the shared piece stays reusable
// instead of coupling this file back to one feature's shape.
export interface FieldDiffRule<TOriginal, TFormValues, TPayloadValue> {
  getOriginalValue: (original: TOriginal) => unknown
  getCurrentValue: (current: TFormValues) => unknown
  isEqual?: (originalValue: unknown, currentValue: unknown) => boolean
  toPayloadValue?: (currentValue: unknown) => TPayloadValue
}

export type FieldDiffRules<TOriginal, TFormValues, TPayload> = {
  [Field in keyof TPayload]?: FieldDiffRule<TOriginal, TFormValues, TPayload[Field]>
}

// Compares the originally-fetched DTO against the current form values, field
// by field per the supplied rules, and returns only the fields that actually
// changed. `alwaysIncluded` seeds fields that must always be sent regardless
// of whether they changed (e.g. a field the backend's validator requires
// non-empty on every request, or a fixed action flag like `publish`).
export function getChangedFields<TOriginal, TFormValues, TPayload extends object>(
  original: TOriginal,
  current: TFormValues,
  rules: FieldDiffRules<TOriginal, TFormValues, TPayload>,
  alwaysIncluded: Partial<TPayload> = {}
): TPayload {
  const changed = { ...alwaysIncluded } as TPayload

  ;(Object.keys(rules) as (keyof TPayload)[]).forEach((field) => {
    const rule = rules[field]
    if (!rule) return

    const originalValue = rule.getOriginalValue(original)
    const currentValue = rule.getCurrentValue(current)
    const valuesAreEqual = rule.isEqual
      ? rule.isEqual(originalValue, currentValue)
      : originalValue === currentValue

    if (!valuesAreEqual) {
      changed[field] = rule.toPayloadValue
        ? rule.toPayloadValue(currentValue)
        : (currentValue as TPayload[typeof field])
    }
  })

  return changed
}

export function normalizeStringList(values: string[]): string[] {
  return [...values]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .sort()
}

// Order-insensitive, case-insensitive string-array equality — shared by every
// tag-array field (job skills, additional URLs, skill propositions, etc.).
export function stringListsEqual(a: string[], b: string[]): boolean {
  return JSON.stringify(normalizeStringList(a)) === JSON.stringify(normalizeStringList(b))
}
