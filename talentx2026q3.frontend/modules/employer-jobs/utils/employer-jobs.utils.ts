import { formatShortDate } from '@/lib/date';
import { DEFAULT_JOB_DETAIL_TAB } from '../constants/employer-jobs.constants';
import type {
  EditJobActionType,
  EmployerEditJobFormErrors,
  EmployerEditJobFormValues,
  EmployerJobDetailTab,
  JobStatus,
} from '../types/employer-job.types';

export function formatDisplayDate(dateIsoString?: string | null): string {
  if (!dateIsoString) return 'Not recorded';
  const date = new Date(dateIsoString);
  if (isNaN(date.getTime())) return dateIsoString;
  return formatShortDate(dateIsoString);
}

export function parseJobStatus(rawStatusString: string): JobStatus {
  if (
    rawStatusString === 'Published' ||
    rawStatusString === 'Draft' ||
    rawStatusString === 'Closed' ||
    rawStatusString === 'Expired' ||
    // Without these two, a moderated job falls through to Draft and the employer is offered a
    // Publish action the backend will reject.
    rawStatusString === 'Deactivated' ||
    rawStatusString === 'PendingReview'
  ) {
    return rawStatusString;
  }
  return 'Draft';
}

export function parseLocationIntoCityAndCountry(
  location?: string | null,
  existingCity?: string | null,
  existingCountry?: string | null
): { city: string; country: string } {
  let resolvedCity = existingCity?.trim() || '';
  let resolvedCountry = existingCountry?.trim() || '';

  if ((!resolvedCity || !resolvedCountry) && location && location.includes(',')) {
    const locationSegments = location.split(',').map((segment) => segment.trim());
    if (locationSegments.length >= 2) {
      if (!resolvedCity) {
        resolvedCity = locationSegments[0] || '';
      }
      if (!resolvedCountry) {
        resolvedCountry = locationSegments.slice(1).join(', ') || '';
      }
    }
  }

  return { city: resolvedCity, country: resolvedCountry };
}

export function resolveLocationPayload(
  location: string,
  city: string,
  country: string,
  workArrangement: string
): string {
  const isLocationArrangement = workArrangement === 'OnSite' || workArrangement === 'Hybrid';
  const trimmedLocation = location.trim();
  const trimmedCity = city.trim();
  const trimmedCountry = country.trim();

  if (trimmedLocation) {
    return trimmedLocation;
  }

  if (isLocationArrangement && trimmedCity && trimmedCountry) {
    return `${trimmedCity}, ${trimmedCountry}`;
  }

  if (workArrangement === 'FullRemote') {
    return 'Worldwide / Remote';
  }

  return '';
}

export function normalizeSalaryAmount(rawAmount: unknown): number | null {
  return typeof rawAmount === 'number' && !Number.isNaN(rawAmount) ? rawAmount : null;
}

