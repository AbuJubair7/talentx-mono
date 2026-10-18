import { z } from 'zod'

export const onboardingProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Please enter your full name')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    companyName: z
      .string()
      .min(2, 'Please enter your company or organization name')
      .max(150, 'Company name cannot exceed 150 characters')
      .trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type OnboardingProfileFormValues = z.infer<typeof onboardingProfileSchema>
