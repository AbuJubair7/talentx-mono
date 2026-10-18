'use client';

import { useEffect, useState, type KeyboardEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Hash,
  Info,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  User,
  Users,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PortalPageContainer, PortalPageHeader } from '@/components/layout';
import {
  formatEmploymentType,
  formatExperienceLevel,
  formatLocation,
  formatRelativeTime,
  formatWorkArrangement,
} from '@/modules/job-listing';
import {
  CURRENCY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  SALARY_PERIOD_OPTIONS,
  SALARY_TYPE_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
} from '@/modules/jobposting/utils/job-options';
import { AIGenerateButton } from '@/modules/jobposting/components/AIGenerateButton';
import { useGenerateDescription } from '@/modules/jobposting/hooks/useGenerateDescription';
import { useGenerateRequirements } from '@/modules/jobposting/hooks/useGenerateRequirements';
import { useGenerateSkills } from '@/modules/jobposting/hooks/useGenerateSkills';

import { useCloseJob } from '../hooks/useCloseJob';
import { useMyJob } from '../hooks/useMyJob';
import { AIOverwriteConfirmDialog } from './AIOverwriteConfirmDialog';
import { DeactivationBanner } from './DeactivationBanner';
import { useReopenJob } from '../hooks/useReopenJob';
import { useResubmitJob } from '../hooks/useResubmitJob';
import { useUpdateJob } from '../hooks/useUpdateJob';
import {
  formatDisplayDate,
  isDeadlineTodayOrFuture,
  parseLocationIntoCityAndCountry,
  validateEditJobForm,
} from '../utils';
import { EmployerJobSalaryBadge } from './EmployerJobSalaryBadge';
import { JobActionConfirmDialog } from './JobActionConfirmDialog';
import { JobStatusBadge } from './JobStatusBadge';
import type {
  EditJobActionType,
  EmployerEditJobErrorViewProps,
  EmployerEditJobFormErrors,
  EmployerEditJobFormValues,
  EmployerEditJobSkeletonProps,
  EmployerEditJobViewProps,
  JobActionDialogState,
  JobStatus,
} from '../types/employer-job.types';

export const FORM_ERROR_FIELD_ELEMENT_IDS: ReadonlyArray<{
  fieldKey: keyof EmployerEditJobFormErrors;
  elementId: string;
}> = [
  { fieldKey: 'title', elementId: 'edit-job-title' },
  { fieldKey: 'companyName', elementId: 'edit-company-name' },
  { fieldKey: 'vacancies', elementId: 'edit-vacancies' },
  { fieldKey: 'city', elementId: 'edit-city' },
  { fieldKey: 'country', elementId: 'edit-country' },
  { fieldKey: 'minOverlapHours', elementId: 'edit-min-overlap' },
  { fieldKey: 'location', elementId: 'edit-location' },
  { fieldKey: 'salaryType', elementId: 'edit-salary-type' },
  { fieldKey: 'salaryCurrency', elementId: 'edit-salary-currency' },
  { fieldKey: 'salaryPeriod', elementId: 'edit-salary-period' },
  { fieldKey: 'salaryMin', elementId: 'edit-salary-min' },
  { fieldKey: 'salaryMax', elementId: 'edit-salary-max' },
  { fieldKey: 'description', elementId: 'edit-job-description' },
  { fieldKey: 'requirements', elementId: 'edit-job-requirements' },
  { fieldKey: 'requiredSkills', elementId: 'edit-new-skill' },
  { fieldKey: 'expireAt', elementId: 'edit-expire-at' },
];

export function focusFirstErrorField(
  validationErrors: EmployerEditJobFormErrors
): string | null {
  for (const { fieldKey, elementId } of FORM_ERROR_FIELD_ELEMENT_IDS) {
    const errorMessage = validationErrors[fieldKey];
    if (errorMessage) {
      if (typeof document !== 'undefined') {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          if (typeof targetElement.scrollIntoView === 'function') {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (typeof targetElement.focus === 'function') {
            targetElement.focus({ preventScroll: true });
          }
        }
      }
      return errorMessage;
    }
  }

  const firstFallbackErrorMessage = Object.values(validationErrors).find(
    (errorMessage): errorMessage is string => Boolean(errorMessage)
  );

  return firstFallbackErrorMessage || null;
}

const FIELD_ERROR_MESSAGE_CLASS = 'mt-1 text-xs text-rose-600 font-medium';
const INLINE_FIELD_ERROR_MESSAGE_CLASS = 'text-rose-600 font-medium';

const EDIT_JOB_SELECT_CLASS =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer';

const EDIT_JOB_AMOUNT_INPUT_CLASS =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono disabled:cursor-not-allowed disabled:opacity-50';

// Red asterisk after a mandatory field's label.
function RequiredMark() {
  return <span className="text-rose-500" aria-hidden="true">*</span>;
}

interface EditJobSalarySelectFieldProps {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  isRequired?: boolean;
  selectValue: string;
  selectOptions: ReadonlyArray<{ value: string; label: string }>;
  placeholderLabel?: string;
  errorMessage?: string;
  onSelectChange: (nextValue: string) => void;
}

