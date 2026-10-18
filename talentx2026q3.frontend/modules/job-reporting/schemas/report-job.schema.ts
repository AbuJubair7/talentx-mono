import { z } from 'zod';
import {
  MAX_ADDITIONAL_DETAILS_LENGTH,
  MIN_ADDITIONAL_DETAILS_LENGTH,
  REPORT_REASONS,
} from '../constants/job-reporting.constants';
import type { JobReportReason } from '../types/job-reporting.types';

const validReasons = REPORT_REASONS.map((r) => r.value) as [JobReportReason, ...JobReportReason[]];

export const reportJobSchema = z
  .object({
    reason: z.enum(validReasons, {
      message: 'Please select a reason for reporting.',
    }),
    additionalDetails: z
      .string()
      .max(MAX_ADDITIONAL_DETAILS_LENGTH, `Details cannot exceed ${MAX_ADDITIONAL_DETAILS_LENGTH} characters.`)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const trimmed = data.additionalDetails?.trim();
    if (data.reason === 'Other') {
      if (!trimmed || trimmed.length < MIN_ADDITIONAL_DETAILS_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['additionalDetails'],
          message: `Please provide at least ${MIN_ADDITIONAL_DETAILS_LENGTH} characters of explanation when selecting 'Other'.`,
        });
      }
    } else if (trimmed && trimmed.length > 0 && trimmed.length < MIN_ADDITIONAL_DETAILS_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['additionalDetails'],
        message: `Details must be at least ${MIN_ADDITIONAL_DETAILS_LENGTH} characters if provided.`,
      });
    }
  });

export type ReportJobFormValues = z.infer<typeof reportJobSchema>;
