import { z } from 'zod';
import {
  COMPANY_SIZE_VALUES,
  INDUSTRY_OPTIONS,
} from '../types/company-profile.types';

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'URL is too long')
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const urlToCheck = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        new URL(urlToCheck);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid URL' }
  )
  .optional()
  .or(z.literal(''));

export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(150, 'Company name cannot exceed 150 characters'),
  logoUrl: z.string().nullable().optional(),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  industry: z.enum(INDUSTRY_OPTIONS).optional().or(z.literal('')),
  companySize: z.enum(COMPANY_SIZE_VALUES).optional().or(z.literal('')),
  website: optionalUrl,
  location: z.string().max(200, 'Location is too long').optional().or(z.literal('')),
  linkedin: optionalUrl,
  twitter: optionalUrl,
  facebook: optionalUrl,
  slug: z.string().trim().max(150).optional().or(z.literal('')),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