function EditJobSalarySelectField({
  fieldId,
  fieldName,
  fieldLabel,
  isRequired = false,
  selectValue,
  selectOptions,
  placeholderLabel,
  errorMessage,
  onSelectChange,
}: EditJobSalarySelectFieldProps) {
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
        {fieldLabel} {isRequired && <RequiredMark />}
      </label>
      <select
        id={fieldId}
        name={fieldName}
        value={selectValue}
        onChange={(selectChangeEvent) => onSelectChange(selectChangeEvent.target.value)}
        className={EDIT_JOB_SELECT_CLASS}
      >
        {placeholderLabel && <option value="" disabled>{placeholderLabel}</option>}
        {selectOptions.map((selectOption) => (
          <option key={selectOption.value} value={selectOption.value}>
            {selectOption.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{errorMessage}</p>
      )}
    </div>
  );
}

interface EditJobSalaryAmountFieldProps {
  fieldId: string;
  fieldName: 'salaryMin' | 'salaryMax';
  fieldLabel: string;
  isRequired?: boolean;
  placeholder: string;
  amountDisabled: boolean;
  amountValue: number | null | undefined;
  errorMessage?: string;
  onAmountChange: (fieldName: 'salaryMin' | 'salaryMax', rawValue: string) => void;
  wrapperClassName?: string;
}

function EditJobSalaryAmountField({
  fieldId,
  fieldName,
  fieldLabel,
  isRequired = false,
  placeholder,
  amountDisabled,
  amountValue,
  errorMessage,
  onAmountChange,
  wrapperClassName,
}: EditJobSalaryAmountFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
        {fieldLabel} {isRequired && <RequiredMark />}
      </label>
      <input
        id={fieldId}
        name={fieldName}
        type="number"
        min={0}
        disabled={amountDisabled}
        placeholder={placeholder}
        value={amountValue ?? ''}
        onChange={(inputChangeEvent) => onAmountChange(fieldName, inputChangeEvent.target.value)}
        onWheel={(wheelEvent) => wheelEvent.currentTarget.blur()}
        className={EDIT_JOB_AMOUNT_INPUT_CLASS}
      />
      {errorMessage && (
        <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{errorMessage}</p>
      )}
    </div>
  );
}

export function EmployerEditJobSkeleton({ className }: EmployerEditJobSkeletonProps = {}) {
  return (
    <div
      data-testid="edit-job-skeleton"
      className={cn('w-full text-slate-900 pb-20 font-sans', className)}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <div className="space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-6 space-y-4">
              <Skeleton className="h-5 w-52" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-6 space-y-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-[320px] w-full rounded-md" />
            <Skeleton className="h-[220px] w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmployerEditJobErrorView({ errorMessage, onRetry, onBack }: EmployerEditJobErrorViewProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="rounded-md bg-rose-50 p-4 border border-rose-100">
        <FileText className="size-8 text-rose-500" aria-hidden="true" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h2 className="text-xl font-bold text-slate-900">Job posting not found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {errorMessage || "The job you're looking for doesn't exist or has been removed."}
        </p>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={onRetry} variant="secondary" className="cursor-pointer">
          <RefreshCw className="size-3.5 mr-1.5" />
          Retry
        </Button>
        <Button onClick={onBack} variant="outline" className="cursor-pointer">
          Back to My Jobs
        </Button>
      </div>
    </div>
  );
}

