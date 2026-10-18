import { applyFormSchema, MAX_RESUME_FILE_SIZE_BYTES } from "../schemas/apply-schema"

const validResumeFile = new File(["resume"], "cv.pdf", { type: "application/pdf" })

const validSaved = {
  applicantName: "Jane Talent",
  applicantEmail: "jane@example.com",
  coverLetter: "Keen to join.",
  location: "Dhaka",
  expectedSalary: "90000",
  totalYearsExperience: "5",
  resumeOption: "saved" as const,
  selectedResumeId: "resume-1",
}

const validNew = {
  ...validSaved,
  resumeOption: "new" as const,
  selectedResumeId: "",
  resumeFile: validResumeFile,
}

describe("applyFormSchema", () => {
  it("accepts a valid form using a saved resume", () => {
    expect(applyFormSchema.safeParse(validSaved).success).toBe(true)
  })

  it("accepts a valid form uploading a new resume", () => {
    expect(applyFormSchema.safeParse(validNew).success).toBe(true)
  })

  it("accepts empty optional fields", () => {
    const result = applyFormSchema.safeParse({
      ...validSaved,
      coverLetter: "",
      location: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a saved resume option without a selected resume", () => {
    expect(
      applyFormSchema.safeParse({ ...validSaved, selectedResumeId: "" }).success,
    ).toBe(false)
  })

  it("rejects a new resume option without a file", () => {
    expect(
      applyFormSchema.safeParse({ ...validNew, resumeFile: undefined }).success,
    ).toBe(false)
  })

  it("rejects a new resume file above the size limit", () => {
    const oversized = new File([new Uint8Array(MAX_RESUME_FILE_SIZE_BYTES + 1)], "big.pdf", {
      type: "application/pdf",
    })
    expect(
      applyFormSchema.safeParse({ ...validNew, resumeFile: oversized }).success,
    ).toBe(false)
  })

  it("rejects a missing name", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, applicantName: "" }).success).toBe(false)
  })

  it("rejects an invalid email", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, applicantEmail: "nope" }).success).toBe(false)
  })

  it("rejects a negative salary", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, expectedSalary: "-1" }).success).toBe(false)
  })

  it("rejects years of experience above 60", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, totalYearsExperience: "61" }).success).toBe(false)
  })

  it("rejects an empty expected salary", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, expectedSalary: "" }).success).toBe(false)
  })

  it("rejects an empty years of experience", () => {
    expect(applyFormSchema.safeParse({ ...validSaved, totalYearsExperience: "" }).success).toBe(false)
  })
})
