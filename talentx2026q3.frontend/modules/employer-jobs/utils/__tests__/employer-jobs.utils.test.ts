import { STATUS_ACCENT_BORDER } from '../../constants';
import {
  formatDisplayDate,
  isDeadlineTodayOrFuture,
  isValidJobDetailTab,
  parseJobStatus,
  parseLocationIntoCityAndCountry,
  resolveJobDetailTab,
  resolveLocationPayload,
  validateEditJobForm,
} from '../employer-jobs.utils';
import type { EmployerEditJobFormValues } from '../../types/employer-job.types';

describe('employer-jobs.utils', () => {
  describe('formatDisplayDate', () => {
    it('returns "Not recorded" when date string is missing, null, or empty', () => {
      expect(formatDisplayDate(undefined)).toBe('Not recorded');
      expect(formatDisplayDate(null)).toBe('Not recorded');
      expect(formatDisplayDate('')).toBe('Not recorded');
    });

    it('formats valid ISO date string cleanly to "MMM D, YYYY"', () => {
      const formattedDate = formatDisplayDate('2026-09-01T12:00:00.000Z');
      expect(formattedDate).toMatch(/Sep \d{1,2}, 2026/);
    });

    it('returns raw string when an invalid date string is provided', () => {
      expect(formatDisplayDate('not-a-valid-date')).toBe('not-a-valid-date');
    });
  });

  describe('parseJobStatus', () => {
    it('returns valid JobStatus values as-is', () => {
      expect(parseJobStatus('Published')).toBe('Published');
      expect(parseJobStatus('Draft')).toBe('Draft');
      expect(parseJobStatus('Closed')).toBe('Closed');
      expect(parseJobStatus('Expired')).toBe('Expired');
    });

    it('keeps the moderation statuses instead of mistaking them for drafts', () => {
      // Falling back to Draft here would offer the employer a Publish action the backend rejects.
      expect(parseJobStatus('Deactivated')).toBe('Deactivated');
      expect(parseJobStatus('PendingReview')).toBe('PendingReview');
    });

    it('defaults to "Draft" for unknown or invalid status strings', () => {
      expect(parseJobStatus('Archived')).toBe('Draft');
      expect(parseJobStatus('Unknown')).toBe('Draft');
      expect(parseJobStatus('')).toBe('Draft');
    });
  });

  describe('parseLocationIntoCityAndCountry', () => {
    it('preserves existing city and country when present', () => {
      const parsedResult = parseLocationIntoCityAndCountry(
        'Dhaka, Bangladesh',
        'Sylhet',
        'Bangladesh'
      );
      expect(parsedResult).toEqual({ city: 'Sylhet', country: 'Bangladesh' });
    });

    it('splits comma-separated location into city and country when fields are missing', () => {
      const parsedResult = parseLocationIntoCityAndCountry('Dhaka, Bangladesh');
      expect(parsedResult).toEqual({ city: 'Dhaka', country: 'Bangladesh' });
    });

    it('handles multiple commas by preserving city as first segment and rest as country', () => {
      const parsedResult = parseLocationIntoCityAndCountry('Brooklyn, New York, USA');
      expect(parsedResult).toEqual({ city: 'Brooklyn', country: 'New York, USA' });
    });

    it('returns empty strings when location has no comma or is empty', () => {
      expect(parseLocationIntoCityAndCountry(null)).toEqual({ city: '', country: '' });
      expect(parseLocationIntoCityAndCountry('')).toEqual({ city: '', country: '' });
      expect(parseLocationIntoCityAndCountry('Remote')).toEqual({ city: '', country: '' });
    });
  });

  describe('resolveLocationPayload', () => {
    it('returns existing trimmed location when present', () => {
      const resolvedLocation = resolveLocationPayload(
        ' London, UK ',
        'Dhaka',
        'Bangladesh',
        'Hybrid'
      );
      expect(resolvedLocation).toBe('London, UK');
    });

    it('constructs location from city and country for OnSite or Hybrid arrangements', () => {
      const hybridLocation = resolveLocationPayload('', 'Dhaka', 'Bangladesh', 'Hybrid');
      expect(hybridLocation).toBe('Dhaka, Bangladesh');

      const onSiteLocation = resolveLocationPayload('', 'Toronto', 'Canada', 'OnSite');
      expect(onSiteLocation).toBe('Toronto, Canada');
    });

    it('returns "Worldwide / Remote" for FullRemote when location is empty', () => {
      const remoteLocation = resolveLocationPayload('', '', '', 'FullRemote');
      expect(remoteLocation).toBe('Worldwide / Remote');
    });

    it('returns empty string when OnSite is missing city or country and location is empty', () => {
      const emptyLocation = resolveLocationPayload('', '', '', 'OnSite');
      expect(emptyLocation).toBe('');
    });
  });

  describe('validateEditJobForm', () => {
    const validBaseFormValues: EmployerEditJobFormValues = {
      title: 'Senior Frontend Engineer',
      companyName: 'Acme Technologies',
      description: 'We are seeking a seasoned frontend engineer with modern React experience.',
      requirements: '5+ years of React experience, strong TypeScript skills, and a ownership mindset.',
      location: 'Dhaka, Bangladesh',
      city: 'Dhaka',
      country: 'Bangladesh',
      minOverlapHours: 4,
      employmentType: 'FullTime',
      experienceLevel: 'SeniorLevel',
      workArrangement: 'Hybrid',
      requiredSkills: ['React', 'TypeScript'],
      vacancies: 2,
      expireAt: '2026-12-31',
      salaryType: 'Range',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'BDT',
      salaryPeriod: 'PerMonth',
    };

    it('passes validation with zero errors for valid values when saving draft', () => {
      const validationErrors = validateEditJobForm(validBaseFormValues, 'draft');
      expect(Object.keys(validationErrors)).toHaveLength(0);
    });

    it('passes validation with zero errors for valid values when publishing', () => {
      const validationErrors = validateEditJobForm(validBaseFormValues, 'publish');
      expect(Object.keys(validationErrors)).toHaveLength(0);
    });

    it('demands the same complete content for resubmit as for publish', () => {
      // The backend runs EnsureContentComplete on resubmit, so anything publish rejects must
      // be caught here too, rather than coming back as a failed request.
      expect(Object.keys(validateEditJobForm(validBaseFormValues, 'resubmit'))).toHaveLength(0);

      const incompleteValues = { ...validBaseFormValues, requirements: '', requiredSkills: [] };
      const resubmitErrors = validateEditJobForm(incompleteValues, 'resubmit');
      const publishErrors = validateEditJobForm(incompleteValues, 'publish');

      expect(resubmitErrors).toEqual(publishErrors);
      expect(resubmitErrors.requirements).toBeDefined();
      expect(resubmitErrors.requiredSkills).toBeDefined();

      // A plain save still lets an employer park an incomplete draft.
      expect(validateEditJobForm(incompleteValues, 'save').requirements).toBeUndefined();
    });

    it('flags title errors when missing or exceeding 200 characters', () => {
      const missingTitleErrors = validateEditJobForm(
        { ...validBaseFormValues, title: '   ' },
        'draft'
      );
      expect(missingTitleErrors.title).toBe('Job title is required.');

      const longTitleErrors = validateEditJobForm(
        { ...validBaseFormValues, title: 'A'.repeat(201) },
        'draft'
      );
      expect(longTitleErrors.title).toBe('Job title must not exceed 200 characters.');
    });

    it('flags missing company name', () => {
      const missingCompanyErrors = validateEditJobForm(
        { ...validBaseFormValues, companyName: '   ' },
        'draft'
      );
      expect(missingCompanyErrors.companyName).toBe('Company name is required.');
    });

    it('flags city and country errors for OnSite or Hybrid roles when invalid', () => {
      const hybridErrors = validateEditJobForm(
        { ...validBaseFormValues, workArrangement: 'Hybrid', city: 'D', country: '' },
        'draft'
      );
      expect(hybridErrors.city).toBe(
        'City is required for Hybrid and On-Site roles (minimum 2 characters).'
      );
      expect(hybridErrors.country).toBe(
        'Country is required for Hybrid and On-Site roles (minimum 2 characters).'
      );
    });

    it('flags minOverlapHours error for FullRemote when invalid', () => {
      const remoteErrors = validateEditJobForm(
        { ...validBaseFormValues, workArrangement: 'FullRemote', minOverlapHours: 0 },
        'draft'
      );
      expect(remoteErrors.minOverlapHours).toBe(
        'Minimum overlap hours is required for Remote roles.'
      );
    });

    it('requires description, location, and vacancies only when actionType is publish', () => {
      const incompleteValues: EmployerEditJobFormValues = {
        ...validBaseFormValues,
        workArrangement: 'FullRemote',
        description: '',
        location: '',
        vacancies: 0,
      };

      const draftErrors = validateEditJobForm(incompleteValues, 'draft');
      expect(draftErrors.description).toBeUndefined();
      expect(draftErrors.location).toBeUndefined();
      expect(draftErrors.vacancies).toBeUndefined();

      const publishErrors = validateEditJobForm(incompleteValues, 'publish');
      expect(publishErrors.description).toBe('Job description is required to publish.');
      expect(publishErrors.location).toBe('Location is required to publish.');
      expect(publishErrors.vacancies).toBe('Vacancies must be at least 1.');
    });

    it('requires location to publish for every work arrangement, including On-Site', () => {
      for (const workArrangement of ['OnSite', 'Hybrid', 'FullRemote', 'RemoteButAccessible']) {
        const publishErrors = validateEditJobForm(
          { ...validBaseFormValues, workArrangement, location: '  ' },
          'publish'
        );
        expect(publishErrors.location).toBe('Location is required to publish.');
      }
    });

    it('validates description length constraints on publish', () => {
      const shortDescErrors = validateEditJobForm(
        { ...validBaseFormValues, description: 'Too short' },
        'publish'
      );
      expect(shortDescErrors.description).toBe('Job description must be at least 20 characters.');

      const longDescErrors = validateEditJobForm(
        { ...validBaseFormValues, description: 'X'.repeat(10001) },
        'publish'
      );
      expect(longDescErrors.description).toBe('Job description must not exceed 10,000 characters.');
    });

    it('requires requirements only when actionType is publish', () => {
      const draftErrors = validateEditJobForm(
        { ...validBaseFormValues, requirements: '   ' },
        'draft'
      );
      expect(draftErrors.requirements).toBeUndefined();

      const publishErrors = validateEditJobForm(
        { ...validBaseFormValues, requirements: '   ' },
        'publish'
      );
      expect(publishErrors.requirements).toBe('Requirements is required.');
    });

    it('validates requirements maximum length on publish', () => {
      const longRequirementsErrors = validateEditJobForm(
        { ...validBaseFormValues, requirements: 'X'.repeat(5001) },
        'publish'
      );
      expect(longRequirementsErrors.requirements).toBe(
        'Requirements must not exceed 5000 characters.'
      );
    });

    it('requires at least one skill only when actionType is publish', () => {
      const draftErrors = validateEditJobForm(
        { ...validBaseFormValues, requiredSkills: [] },
        'draft'
      );
      expect(draftErrors.requiredSkills).toBeUndefined();

      const publishErrors = validateEditJobForm(
        { ...validBaseFormValues, requiredSkills: [] },
        'publish'
      );
      expect(publishErrors.requiredSkills).toBe('Required skills must have at least one skill.');
    });

    it('requires application deadline only when actionType is publish', () => {
      const missingDeadlineToDraft = validateEditJobForm(
        { ...validBaseFormValues, expireAt: '' },
        'draft'
      );
      expect(missingDeadlineToDraft.expireAt).toBeUndefined();

      const missingDeadlineToSave = validateEditJobForm(
        { ...validBaseFormValues, expireAt: '' },
        'save'
      );
      expect(missingDeadlineToSave.expireAt).toBeUndefined();

      const missingDeadlineToResubmit = validateEditJobForm(
        { ...validBaseFormValues, expireAt: '' },
        'resubmit'
      );
      expect(missingDeadlineToResubmit.expireAt).toBeUndefined();

      const missingDeadlineToPublish = validateEditJobForm(
        { ...validBaseFormValues, expireAt: '' },
        'publish'
      );
      expect(missingDeadlineToPublish.expireAt).toBe(
        'Application deadline is required to publish.'
      );
    });

    it('allows past deadline when saving, drafting, or resubmitting, but rejects on publish', () => {
      const pastDeadlineValues: EmployerEditJobFormValues = {
        ...validBaseFormValues,
        expireAt: '2020-01-01',
      };

      const saveErrors = validateEditJobForm(pastDeadlineValues, 'save');
      expect(saveErrors.expireAt).toBeUndefined();

      const draftErrors = validateEditJobForm(pastDeadlineValues, 'draft');
      expect(draftErrors.expireAt).toBeUndefined();

      const resubmitErrors = validateEditJobForm(pastDeadlineValues, 'resubmit');
      expect(resubmitErrors.expireAt).toBeUndefined();

      const publishErrors = validateEditJobForm(pastDeadlineValues, 'publish');
      expect(publishErrors.expireAt).toBe(
        'Application deadline must be today or in the future to publish.'
      );
    });

    it('requires salary type when publishing without any salary set', () => {
      const missingSalaryErrors = validateEditJobForm(
        {
          ...validBaseFormValues,
          salaryType: null,
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: null,
          salaryPeriod: null,
        },
        'publish'
      );
      expect(missingSalaryErrors.salaryType).toBe('Salary is required.');
    });

    it('allows negotiable salary without currency, period, or amounts when publishing', () => {
      const negotiableErrors = validateEditJobForm(
        {
          ...validBaseFormValues,
          salaryType: 'Negotiable',
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: null,
          salaryPeriod: null,
        },
        'publish'
      );
      expect(Object.keys(negotiableErrors)).toHaveLength(0);
    });

    it('requires currency, period, and min amount for fixed salary when publishing', () => {
      const fixedErrors = validateEditJobForm(
        {
          ...validBaseFormValues,
          salaryType: 'Fixed',
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: null,
          salaryPeriod: null,
        },
        'publish'
      );
      expect(fixedErrors.salaryCurrency).toBe('Salary currency is required.');
      expect(fixedErrors.salaryPeriod).toBe('Salary period is required.');
      expect(fixedErrors.salaryMin).toBe('Salary amount is required.');
      expect(fixedErrors.salaryMax).toBeUndefined();
    });

    it('requires max amount for range salary when publishing', () => {
      const rangeErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryMax: null },
        'publish'
      );
      expect(rangeErrors.salaryMax).toBe('Maximum salary is required.');
    });

    it('flags max amount below min amount regardless of action type', () => {
      const draftErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryMin: 120000, salaryMax: 80000 },
        'draft'
      );
      expect(draftErrors.salaryMax).toBe(
        'Maximum salary must be greater than or equal to minimum salary.'
      );

      const publishErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryMin: 120000, salaryMax: 80000 },
        'publish'
      );
      expect(publishErrors.salaryMax).toBe(
        'Maximum salary must be greater than or equal to minimum salary.'
      );
    });

    it('rejects negative salary amounts regardless of action type', () => {
      const negativeMinErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryType: 'Fixed', salaryMin: -5000, salaryMax: -5000 },
        'draft'
      );
      expect(negativeMinErrors.salaryMin).toBe('Salary amount cannot be negative.');
      expect(negativeMinErrors.salaryMax).toBeUndefined();

      const negativeRangeErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryType: 'Range', salaryMin: null, salaryMax: -100 },
        'draft'
      );
      expect(negativeRangeErrors.salaryMax).toBe('Maximum salary cannot be negative.');
    });

    it('ignores stale salaryMax when salary type is Fixed', () => {
      const fixedErrors = validateEditJobForm(
        { ...validBaseFormValues, salaryType: 'Fixed', salaryMin: 80000, salaryMax: 50000 },
        'draft'
      );
      expect(fixedErrors.salaryMax).toBeUndefined();
      expect(Object.keys(fixedErrors)).toHaveLength(0);
    });

    it('skips salary requirements for draft saves even when salary is incomplete', () => {
      const draftErrors = validateEditJobForm(
        {
          ...validBaseFormValues,
          salaryType: 'Range',
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: null,
          salaryPeriod: null,
        },
        'draft'
      );
      expect(draftErrors.salaryType).toBeUndefined();
      expect(draftErrors.salaryCurrency).toBeUndefined();
      expect(draftErrors.salaryPeriod).toBeUndefined();
      expect(draftErrors.salaryMin).toBeUndefined();
      expect(draftErrors.salaryMax).toBeUndefined();
    });
  });

  describe('isDeadlineTodayOrFuture', () => {
    it('returns false when date string is missing, null, or empty', () => {
      expect(isDeadlineTodayOrFuture(undefined)).toBe(false);
      expect(isDeadlineTodayOrFuture(null)).toBe(false);
      expect(isDeadlineTodayOrFuture('')).toBe(false);
    });

    it('returns false for invalid date strings', () => {
      expect(isDeadlineTodayOrFuture('invalid-date')).toBe(false);
      expect(isDeadlineTodayOrFuture('not-a-date')).toBe(false);
    });

    it('returns false for past dates in date-only and ISO formats', () => {
      expect(isDeadlineTodayOrFuture('2020-01-01')).toBe(false);
      expect(isDeadlineTodayOrFuture('2020-01-01T00:00:00.000Z')).toBe(false);
      expect(isDeadlineTodayOrFuture('2020-01-01T23:59:59.999Z')).toBe(false);
    });

    it('returns true for future dates in date-only and ISO formats', () => {
      expect(isDeadlineTodayOrFuture('2099-12-31')).toBe(true);
      expect(isDeadlineTodayOrFuture('2099-12-31T00:00:00.000Z')).toBe(true);
      expect(isDeadlineTodayOrFuture('2099-12-31T23:59:59.999Z')).toBe(true);
    });

    it('returns true for today date-only string through 23:59:59', () => {
      const todayDate = new Date();
      const currentYear = todayDate.getFullYear();
      const currentMonthString = String(todayDate.getMonth() + 1).padStart(2, '0');
      const currentDayString = String(todayDate.getDate()).padStart(2, '0');
      const todayDateOnlyString = `${currentYear}-${currentMonthString}-${currentDayString}`;

      expect(isDeadlineTodayOrFuture(todayDateOnlyString)).toBe(true);
    });

    it('returns true for today ISO timestamp strings across midnight and end of day', () => {
      const todayDate = new Date();
      const currentYear = todayDate.getUTCFullYear();
      const currentMonthString = String(todayDate.getUTCMonth() + 1).padStart(2, '0');
      const currentDayString = String(todayDate.getUTCDate()).padStart(2, '0');

      const todayIsoMidnightString = `${currentYear}-${currentMonthString}-${currentDayString}T00:00:00.000Z`;
      const todayIsoEndOfDayString = `${currentYear}-${currentMonthString}-${currentDayString}T23:59:59.999Z`;

      expect(isDeadlineTodayOrFuture(todayIsoMidnightString)).toBe(true);
      expect(isDeadlineTodayOrFuture(todayIsoEndOfDayString)).toBe(true);
    });
  });

  describe('isValidJobDetailTab', () => {
    it('returns true for all valid tab options', () => {
      expect(isValidJobDetailTab('job-details')).toBe(true);
      expect(isValidJobDetailTab('applicants')).toBe(true);
      expect(isValidJobDetailTab('interviews')).toBe(true);
    });

    it('returns false for invalid strings', () => {
      expect(isValidJobDetailTab('overview')).toBe(false);
      expect(isValidJobDetailTab('candidates')).toBe(false);
      expect(isValidJobDetailTab('')).toBe(false);
      expect(isValidJobDetailTab('JOB-DETAILS')).toBe(false);
    });

    it('returns false for non-string types and nil values', () => {
      expect(isValidJobDetailTab(null)).toBe(false);
      expect(isValidJobDetailTab(undefined)).toBe(false);
      expect(isValidJobDetailTab(123)).toBe(false);
      expect(isValidJobDetailTab({})).toBe(false);
      expect(isValidJobDetailTab([])).toBe(false);
      expect(isValidJobDetailTab(true)).toBe(false);
    });
  });

  describe('resolveJobDetailTab', () => {
    it('resolves valid tab string', () => {
      expect(resolveJobDetailTab('job-details')).toBe('job-details');
      expect(resolveJobDetailTab('applicants')).toBe('applicants');
      expect(resolveJobDetailTab('interviews')).toBe('interviews');
    });

    it('resolves valid tab from string array', () => {
      expect(resolveJobDetailTab(['applicants', 'interviews'])).toBe('applicants');
      expect(resolveJobDetailTab(['interviews'])).toBe('interviews');
      expect(resolveJobDetailTab(['job-details'])).toBe('job-details');
    });

    it('falls back to default tab for invalid string or invalid array values', () => {
      expect(resolveJobDetailTab('invalid-tab')).toBe('job-details');
      expect(resolveJobDetailTab(['invalid-tab'])).toBe('job-details');
      expect(resolveJobDetailTab([])).toBe('job-details');
    });

    it('falls back to default tab for null, undefined, or empty values', () => {
      expect(resolveJobDetailTab(null)).toBe('job-details');
      expect(resolveJobDetailTab(undefined)).toBe('job-details');
      expect(resolveJobDetailTab('')).toBe('job-details');
    });
  });

  describe('constants', () => {
    it('defines STATUS_ACCENT_BORDER for all JobStatus values', () => {
      expect(STATUS_ACCENT_BORDER.Published).toBe('border-t-emerald-500');
      expect(STATUS_ACCENT_BORDER.Draft).toBe('border-t-amber-500');
      expect(STATUS_ACCENT_BORDER.Closed).toBe('border-t-slate-400');
      expect(STATUS_ACCENT_BORDER.Expired).toBe('border-t-rose-500');
    });
  });
});