// Employer's job edit form and its save/publish/close/reopen/resubmit actions.
export function EmployerEditJobView({ jobId: explicitJobId }: EmployerEditJobViewProps = {}) {
  const routeParameters = useParams();
  const router = useRouter();

  const jobId = explicitJobId || (routeParameters?.id as string);

  const [formValues, setFormValues] = useState<EmployerEditJobFormValues>({
    title: '',
    companyName: '',
    description: '',
    requirements: '',
    location: '',
    city: '',
    country: '',
    minOverlapHours: 4,
    employmentType: 'FullTime',
    experienceLevel: 'EntryLevel',
    workArrangement: 'OnSite',
    requiredSkills: [],
    vacancies: 1,
    expireAt: '',
    salaryType: 'Negotiable',
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    salaryPeriod: null,
  });

  const [formErrors, setFormErrors] = useState<EmployerEditJobFormErrors>({});
  const [skillInputText, setSkillInputText] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<EditJobActionType | null>(null);
  const [actionDialogState, setActionDialogState] = useState<JobActionDialogState>({
    isOpen: false,
    jobId: '',
    jobTitle: '',
    intent: 'close',
  });
  const [overwriteDialogState, setOverwriteDialogState] = useState<{
    isOpen: boolean;
    targetField: 'description' | 'requirements' | null;
  }>({
    isOpen: false,
    targetField: null,
  });

  const {
    data: job,
    isLoading,
    isPending,
    isFetching,
    isError,
    error,
    refetch: refetchJob,
  } = useMyJob(jobId);

  const updateJobMutation = useUpdateJob(jobId);
  const closeJobMutation = useCloseJob();
  const reopenJobMutation = useReopenJob();
  const resubmitJobMutation = useResubmitJob(jobId);

  const generateSkills = useGenerateSkills();
  const generateDescription = useGenerateDescription();
  const generateRequirements = useGenerateRequirements();

  useEffect(() => {
    if (job) {
      const { city: initialCity, country: initialCountry } = parseLocationIntoCityAndCountry(
        job.location,
        job.city,
        job.country
      );

      setFormValues({
        title: job.title || '',
        companyName: job.companyName || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        city: initialCity,
        country: initialCountry,
        minOverlapHours: typeof job.minOverlapHours === 'number' && job.minOverlapHours > 0 ? job.minOverlapHours : 4,
        employmentType: job.employmentType || 'FullTime',
        experienceLevel: job.experienceLevel || 'EntryLevel',
        workArrangement: job.workArrangement || 'OnSite',
        requiredSkills: job.requiredSkills ? [...job.requiredSkills] : [],
        vacancies: typeof job.vacancies === 'number' ? job.vacancies : 1,
        expireAt: job.expireAt ? job.expireAt.slice(0, 10) : '',
        salaryType: job.salaryType || 'Negotiable',
        salaryMin: typeof job.salaryMin === 'number' ? job.salaryMin : null,
        salaryMax: typeof job.salaryMax === 'number' ? job.salaryMax : null,
        salaryCurrency: job.salaryCurrency || null,
        salaryPeriod: job.salaryPeriod || null,
      });
    }
  }, [job]);

  if (isLoading || isPending || isFetching || !jobId) {
    return <EmployerEditJobSkeleton />;
  }

  if (isError || !job) {
    const errorDetailMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as { message?: string })?.message;

    return (
      <EmployerEditJobErrorView
        errorMessage={errorDetailMessage}
        onRetry={() => refetchJob()}
        onBack={() => router.push('/job/job-listing')}
      />
    );
  }

  // A form that can only fail on save shouldn't be shown at all: the backend rejects every edit
  // while a job is under review. The 400 there stays the real guard; this is the polite version.
  if (job.status === 'PendingReview') {
    return (
      <div className="min-h-screen w-full text-slate-900 pb-20 font-sans">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-8 space-y-6">
          <button
            type="button"
            onClick={() => router.push('/job/job-listing')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
            aria-label="Back to My Jobs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to My Jobs</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1>
            <JobStatusBadge status="PendingReview" />
          </div>

          <DeactivationBanner
            status="PendingReview"
            reasonLabel={job.deactivationReasonLabel}
            details={job.deactivationDetails}
            deactivatedAt={job.deactivatedAt}
          />

          <Button
            type="button"
            onClick={() => router.push(`/job/job-listing/${jobId}`)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
          >
            View job
          </Button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldName: keyof EmployerEditJobFormValues, fieldValue: unknown) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [fieldName]: fieldValue,
    }));

    if (formErrors[fieldName as keyof EmployerEditJobFormErrors]) {
      setFormErrors((previousErrors) => {
        const updatedErrors = { ...previousErrors };
        delete updatedErrors[fieldName as keyof EmployerEditJobFormErrors];
        return updatedErrors;
      });
    }
  };

  const handleSalaryTypeChange = (nextSalaryType: string) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      salaryType: nextSalaryType,
      ...(nextSalaryType === 'Negotiable'
        ? { salaryMin: null, salaryMax: null, salaryCurrency: null, salaryPeriod: null }
        : nextSalaryType === 'Fixed'
          ? { salaryMax: null }
          : null),
    }));

    setFormErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };
      delete updatedErrors.salaryType;
      delete updatedErrors.salaryCurrency;
      delete updatedErrors.salaryPeriod;
      delete updatedErrors.salaryMin;
      delete updatedErrors.salaryMax;
      return updatedErrors;
    });
  };

  const handleSalaryAmountChange = (fieldName: 'salaryMin' | 'salaryMax', rawValue: string) => {
    const parsedAmount = rawValue === '' ? null : Number(rawValue);
    handleFieldChange(fieldName, Number.isNaN(parsedAmount) ? null : parsedAmount);
  };

  const isSkillAlreadyAdded = (skillName: string) =>
    formValues.requiredSkills.some(
      (existingSkill) => existingSkill.toLowerCase() === skillName.toLowerCase()
    );

  const clearRequiredSkillsError = () => {
    setFormErrors((previousErrors) => {
      if (!previousErrors.requiredSkills) {
        return previousErrors;
      }
      const updatedErrors = { ...previousErrors };
      delete updatedErrors.requiredSkills;
      return updatedErrors;
    });
  };

  const handleAddSkill = () => {
    const trimmedSkill = skillInputText.trim();
    if (!trimmedSkill) {
      return;
    }

    if (isSkillAlreadyAdded(trimmedSkill)) {
      setSkillInputText('');
      return;
    }

    setFormValues((previousValues) => ({
      ...previousValues,
      requiredSkills: [...previousValues.requiredSkills, trimmedSkill],
    }));
    setSkillInputText('');
    clearRequiredSkillsError();
  };

  const handleSkillInputKeyDown = (keyboardEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      requiredSkills: previousValues.requiredSkills.filter(
        (existingSkill) => existingSkill !== skillNameToRemove
      ),
    }));
  };

  const ensureTitleForAIGeneration = (): boolean => {
    if (!formValues.title || formValues.title.trim().length === 0) {
      toast.error('Please enter a job title first to generate content with AI.');
      const titleElement = document.getElementById('edit-job-title');
      titleElement?.focus();
      return false;
    }
    return true;
  };

  const handleGenerateSkills = () => {
    if (!ensureTitleForAIGeneration()) {
      return;
    }

    generateSkills.mutate(
      {
        title: formValues.title.trim(),
        companyName: formValues.companyName.trim(),
        employmentType: formValues.employmentType,
        experienceLevel: formValues.experienceLevel,
        workArrangement: formValues.workArrangement,
      },
      {
        onSuccess: (skillsResponse) => {
          const existingSkillsLower = new Set(
            formValues.requiredSkills.map((skillItem) => skillItem.toLowerCase().trim())
          );
          const newUniqueSkills: string[] = [];
          for (const generatedSkill of skillsResponse.skills) {
            const normalizedSkill = generatedSkill.toLowerCase().trim();
            if (normalizedSkill.length > 0 && !existingSkillsLower.has(normalizedSkill)) {
              existingSkillsLower.add(normalizedSkill);
              newUniqueSkills.push(generatedSkill.trim());
            }
          }

          if (newUniqueSkills.length > 0) {
            setFormValues((previousValues) => ({
              ...previousValues,
              requiredSkills: [...previousValues.requiredSkills, ...newUniqueSkills],
            }));
            clearRequiredSkillsError();
            toast.success(`Added ${newUniqueSkills.length} new skill(s) with AI.`);
          } else {
            toast.info('All generated skills are already in the list.');
          }
        },
        onError: () => {
          toast.error('Failed to generate skills. Please try again.');
        },
      }
    );
  };

  const executeGenerateDescription = () => {
    generateDescription.mutate(
      {
        title: formValues.title.trim(),
        companyName: formValues.companyName.trim(),
        employmentType: formValues.employmentType,
        experienceLevel: formValues.experienceLevel,
        workArrangement: formValues.workArrangement,
        requiredSkills: formValues.requiredSkills,
      },
      {
        onSuccess: (descriptionResponse) => {
          setFormValues((previousValues) => ({
            ...previousValues,
            description: descriptionResponse.description,
          }));
          setFormErrors((previousErrors) => {
            if (!previousErrors.description) {
              return previousErrors;
            }
            const updatedErrors = { ...previousErrors };
            delete updatedErrors.description;
            return updatedErrors;
          });
          setOverwriteDialogState({ isOpen: false, targetField: null });
          toast.success('Job description generated successfully with AI.');
        },
        onError: () => {
          toast.error('Failed to generate description. Please try again.');
        },
      }
    );
  };

  const handleGenerateDescription = () => {
    if (!ensureTitleForAIGeneration()) {
      return;
    }

    if (formValues.description.trim().length > 0) {
      setOverwriteDialogState({ isOpen: true, targetField: 'description' });
    } else {
      executeGenerateDescription();
    }
  };

  const executeGenerateRequirements = () => {
    generateRequirements.mutate(
      {
        title: formValues.title.trim(),
        companyName: formValues.companyName.trim(),
        employmentType: formValues.employmentType,
        experienceLevel: formValues.experienceLevel,
        workArrangement: formValues.workArrangement,
        requiredSkills: formValues.requiredSkills,
      },
      {
        onSuccess: (requirementsResponse) => {
          setFormValues((previousValues) => ({
            ...previousValues,
            requirements: requirementsResponse.requirements,
          }));
          setFormErrors((previousErrors) => {
            if (!previousErrors.requirements) {
              return previousErrors;
            }
            const updatedErrors = { ...previousErrors };
            delete updatedErrors.requirements;
            return updatedErrors;
          });
          setOverwriteDialogState({ isOpen: false, targetField: null });
          toast.success('Job requirements generated successfully with AI.');
        },
        onError: () => {
          toast.error('Failed to generate requirements. Please try again.');
        },
      }
    );
  };

  const handleGenerateRequirements = () => {
    if (!ensureTitleForAIGeneration()) {
      return;
    }

    if (formValues.requirements.trim().length > 0) {
      setOverwriteDialogState({ isOpen: true, targetField: 'requirements' });
    } else {
      executeGenerateRequirements();
    }
  };

  const isExpired =
    job.status === 'Expired' ||
    Boolean(job.isExpired) ||
    (job.status === 'Published' && Boolean(job.expireAt) && !isDeadlineTodayOrFuture(job.expireAt));

  const isDraftJob = job.status === 'Draft';
  const isClosedJob = job.status === 'Closed';
  // PendingReview already returned the locked state above, so Deactivated is the only
  // moderation status left here.
  const isDeactivatedJob = job.status === 'Deactivated';
  // An admin's decision outranks the deadline, so a deactivated job that is also past its
  // deadline keeps Save & Resubmit instead of the expired job's Save & Re-publish.
  const isExpiredJob = isExpired && !isClosedJob && !isDeactivatedJob;
  const isPublishedJob = job.status === 'Published' && !isExpired;
  const hasValidFutureDeadline = isDeadlineTodayOrFuture(formValues.expireAt);

  const isAnyMutationPending =
    updateJobMutation.isPending ||
    closeJobMutation.isPending ||
    reopenJobMutation.isPending ||
    resubmitJobMutation.isPending;
  const isDraftPending = isAnyMutationPending && pendingAction === 'draft';
  const isPublishPending = isAnyMutationPending && pendingAction === 'publish';
  const isSavePending = isAnyMutationPending && pendingAction === 'save';
  const isReopenPending = isAnyMutationPending && pendingAction === 'reopen';
  const isResubmitPending = isAnyMutationPending && pendingAction === 'resubmit';
  const isClosePending = closeJobMutation.isPending;

  const displayedStatus: JobStatus = isExpiredJob ? 'Expired' : (job.status as JobStatus);

  const displayLocation = formatLocation(formValues.location);
  const displayArrangement = formatWorkArrangement(formValues.workArrangement);
  const displayEmploymentType = formatEmploymentType(formValues.employmentType);
  const displayExperienceLevel = formatExperienceLevel(formValues.experienceLevel);
  const previewAuthorName = formValues.companyName.trim() || job.companyName || 'Hiring Team';
  const previewPostedAt = formatRelativeTime(job.createdAt);

  const needsSalaryAmounts = formValues.salaryType === 'Fixed' || formValues.salaryType === 'Range';
  const salaryAmountsEnabled = Boolean(formValues.salaryCurrency) && Boolean(formValues.salaryPeriod);
  // City and country are mandatory only for On-Site and Hybrid; optional for Remote But Accessible.
  const isCityCountryRequired =
    formValues.workArrangement === 'OnSite' || formValues.workArrangement === 'Hybrid';

  const formattedCreatedAt = formatDisplayDate(job.createdAt);
  const formattedUpdatedAt = formatDisplayDate(job.updatedAt);
  const applicantCount = typeof job.applicantCount === 'number' ? job.applicantCount : 0;

  const handleOpenCloseDialog = () => {
    setActionDialogState({
      isOpen: true,
      jobId: job.id,
      jobTitle: job.title,
      intent: 'close',
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (actionDialogState.intent === 'close') {
        await closeJobMutation.mutateAsync(actionDialogState.jobId);
        setActionDialogState((previousState) => ({
          ...previousState,
          isOpen: false,
        }));
        refetchJob();
      } else if (actionDialogState.intent === 'reopen') {
        await reopenJobMutation.mutateAsync(actionDialogState.jobId);
        setActionDialogState((previousState) => ({
          ...previousState,
          isOpen: false,
        }));
        refetchJob();
      }
    } catch {
    }
  };

  const runValidatedSubmit = (actionType: EditJobActionType): boolean => {
    const validationErrors = validateEditJobForm(formValues, actionType);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMessage = focusFirstErrorField(validationErrors);
      toast.error(firstErrorMessage || 'Please resolve validation errors before saving.');
      return false;
    }
    return true;
  };

  const reportInvalidDeadline = (deadlineActionLabel: string): boolean => {
    if (isDeadlineTodayOrFuture(formValues.expireAt)) {
      return false;
    }
    focusFirstErrorField({ expireAt: `Application deadline must be today or in the future to ${deadlineActionLabel}.` });
    toast.error(`Application deadline must be today or in the future to ${deadlineActionLabel}.`);
    return true;
  };

  const handleSaveAsDraft = () => {
    if (!runValidatedSubmit('draft')) {
      return;
    }

    setPendingAction('draft');
    updateJobMutation.mutate(
      { values: formValues, publish: false },
      { onSettled: () => setPendingAction(null) }
    );
  };

  const handlePublishDraft = () => {
    if (!runValidatedSubmit('publish')) {
      return;
    }

    setPendingAction('publish');
    updateJobMutation.mutate(
      { values: formValues, publish: true },
      { onSettled: () => setPendingAction(null) }
    );
  };

  const handleSaveChanges = () => {
    if (!runValidatedSubmit('save')) {
      return;
    }

    setPendingAction('save');
    updateJobMutation.mutate(
      { values: formValues, publish: false, successMessage: 'Changes saved successfully' },
      { onSettled: () => setPendingAction(null) }
    );
  };

  const handleSaveAndReopen = async () => {
    if (!runValidatedSubmit('publish')) {
      return;
    }

    if (reportInvalidDeadline('reopen')) {
      return;
    }

    setPendingAction('reopen');
    try {
      await updateJobMutation.mutateAsync({
        values: formValues,
        publish: false,
        successMessage: 'Changes saved',
      });
      await reopenJobMutation.mutateAsync(jobId);
      router.push('/job/job-listing');
    } catch {
    } finally {
      setPendingAction(null);
    }
  };

  const handleSaveAndResubmit = async () => {
    // Same required fields as publishing, so the employer is told what's missing here rather
    // than by a rejected request.
    if (!runValidatedSubmit('resubmit')) {
      return;
    }

    if (reportInvalidDeadline('resubmit')) {
      return;
    }

    setPendingAction('resubmit');
    try {
      // Saved with publish: false — the job goes back for review, and only an admin can
      // make it public again. The backend rejects publish: true on a deactivated job.
      await updateJobMutation.mutateAsync({
        values: formValues,
        publish: false,
        successMessage: 'Changes saved',
      });
      await resubmitJobMutation.mutateAsync(jobId);
      router.push('/job/job-listing');
    } catch {
      // Both hooks toast the reason; staying on the page keeps the employer's edits.
    } finally {
      setPendingAction(null);
    }
  };

  const handleSaveAndRepublish = () => {
    if (!runValidatedSubmit('publish')) {
      return;
    }

    if (reportInvalidDeadline('re-publish')) {
      return;
    }

    setPendingAction('publish');
    updateJobMutation.mutate(
      { values: formValues, publish: true, successMessage: 'Job re-published successfully' },
      {
        onSuccess: () => {
          router.push('/job/job-listing');
        },
        onSettled: () => setPendingAction(null),
      }
    );
  };

  return (
    <PortalPageContainer className="pb-20">
      <div className="space-y-6">
        {/* In-page Header: Back link, Title, Status, and Action buttons */}
        <PortalPageHeader
          eyebrow={
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => router.push('/job/job-listing')}
                className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                aria-label="Back to My Jobs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to My Jobs</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">Edit Posting</span>
            </div>
          }
          title={
            <div className="flex flex-wrap items-center gap-3">
              Edit Job
              <JobStatusBadge status={displayedStatus} />
            </div>
          }
          actions={
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/job/job-listing')}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            {isDraftJob && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveAsDraft}
                  className="cursor-pointer"
                >
                  {isDraftPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  disabled={isAnyMutationPending}
                  onClick={handlePublishDraft}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                >
                  {isPublishPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Publish Job
                </Button>
              </>
            )}

            {isPublishedJob && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAnyMutationPending}
                  onClick={handleOpenCloseDialog}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 cursor-pointer"
                >
                  {isClosePending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Close Job
                </Button>
                <Button
                  type="button"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveChanges}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                >
                  {isSavePending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save Changes
                </Button>
              </>
            )}

            {isClosedJob && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveChanges}
                  className="cursor-pointer"
                >
                  {isSavePending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save Changes
                </Button>
                {hasValidFutureDeadline && (
                  <Button
                    type="button"
                    disabled={isAnyMutationPending}
                    onClick={handleSaveAndReopen}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                  >
                    {isReopenPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                    Save &amp; Reopen
                  </Button>
                )}
              </>
            )}

            {isDeactivatedJob && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveChanges}
                  className="cursor-pointer"
                >
                  {isSavePending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveAndResubmit}
                  className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  {isResubmitPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save &amp; Resubmit
                </Button>
              </>
            )}

            {isExpiredJob && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAnyMutationPending}
                  onClick={handleSaveChanges}
                  className="cursor-pointer"
                >
                  {isSavePending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                  Save Changes
                </Button>
                {hasValidFutureDeadline && (
                  <Button
                    type="button"
                    disabled={isAnyMutationPending}
                    onClick={handleSaveAndRepublish}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                  >
                    {isPublishPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
                    Save &amp; Re-publish
                  </Button>
                )}
              </>
            )}
          </div>
          }
        />

        {/* Status Notification Banners */}
        <DeactivationBanner
          status={job.status as JobStatus}
          reasonLabel={job.deactivationReasonLabel}
          details={job.deactivationDetails}
          deactivatedAt={job.deactivatedAt}
        />

        {job.status === 'Closed' && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-100/80 px-4 py-3 text-sm text-slate-700"
          >
            <Info className="size-5 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="font-medium">
              This job is currently Closed. You can update its details and set a future deadline to reopen it.
            </p>
          </div>
        )}

        {isExpired && job.status !== 'Closed' && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="font-medium">
              {hasValidFutureDeadline
                ? "This job is currently Expired. Click 'Save & Re-publish' to make it active, or 'Save Changes' to keep it offline as Expired."
                : "This job has Expired. Update the application deadline below to re-publish it, or click 'Save Changes' to update details while keeping it offline."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <div className="space-y-6">
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">General Information</h2>
                <p className="mt-1 text-xs text-slate-500">Core position details and company attribution</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-job-title" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Job Title <RequiredMark />
                  </label>
                  <input
                    id="edit-job-title"
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    value={formValues.title}
                    onChange={(inputChangeEvent) => handleFieldChange('title', inputChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {formErrors.title && <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.title}</p>}
                </div>

                <div>
                  <label htmlFor="edit-company-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company Name <RequiredMark />
                  </label>
                  <input
                    id="edit-company-name"
                    name="companyName"
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={formValues.companyName}
                    onChange={(inputChangeEvent) => handleFieldChange('companyName', inputChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {formErrors.companyName && (
                    <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.companyName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">Role Details &amp; Classification</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Employment structure, work arrangement, experience level, and staffing requirements
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-employment-type" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Employment Type <RequiredMark />
                  </label>
                  <select
                    id="edit-employment-type"
                    name="employmentType"
                    value={formValues.employmentType}
                    onChange={(selectChangeEvent) => handleFieldChange('employmentType', selectChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {EMPLOYMENT_TYPE_OPTIONS.map((employmentOption) => (
                      <option key={employmentOption.value} value={employmentOption.value}>
                        {employmentOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-work-arrangement" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Work Arrangement <RequiredMark />
                  </label>
                  <select
                    id="edit-work-arrangement"
                    name="workArrangement"
                    value={formValues.workArrangement}
                    onChange={(selectChangeEvent) => handleFieldChange('workArrangement', selectChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {WORK_ARRANGEMENT_OPTIONS.map((arrangementOption) => (
                      <option key={arrangementOption.value} value={arrangementOption.value}>
                        {arrangementOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-experience-level" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Experience Level <RequiredMark />
                  </label>
                  <select
                    id="edit-experience-level"
                    name="experienceLevel"
                    value={formValues.experienceLevel}
                    onChange={(selectChangeEvent) => handleFieldChange('experienceLevel', selectChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {EXPERIENCE_LEVEL_OPTIONS.map((levelOption) => (
                      <option key={levelOption.value} value={levelOption.value}>
                        {levelOption.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-vacancies" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vacancies <RequiredMark />
                  </label>
                  <input
                    id="edit-vacancies"
                    name="vacancies"
                    type="number"
                    min={1}
                    value={formValues.vacancies}
                    onChange={(inputChangeEvent) =>
                      handleFieldChange('vacancies', Math.max(1, parseInt(inputChangeEvent.target.value, 10) || 1))
                    }
                    onWheel={(wheelEvent) => wheelEvent.currentTarget.blur()}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                  {formErrors.vacancies && (
                    <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.vacancies}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-city" className="block text-sm font-medium text-slate-700 mb-1.5">
                    City {isCityCountryRequired ? <RequiredMark /> : <span className="font-normal text-slate-400">(optional)</span>}
                  </label>
                  <input
                    id="edit-city"
                    name="city"
                    type="text"
                    placeholder="e.g. Dhaka"
                    value={formValues.city}
                    onChange={(inputChangeEvent) => {
                      const newCity = inputChangeEvent.target.value;
                      handleFieldChange('city', newCity);
                      if (formValues.country) {
                        handleFieldChange('location', `${newCity}, ${formValues.country}`);
                      } else {
                        handleFieldChange('location', newCity);
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {formErrors.city && (
                    <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-country" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Country {isCityCountryRequired ? <RequiredMark /> : <span className="font-normal text-slate-400">(optional)</span>}
                  </label>
                  <input
                    id="edit-country"
                    name="country"
                    type="text"
                    placeholder="e.g. Bangladesh"
                    value={formValues.country}
                    onChange={(inputChangeEvent) => {
                      const newCountry = inputChangeEvent.target.value;
                      handleFieldChange('country', newCountry);
                      if (formValues.city) {
                        handleFieldChange('location', `${formValues.city}, ${newCountry}`);
                      } else {
                        handleFieldChange('location', newCountry);
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {formErrors.country && (
                    <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.country}</p>
                  )}
                </div>

                {formValues.workArrangement === 'FullRemote' && (
                  <div>
                    <label htmlFor="edit-min-overlap" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Min Overlap Hours (UTC) <RequiredMark />
                    </label>
                    <input
                      id="edit-min-overlap"
                      name="minOverlapHours"
                      type="number"
                      min={1}
                      max={12}
                      value={formValues.minOverlapHours}
                      onChange={(inputChangeEvent) =>
                        handleFieldChange('minOverlapHours', Math.max(1, parseInt(inputChangeEvent.target.value, 10) || 1))
                      }
                      onWheel={(wheelEvent) => wheelEvent.currentTarget.blur()}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                    {formErrors.minOverlapHours && (
                      <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.minOverlapHours}</p>
                    )}
                  </div>
                )}

                <div className={formValues.workArrangement !== 'FullRemote' ? 'sm:col-span-2' : ''}>
                  <label htmlFor="edit-location" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Location Description <RequiredMark />
                  </label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    placeholder={formValues.workArrangement === 'FullRemote' ? 'e.g. Worldwide / Remote' : 'e.g. Dhaka, Bangladesh'}
                    value={formValues.location}
                    onChange={(inputChangeEvent) => handleFieldChange('location', inputChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {formErrors.location && (
                    <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.location}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">Compensation</h2>
                <p className="mt-1 text-xs text-slate-500">Salary type, currency, period, and amounts shown to candidates</p>
              </div>

              <div className="space-y-4">
                <EditJobSalarySelectField
                  fieldId="edit-salary-type"
                  fieldName="salaryType"
                  fieldLabel="Salary Type"
                  isRequired
                  selectValue={formValues.salaryType || 'Negotiable'}
                  selectOptions={SALARY_TYPE_OPTIONS}
                  errorMessage={formErrors.salaryType}
                  onSelectChange={handleSalaryTypeChange}
                />

                {needsSalaryAmounts && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditJobSalarySelectField
                      fieldId="edit-salary-currency"
                      fieldName="salaryCurrency"
                      fieldLabel="Currency"
                      isRequired
                      selectValue={formValues.salaryCurrency || ''}
                      selectOptions={CURRENCY_OPTIONS}
                      placeholderLabel="Select currency"
                      errorMessage={formErrors.salaryCurrency}
                      onSelectChange={(nextValue) => handleFieldChange('salaryCurrency', nextValue || null)}
                    />

                    <EditJobSalarySelectField
                      fieldId="edit-salary-period"
                      fieldName="salaryPeriod"
                      fieldLabel="Period"
                      isRequired
                      selectValue={formValues.salaryPeriod || ''}
                      selectOptions={SALARY_PERIOD_OPTIONS}
                      placeholderLabel="Select period"
                      errorMessage={formErrors.salaryPeriod}
                      onSelectChange={(nextValue) => handleFieldChange('salaryPeriod', nextValue || null)}
                    />

                    {!salaryAmountsEnabled && (
                      <p className="sm:col-span-2 text-xs text-slate-400 italic">
                        Select a currency and period to enter salary amounts.
                      </p>
                    )}

                    {formValues.salaryType === 'Fixed' ? (
                      <EditJobSalaryAmountField
                        fieldId="edit-salary-min"
                        fieldName="salaryMin"
                        fieldLabel="Amount"
                        isRequired
                        placeholder="e.g. 80000"
                        amountDisabled={!salaryAmountsEnabled}
                        amountValue={formValues.salaryMin}
                        errorMessage={formErrors.salaryMin}
                        onAmountChange={handleSalaryAmountChange}
                        wrapperClassName="sm:col-span-2"
                      />
                    ) : (
                      <>
                        <EditJobSalaryAmountField
                          fieldId="edit-salary-min"
                          fieldName="salaryMin"
                          fieldLabel="Min Amount"
                          isRequired
                          placeholder="e.g. 80000"
                          amountDisabled={!salaryAmountsEnabled}
                          amountValue={formValues.salaryMin}
                          errorMessage={formErrors.salaryMin}
                          onAmountChange={handleSalaryAmountChange}
                        />

                        <EditJobSalaryAmountField
                          fieldId="edit-salary-max"
                          fieldName="salaryMax"
                          fieldLabel="Max Amount"
                          isRequired
                          placeholder="e.g. 100000"
                          amountDisabled={!salaryAmountsEnabled}
                          amountValue={formValues.salaryMax}
                          errorMessage={formErrors.salaryMax}
                          onAmountChange={handleSalaryAmountChange}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4 flex-wrap">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Role Description <RequiredMark /></h2>
                  <p className="mt-1 text-xs text-slate-500">Comprehensive overview of duties and expectations</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {formValues.description.length.toLocaleString()} / 10,000 characters
                  </span>
                  <AIGenerateButton
                    onClick={handleGenerateDescription}
                    isLoading={generateDescription.isPending}
                    label="Generate Description"
                  />
                </div>
              </div>

              <div>
                <textarea
                  id="edit-job-description"
                  name="description"
                  rows={8}
                  maxLength={10000}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formValues.description}
                  onChange={(textareaChangeEvent) => handleFieldChange('description', textareaChangeEvent.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Minimum 20 characters</span>
                  {formErrors.description && (
                    <span role="alert" className={INLINE_FIELD_ERROR_MESSAGE_CLASS}>{formErrors.description}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4 flex-wrap">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Requirements <RequiredMark /></h2>
                  <p className="mt-1 text-xs text-slate-500">Must-have qualifications, experience, and skills for this role</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {formValues.requirements.length.toLocaleString()} / 5,000 characters
                  </span>
                  <AIGenerateButton
                    onClick={handleGenerateRequirements}
                    isLoading={generateRequirements.isPending}
                    label="Generate Requirements"
                  />
                </div>
              </div>

              <div>
                <textarea
                  id="edit-job-requirements"
                  name="requirements"
                  rows={8}
                  maxLength={5000}
                  placeholder="List the required qualifications, experience, and skills..."
                  value={formValues.requirements}
                  onChange={(textareaChangeEvent) => handleFieldChange('requirements', textareaChangeEvent.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Required to publish</span>
                  {formErrors.requirements && (
                    <span role="alert" className={INLINE_FIELD_ERROR_MESSAGE_CLASS}>{formErrors.requirements}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-4 flex-wrap">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Required Skills <RequiredMark /></h2>
                  <p className="mt-1 text-xs text-slate-500">Key technologies and competencies required from candidates</p>
                </div>
                <AIGenerateButton
                  onClick={handleGenerateSkills}
                  isLoading={generateSkills.isPending}
                  label="Generate Skills"
                />
              </div>

              <div className="space-y-4">
                <div data-testid="skills-pill-list" className="flex flex-wrap items-center gap-2 min-h-8">
                  {formValues.requiredSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No skills added yet. Type a skill below or use Generate Skills.
                    </p>
                  ) : (
                    formValues.requiredSkills.map((skillName) => (
                      <span
                        key={skillName}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-800"
                      >
                        <span>{skillName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillName)}
                          className="text-emerald-600 hover:text-emerald-900 cursor-pointer transition-colors p-0.5"
                          aria-label={`Remove skill ${skillName}`}
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    id="edit-new-skill"
                    type="text"
                    placeholder="Add a required skill (e.g. Next.js, PyTorch)..."
                    value={skillInputText}
                    onChange={(inputChangeEvent) => setSkillInputText(inputChangeEvent.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add
                  </button>
                </div>
                {formErrors.requiredSkills && (
                  <p role="alert" className={cn('text-xs', INLINE_FIELD_ERROR_MESSAGE_CLASS)}>{formErrors.requiredSkills}</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">Timeline &amp; Expiration</h2>
                <p className="mt-1 text-xs text-slate-500">Configure the closing deadline for candidate applications</p>
              </div>

              <div>
                <label htmlFor="edit-expire-at" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Application Deadline / Expiry Date <RequiredMark />
                </label>
                <div className="relative w-full sm:w-64">
                  <input
                    id="edit-expire-at"
                    name="expireAt"
                    type="date"
                    value={formValues.expireAt}
                    onChange={(inputChangeEvent) => handleFieldChange('expireAt', inputChangeEvent.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono cursor-pointer"
                  />
                </div>
                {formErrors.expireAt && (
                  <p role="alert" className={FIELD_ERROR_MESSAGE_CLASS}>{formErrors.expireAt}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Live Job Card Preview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time candidate card appearance</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-2xs font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Live Preview
                </span>
              </div>

              <div
                data-testid="live-job-card-preview"
                className="bg-white border border-slate-200/90 rounded-md p-5 sm:p-6 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">
                        {formValues.companyName || 'Company Name'}
                      </p>
                      <span className="text-base font-semibold text-emerald-800 tracking-tight line-clamp-1 mt-0.5">
                        {formValues.title || 'Untitled Role'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <JobStatusBadge status={displayedStatus} />
                      <span
                        aria-hidden="true"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50/60 text-slate-500"
                      >
                        <MoreVertical className="size-4" />
                      </span>
                    </div>
                  </div>

                    <div className="mt-2.5">
                      <EmployerJobSalaryBadge
                        salaryType={formValues.salaryType}
                        salaryMin={formValues.salaryMin}
                        salaryMax={formValues.salaryMax}
                        salaryCurrency={formValues.salaryCurrency}
                        salaryPeriod={formValues.salaryPeriod}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-2 font-normal">
                    <span>{displayEmploymentType || 'Full Time'}</span>
                    <span aria-hidden="true" className="text-slate-300">•</span>
                    <span>Experience: {displayExperienceLevel || '5-8 years'}</span>
                    <span aria-hidden="true" className="text-slate-300">•</span>
                    <span>{displayLocation || displayArrangement || 'Remote'}</span>
                    <span aria-hidden="true" className="text-slate-300">•</span>
                    <span className="font-medium text-slate-700">
                      {applicantCount} {applicantCount === 1 ? 'Applicant' : 'Applicants'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="border-t border-slate-100 my-4" />

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                      <User className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="font-medium text-slate-700 truncate">
                        {previewAuthorName}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">•</span>
                      <span className="text-slate-400 shrink-0">
                        {previewPostedAt}
                      </span>
                    </div>

                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs shrink-0"
                    >
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">Job Details &amp; Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Key metadata for this posting</p>
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-medium inline-flex items-center gap-1.5">
                    <Hash className="size-3.5 text-slate-400" />
                    Job ID
                  </dt>
                  <dd className="font-mono text-slate-800 truncate max-w-[170px]" title={job.id}>
                    {job.id}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-medium inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-slate-400" />
                    Created At
                  </dt>
                  <dd className="text-slate-800 font-medium">{formattedCreatedAt}</dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-medium inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-slate-400" />
                    Last Updated At
                  </dt>
                  <dd className="text-slate-800 font-medium">{formattedUpdatedAt}</dd>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500 font-medium inline-flex items-center gap-1.5">
                    <Users className="size-3.5 text-slate-400" />
                    Total Applicants
                  </dt>
                  <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {applicantCount}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-500 font-medium">Status</dt>
                  <dd>
                    <JobStatusBadge status={displayedStatus} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <JobActionConfirmDialog
        open={actionDialogState.isOpen}
        onOpenChange={(nextOpen) =>
          setActionDialogState((previousState) => ({
            ...previousState,
            isOpen: nextOpen,
          }))
        }
        jobTitle={actionDialogState.jobTitle}
        intent={actionDialogState.intent}
        isPending={closeJobMutation.isPending || reopenJobMutation.isPending}
        onConfirm={handleConfirmAction}
      />

      {overwriteDialogState.isOpen && overwriteDialogState.targetField && (
        <AIOverwriteConfirmDialog
          open={overwriteDialogState.isOpen}
          onOpenChange={(nextOpen) =>
            setOverwriteDialogState((previousState) => ({
              ...previousState,
              isOpen: nextOpen,
              targetField: nextOpen ? previousState.targetField : null,
            }))
          }
          targetField={overwriteDialogState.targetField}
          isLoading={generateDescription.isPending || generateRequirements.isPending}
          onConfirm={() => {
            if (overwriteDialogState.targetField === 'description') {
              executeGenerateDescription();
            } else if (overwriteDialogState.targetField === 'requirements') {
              executeGenerateRequirements();
            }
          }}
        />
      )}
    </PortalPageContainer>
  );
}
