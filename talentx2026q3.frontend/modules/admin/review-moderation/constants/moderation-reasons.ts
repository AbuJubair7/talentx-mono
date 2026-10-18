import {
  REVIEW_MODERATION_REASON_LABELS,
  REVIEW_MODERATION_REASON_VALUES,
  type ReviewModerationReason,
} from "@/modules/company-review";

// Built from the shared label map so the wording never drifts from what the talent sees
// on their own rejected/hidden review.
export const MODERATION_REASON_OPTIONS: ReadonlyArray<{ value: ReviewModerationReason; label: string }> =
  REVIEW_MODERATION_REASON_VALUES.map((value) => ({
    value,
    label: REVIEW_MODERATION_REASON_LABELS[value],
  }));

// Mirrors RejectCompanyReviewCommandValidator / HideCompanyReviewCommandValidator: details are
// measured after trimming.
export const MODERATION_DETAILS_MIN_LENGTH = 10;
export const MODERATION_DETAILS_MAX_LENGTH = 1000;
