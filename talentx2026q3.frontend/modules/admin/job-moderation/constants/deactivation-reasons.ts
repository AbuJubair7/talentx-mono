import type { DeactivationReason } from "../types/job-moderation";

// Worded exactly like the backend's DeactivationReasonLabels, so the reason the admin picks
// reads the same in the employer's email and on their job page.
export const DEACTIVATION_REASON_OPTIONS: ReadonlyArray<{ value: DeactivationReason; label: string }> = [
  { value: "Spam", label: "Spam" },
  { value: "InappropriateContent", label: "Inappropriate content" },
  { value: "MisleadingInformation", label: "Misleading or invalid information" },
  { value: "Discriminatory", label: "Discriminatory content" },
  { value: "DuplicatePosting", label: "Duplicate posting" },
  { value: "Outdated", label: "Outdated job" },
  { value: "Other", label: "Other" },
];

// Mirrors DeactivateJobCommandValidator: details are measured after trimming.
export const DEACTIVATION_DETAILS_MIN_LENGTH = 10;
export const DEACTIVATION_DETAILS_MAX_LENGTH = 1000;
