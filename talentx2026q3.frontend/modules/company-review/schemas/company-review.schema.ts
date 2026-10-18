import { z } from 'zod';
import {
  COMPANY_REVIEW_COMMENT_MAX_LENGTH,
  COMPANY_REVIEW_MAX_RATING,
  COMPANY_REVIEW_MIN_RATING,
} from '../constants/company-review.constants';
import { REVIEW_SENTIMENT_VALUES } from '../types/company-review.types';

// A rating the talent skipped is `undefined` in the form and `null` from the API.
const ratingSchema = z
  .number()
  .int('Rating must be a whole number.')
  .min(COMPANY_REVIEW_MIN_RATING, `Rating must be between ${COMPANY_REVIEW_MIN_RATING} and ${COMPANY_REVIEW_MAX_RATING}.`)
  .max(COMPANY_REVIEW_MAX_RATING, `Rating must be between ${COMPANY_REVIEW_MIN_RATING} and ${COMPANY_REVIEW_MAX_RATING}.`)
  .optional();

export const companyReviewFormSchema = z.object({
  sentiment: z.enum(REVIEW_SENTIMENT_VALUES, { error: 'Please choose Positive or Negative.' }),
  // Measured after trimming, like the backend, so padding never counts against the limit.
  comment: z
    .string()
    .refine((value) => value.trim().length <= COMPANY_REVIEW_COMMENT_MAX_LENGTH, {
      message: `Feedback must not exceed ${COMPANY_REVIEW_COMMENT_MAX_LENGTH} characters.`,
    })
    .optional(),
  ratings: z.object({
    recruitmentProcess: ratingSchema,
    communication: ratingSchema,
    interviewExperience: ratingSchema,
    professionalism: ratingSchema,
  }),
});

export type CompanyReviewFormValues = z.infer<typeof companyReviewFormSchema>;
