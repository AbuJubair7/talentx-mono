import type { CompanyReviewFormValues } from '../schemas/company-review.schema';
import type {
  CompanyReviewContentPayload,
  CompanyReviewRatingsDto,
  MyCompanyReviewDto,
} from '../types/company-review.types';

/** Turns form values into the API payload: comment trimmed (blank → omitted), skipped ratings → null. */
export function toReviewContentPayload(values: CompanyReviewFormValues): CompanyReviewContentPayload {
  const comment = values.comment?.trim();

  return {
    sentiment: values.sentiment,
    comment: comment ? comment : undefined,
    ratings: {
      recruitmentProcess: values.ratings.recruitmentProcess ?? null,
      communication: values.ratings.communication ?? null,
      interviewExperience: values.ratings.interviewExperience ?? null,
      professionalism: values.ratings.professionalism ?? null,
    },
  };
}

function ratingToFormValue(rating: number | null): number | undefined {
  return rating ?? undefined;
}

/** Form defaults: empty for a new review, the saved content when editing. */
export function toFormDefaults(review: MyCompanyReviewDto | null): Partial<CompanyReviewFormValues> {
  if (!review) {
    return { comment: '', ratings: {} };
  }

  const ratings: CompanyReviewRatingsDto = review.ratings;

  return {
    sentiment: review.sentiment,
    comment: review.comment ?? '',
    ratings: {
      recruitmentProcess: ratingToFormValue(ratings.recruitmentProcess),
      communication: ratingToFormValue(ratings.communication),
      interviewExperience: ratingToFormValue(ratings.interviewExperience),
      professionalism: ratingToFormValue(ratings.professionalism),
    },
  };
}
