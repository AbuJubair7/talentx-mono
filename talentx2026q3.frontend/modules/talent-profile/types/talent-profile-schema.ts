import { z } from "zod"

function isValidHttpUrl(value: string): boolean {
  if (value.trim() === "") return true
  try {
    const url = new URL(value.trim())
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// Structural rules only — mirrors the backend's FluentValidation rules on
// UpdateTalentProfileCommand.
export const talentProfileFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120, "Name must not exceed 120 characters."),
  location: z.string().trim().max(200, "Location must not exceed 200 characters."),
  tagline: z.string().trim().max(160, "Tagline must not exceed 160 characters."),
  shortBio: z.string().trim().max(1000, "Bio must not exceed 1000 characters."),
  phone: z.string().trim().max(40, "Phone must not exceed 40 characters."),
  linkedInUrl: z
    .string()
    .trim()
    .max(500, "LinkedIn URL must not exceed 500 characters.")
    .refine(isValidHttpUrl, "Enter a valid LinkedIn URL."),
  additionalUrls: z.array(
    z
      .string()
      .trim()
      .min(1, "URL entries cannot be blank.")
      .refine(isValidHttpUrl, "Enter a valid URL.")
  ),
  totalYearsExperience: z
    .number({ message: "Enter a valid number." })
    .nonnegative("Must be zero or greater.")
    .nullable(),
  expectedSalary: z
    .number({ message: "Enter a valid number." })
    .nonnegative("Must be zero or greater.")
    .nullable(),
  skillPropositions: z.array(z.string().trim().min(1, "Skill entries cannot be blank.")),
})

export type TalentProfileFormValues = z.infer<typeof talentProfileFormSchema>