export function validateEditJobForm(
  values: EmployerEditJobFormValues,
  actionType: EditJobActionType
): EmployerEditJobFormErrors {
  const currentValidationErrors: EmployerEditJobFormErrors = {};

  // Resubmitting for review runs the backend's EnsureContentComplete, the same required-field
  // set as publishing, so both actions validate identically here.
  const requiresCompleteContent = actionType === 'publish' || actionType === 'resubmit';

  const trimmedTitle = values.title.trim();
  if (!trimmedTitle) {
    currentValidationErrors.title = 'Job title is required.';
  } else if (trimmedTitle.length > 200) {
    currentValidationErrors.title = 'Job title must not exceed 200 characters.';
  }

  if (!values.companyName.trim()) {
    currentValidationErrors.companyName = 'Company name is required.';
  }

  const isLocationArrangement =
    values.workArrangement === 'OnSite' || values.workArrangement === 'Hybrid';

  if (isLocationArrangement) {
    if (!values.city.trim() || values.city.trim().length < 2) {
      currentValidationErrors.city =
        'City is required for Hybrid and On-Site roles (minimum 2 characters).';
    }
    if (!values.country.trim() || values.country.trim().length < 2) {
      currentValidationErrors.country =
        'Country is required for Hybrid and On-Site roles (minimum 2 characters).';
    }
  } else if (values.workArrangement === 'FullRemote') {
    if (!values.minOverlapHours || values.minOverlapHours < 1) {
      currentValidationErrors.minOverlapHours =
        'Minimum overlap hours is required for Remote roles.';
    }
  }

  if (requiresCompleteContent) {
    const trimmedDescription = values.description.trim();
    if (!trimmedDescription) {
      currentValidationErrors.description = 'Job description is required to publish.';
    } else if (trimmedDescription.length < 20) {
      currentValidationErrors.description = 'Job description must be at least 20 characters.';
    } else if (trimmedDescription.length > 10000) {
      currentValidationErrors.description =
        'Job description must not exceed 10,000 characters.';
    }

    const trimmedRequirements = values.requirements.trim();
    if (!trimmedRequirements) {
      currentValidationErrors.requirements = 'Requirements is required.';
    } else if (trimmedRequirements.length > 5000) {
      currentValidationErrors.requirements =
        'Requirements must not exceed 5000 characters.';
    }

    if (values.requiredSkills.length === 0) {
      currentValidationErrors.requiredSkills = 'Required skills must have at least one skill.';
    }

    if (!values.location.trim()) {
      currentValidationErrors.location = 'Location is required to publish.';
    }

    if (values.vacancies < 1) {
      currentValidationErrors.vacancies = 'Vacancies must be at least 1.';
    }

    if (actionType === 'publish') {
      if (!values.expireAt) {
        currentValidationErrors.expireAt = 'Application deadline is required to publish.';
      } else if (!isDeadlineTodayOrFuture(values.expireAt)) {
        currentValidationErrors.expireAt =
          'Application deadline must be today or in the future to publish.';
      }
    }
  }

  const normalizedSalaryType = values.salaryType || null;
  const resolvedSalaryMin = normalizeSalaryAmount(values.salaryMin);
  const resolvedSalaryMax = normalizeSalaryAmount(values.salaryMax);

  if (resolvedSalaryMin !== null && resolvedSalaryMin < 0) {
    currentValidationErrors.salaryMin = 'Salary amount cannot be negative.';
  }

  // salaryMax is only meaningful for Range salaries. A stale max left over from
  // a previous Range selection must never block a Fixed or Negotiable save.
  if (normalizedSalaryType === 'Range') {
    if (resolvedSalaryMax !== null && resolvedSalaryMax < 0) {
      currentValidationErrors.salaryMax = 'Maximum salary cannot be negative.';
    }

    if (
      resolvedSalaryMin !== null &&
      resolvedSalaryMax !== null &&
      resolvedSalaryMax < resolvedSalaryMin
    ) {
      currentValidationErrors.salaryMax =
        'Maximum salary must be greater than or equal to minimum salary.';
    }
  }

  if (requiresCompleteContent) {
    if (!normalizedSalaryType) {
      currentValidationErrors.salaryType = 'Salary is required.';
    } else if (normalizedSalaryType === 'Fixed' || normalizedSalaryType === 'Range') {
      if (!values.salaryCurrency) {
        currentValidationErrors.salaryCurrency = 'Salary currency is required.';
      }
      if (!values.salaryPeriod) {
        currentValidationErrors.salaryPeriod = 'Salary period is required.';
      }
      if (resolvedSalaryMin === null) {
        currentValidationErrors.salaryMin = 'Salary amount is required.';
      }
      if (normalizedSalaryType === 'Range' && resolvedSalaryMax === null) {
        currentValidationErrors.salaryMax = 'Maximum salary is required.';
      }
    }
  }

  return currentValidationErrors;
}

export function isDeadlineTodayOrFuture(dateString?: string | null): boolean {
  if (!dateString) {
    return false;
  }

  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    return false;
  }

  const currentTimestamp = Date.now();
  if (parsedDate.getTime() >= currentTimestamp) {
    return true;
  }

  const isoDateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const candidateYear = parseInt(isoDateMatch[1], 10);
    const candidateMonthIndex = parseInt(isoDateMatch[2], 10) - 1;
    const candidateDay = parseInt(isoDateMatch[3], 10);

    const localEndOfCandidateDay = new Date(
      candidateYear,
      candidateMonthIndex,
      candidateDay,
      23,
      59,
      59,
      999
    ).getTime();

    const utcEndOfCandidateDay = Date.UTC(
      candidateYear,
      candidateMonthIndex,
      candidateDay,
      23,
      59,
      59,
      999
    );

    if (
      !isNaN(localEndOfCandidateDay) &&
      currentTimestamp <= localEndOfCandidateDay
    ) {
      return true;
    }

    if (
      !isNaN(utcEndOfCandidateDay) &&
      currentTimestamp <= utcEndOfCandidateDay
    ) {
      return true;
    }
  }

  const localEndOfParsedDay = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    23,
    59,
    59,
    999
  ).getTime();

  const utcEndOfParsedDay = Date.UTC(
    parsedDate.getUTCFullYear(),
    parsedDate.getUTCMonth(),
    parsedDate.getUTCDate(),
    23,
    59,
    59,
    999
  );

  return (
    (!isNaN(localEndOfParsedDay) && currentTimestamp <= localEndOfParsedDay) ||
    (!isNaN(utcEndOfParsedDay) && currentTimestamp <= utcEndOfParsedDay)
  );
}

export function isValidJobDetailTab(tab: unknown): tab is EmployerJobDetailTab {
  return tab === 'job-details' || tab === 'applicants' || tab === 'interviews';
}

export function resolveJobDetailTab(value?: string | string[] | null): EmployerJobDetailTab {
  const candidate = Array.isArray(value) ? value[0] : value;
  return isValidJobDetailTab(candidate) ? candidate : DEFAULT_JOB_DETAIL_TAB;
}

