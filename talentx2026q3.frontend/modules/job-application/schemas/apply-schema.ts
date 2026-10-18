import { z } from "zod";

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB, matches the backend's [RequestSizeLimit] on /jobs/application-resumes

export const applyFormSchema = z.object({
  applicantName: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must not exceed 120 characters."),
  applicantEmail: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(255, "Email must not exceed 255 characters.")
    .email("Enter a valid email address."),
  coverLetter: z
    .string()
    .trim()
    .max(4000, "Cover letter must not exceed 4000 characters.")
    .optional(),
  location: z
    .string()
    .trim()
    .max(200, "Location must not exceed 200 characters.")
    .optional(),
  expectedSalary: z
    .string()
    .trim()
    .min(1, "Expected salary is required.")
    .refine(
      (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0),
      "Enter a valid amount (0 or more).",
    ),
  totalYearsExperience: z
    .string()
    .trim()
    .min(1, "Years of experience is required.")
    .refine(
      (v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 60),
      "Enter a number between 0 and 60.",
    ),
  resumeOption: z.enum(["saved", "new"]),
  selectedResumeId: z.string().optional(),
  resumeFile: z.any().optional(),
  saveToLibrary: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.resumeOption === "saved") {
    if (!data.selectedResumeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a saved resume.",
        path: ["selectedResumeId"],
      });
    }
    return;
  }

  if (!data.resumeFile || (typeof File !== 'undefined' && !(data.resumeFile instanceof File))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A new resume file is required.",
      path: ["resumeFile"],
    });
  } else if (data.resumeFile.size > MAX_RESUME_FILE_SIZE_BYTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "File size must not exceed 5 MB.",
      path: ["resumeFile"],
    });
  }
})

export type ApplyFormValues = z.infer<typeof applyFormSchema>;
