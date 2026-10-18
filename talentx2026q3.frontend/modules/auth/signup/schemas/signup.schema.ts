import { z } from 'zod'

export const employerSignupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name (at least 2 characters)'),
    email: z.string().trim().email('Please enter a valid work email address'),
    companyName: z.string().trim().min(2, 'Please enter your company or organization name'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[\d\W]/, 'Must include at least one digit or special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type EmployerSignupFormValues = z.infer<typeof employerSignupSchema>
