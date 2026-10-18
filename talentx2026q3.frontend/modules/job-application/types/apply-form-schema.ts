import { z } from "zod"

export function createApplyFormSchema(requiresLocation: boolean, resumeRequired = true) {
  const locationSchema = requiresLocation
    ? z
        .string()
        .trim()
        .min(2, "Location is required for this role.")
        .max(200, "Location must not exceed 200 characters.")
        .regex(/[a-zA-Z]/, "Location cannot be purely numeric.")
    : z
        .string()
        .trim()
        .max(200, "Location must not exceed 200 characters.")
        .optional()

  return z.object({
    applicantName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(120, "Name must not exceed 120 characters.")
      .regex(/[a-zA-Z]/, "Name must contain at least one letter."),
    applicantEmail: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Invalid email format.")
      .max(255, "Email must not exceed 255 characters."),
    location: locationSchema,
    coverLetter: z
      .string()
      .trim()
      .min(2, "Cover letter must be at least 2 characters.")
      .max(4000, "Cover letter must not exceed 4000 characters."),
    expectedSalary: z
      .number({ message: "Expected monthly salary is required." })
      .positive("Expected salary must be greater than zero."),
    totalYearsExperience: z
      .number({ message: "Total years of experience is required." })
      .min(0, "Years of experience cannot be negative.")
      .max(80, "Years of experience must not exceed 80."),
    resumeStorageKey: resumeRequired
      ? z.string().min(1, "Resume is required.")
      : z.string(),
  })
}

export type ApplyFormValues = z.infer<ReturnType<typeof createApplyFormSchema>>