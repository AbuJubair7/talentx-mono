import { createApplyFormSchema } from '../types/apply-form-schema'

const nonRemoteSchema = createApplyFormSchema(true)
const remoteSchema = createApplyFormSchema(false)
const validPayload = {
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  location: 'Dhaka, Bangladesh',
  coverLetter: 'I would love to join your team.',
  expectedSalary: 85000,
  totalYearsExperience: 6,
  resumeStorageKey: 'uploads/resume.pdf',
}

const zodErrors = (value: unknown, schema: ReturnType<typeof createApplyFormSchema>) => {
  const result = schema.safeParse(value)
  if (result.success) return []
  return result.error.issues.map((issue) => issue.message)
}

describe('createApplyFormSchema', () => {
  it('accepts a valid application for a non-remote job', () => {
    const result = nonRemoteSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('accepts a valid application for a remote job without a location', () => {
    const { location: _location, ...withoutLocation } = validPayload
    const result = remoteSchema.safeParse(withoutLocation)
    expect(result.success).toBe(true)
  })

  it('accepts an empty location for a remote job', () => {
    const result = remoteSchema.safeParse({ ...validPayload, location: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing location when the job is not remote', () => {
    const errors = zodErrors(
      { ...validPayload, location: '' },
      nonRemoteSchema
    )
    expect(errors).toContain('Location is required for this role.')
  })

  it('rejects a purely numeric location', () => {
    const errors = zodErrors(
      { ...validPayload, location: '12345' },
      nonRemoteSchema
    )
    expect(errors).toContain('Location cannot be purely numeric.')
  })

  it('rejects a name that is too short or has no letters', () => {
    const errors = zodErrors({ ...validPayload, applicantName: 'J' }, nonRemoteSchema)
    expect(errors).toContain('Name must be at least 2 characters.')

    const noLetters = zodErrors({ ...validPayload, applicantName: '123' }, nonRemoteSchema)
    expect(noLetters).toContain('Name must contain at least one letter.')
  })

  it('rejects an invalid email address', () => {
    const errors = zodErrors({ ...validPayload, applicantEmail: 'not-an-email' }, nonRemoteSchema)
    expect(errors).toContain('Invalid email format.')
  })

  it('rejects an empty cover letter', () => {
    const errors = zodErrors({ ...validPayload, coverLetter: '  ' }, nonRemoteSchema)
    expect(errors).toContain('Cover letter must be at least 2 characters.')
  })

  it('rejects non-positive salary', () => {
    const errors = zodErrors({ ...validPayload, expectedSalary: 0 }, nonRemoteSchema)
    expect(errors).toContain('Expected salary must be greater than zero.')
  })

  it('rejects negative experience and experience above 80 years', () => {
    const negative = zodErrors({ ...validPayload, totalYearsExperience: -1 }, nonRemoteSchema)
    expect(negative).toContain('Years of experience cannot be negative.')

    const tooMuch = zodErrors({ ...validPayload, totalYearsExperience: 81 }, nonRemoteSchema)
    expect(tooMuch).toContain('Years of experience must not exceed 80.')

    const boundary = nonRemoteSchema.safeParse({ ...validPayload, totalYearsExperience: 80 })
    expect(boundary.success).toBe(true)
  })

  it('rejects a missing resume storage key', () => {
    const errors = zodErrors(
      { ...validPayload, resumeStorageKey: '' },
      nonRemoteSchema
    )
    expect(errors).toContain('Resume is required.')
  })

  it('accepts an empty resume storage key when the resume step was skipped', () => {
    const skipResumeSchema = createApplyFormSchema(true, false)
    const result = skipResumeSchema.safeParse({ ...validPayload, resumeStorageKey: '' })
    expect(result.success).toBe(true)
  })

  it('enforces the cover letter length limit', () => {
    const overLimit = zodErrors(
      { ...validPayload, coverLetter: 'a'.repeat(4001) },
      nonRemoteSchema
    )
    expect(overLimit).toContain('Cover letter must not exceed 4000 characters.')

    const atLimit = nonRemoteSchema.safeParse({ ...validPayload, coverLetter: 'a'.repeat(4000) })
    expect(atLimit.success).toBe(true)
  })
})