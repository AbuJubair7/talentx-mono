import { getChangedFields, stringListsEqual } from "./get-changed-fields"

interface OriginalDto {
  title: string
  tags: string[]
}

interface FormValues {
  title: string
  tags: string[]
}

interface Payload {
  publish: boolean
  title?: string
  tags?: string[]
}

const original: OriginalDto = { title: "Backend Engineer", tags: ["C#", "SQL"] }
const values: FormValues = { title: "Backend Engineer", tags: ["C#", "SQL"] }

describe("getChangedFields (generic engine)", () => {
  it("returns only the alwaysIncluded fields when nothing changed", () => {
    const result = getChangedFields<OriginalDto, FormValues, Payload>(
      original,
      values,
      {
        title: { getOriginalValue: (o) => o.title, getCurrentValue: (c) => c.title },
        tags: { getOriginalValue: (o) => o.tags, getCurrentValue: (c) => c.tags, isEqual: (a, b) => stringListsEqual(a as string[], b as string[]) },
      },
      { publish: false }
    )
    expect(result).toEqual({ publish: false })
  })

  it("includes a scalar field that changed", () => {
    const result = getChangedFields<OriginalDto, FormValues, Payload>(
      original,
      { ...values, title: "Staff Engineer" },
      { title: { getOriginalValue: (o) => o.title, getCurrentValue: (c) => c.title } },
      { publish: false }
    )
    expect(result).toEqual({ publish: false, title: "Staff Engineer" })
  })

  it("applies toPayloadValue only to fields that changed", () => {
    const result = getChangedFields<OriginalDto, FormValues, Payload>(
      original,
      { ...values, title: "staff engineer" },
      {
        title: {
          getOriginalValue: (o) => o.title,
          getCurrentValue: (c) => c.title,
          toPayloadValue: (value) => (value as string).toUpperCase(),
        },
      },
      { publish: false }
    )
    expect(result).toEqual({ publish: false, title: "STAFF ENGINEER" })
  })

  it("uses a custom isEqual comparator when supplied", () => {
    const result = getChangedFields<OriginalDto, FormValues, Payload>(
      original,
      { ...values, tags: ["SQL", "C#"] },
      { tags: { getOriginalValue: (o) => o.tags, getCurrentValue: (c) => c.tags, isEqual: (a, b) => stringListsEqual(a as string[], b as string[]) } },
      { publish: false }
    )
    expect(result).toEqual({ publish: false })
  })

  it("flags a field whose custom isEqual reports a real change", () => {
    const result = getChangedFields<OriginalDto, FormValues, Payload>(
      original,
      { ...values, tags: ["C#", "SQL", "Docker"] },
      { tags: { getOriginalValue: (o) => o.tags, getCurrentValue: (c) => c.tags, isEqual: (a, b) => stringListsEqual(a as string[], b as string[]) } },
      { publish: false }
    )
    expect(result).toEqual({ publish: false, tags: ["C#", "SQL", "Docker"] })
  })
})

describe("stringListsEqual", () => {
  it("treats reordered entries as equal", () => {
    expect(stringListsEqual(["C#", "SQL"], ["SQL", "C#"])).toBe(true)
  })

  it("is case-insensitive", () => {
    expect(stringListsEqual(["c#"], ["C#"])).toBe(true)
  })

  it("detects an actual addition", () => {
    expect(stringListsEqual(["C#"], ["C#", "SQL"])).toBe(false)
  })
})
