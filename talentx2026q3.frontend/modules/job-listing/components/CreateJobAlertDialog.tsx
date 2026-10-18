'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHeaderSession } from '@/components/common/use-header-session';
import { useCreateJobAlert } from '@/modules/job-alerts';
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENT_LABELS,
  WORK_ARRANGEMENTS,
} from '@/types/job';
import type {
  EmploymentType,
  ExperienceLevel,
  JobFilterParams,
  WorkArrangement,
} from '@/types/job';

export interface CreateJobAlertDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly filters?: JobFilterParams;
  readonly onAlertCreated?: (alertId: string) => void;
}

interface CreateJobAlertFormProps {
  readonly filters?: JobFilterParams;
  readonly onCancel: () => void;
  readonly onSuccess: (alertId: string) => void;
}

function CreateJobAlertForm({ filters, onCancel, onSuccess }: CreateJobAlertFormProps) {
  const activeKeyword = filters?.keyword?.trim() ?? '';
  const activeLocation = filters?.location?.trim() ?? '';
  const suggestedName = activeKeyword
    ? `${activeKeyword}${activeLocation ? ` in ${activeLocation}` : ''} Alert`
    : 'Tech Job Alert';

  const [name, setName] = useState(suggestedName);
  const [title, setTitle] = useState(activeKeyword);
  const [location, setLocation] = useState(activeLocation);
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>(
    filters?.employmentType ?? ''
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    filters?.experienceLevel ?? ''
  );
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | ''>(
    filters?.workArrangement ?? ''
  );

  const [nameError, setNameError] = useState('');
  const [titleError, setTitleError] = useState('');

  const createAlertMutation = useCreateJobAlert();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let hasValidationErrors = false;

    const trimmedName = name.trim();
    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      setNameError('Alert name is required.');
      hasValidationErrors = true;
    } else {
      setNameError('');
    }

    if (!trimmedTitle) {
      setTitleError('Role or title keyword is required.');
      hasValidationErrors = true;
    } else {
      setTitleError('');
    }

    if (hasValidationErrors) {
      return;
    }

    try {
      const createdAlertId = await createAlertMutation.mutateAsync({
        name: trimmedName,
        title: trimmedTitle,
        location: trimmedLocation || null,
        employmentType: employmentType ? employmentType : null,
        experienceLevel: experienceLevel ? experienceLevel : null,
        workArrangement: workArrangement ? workArrangement : null,
      });

      onSuccess(createdAlertId);
    } catch {
      // Handled globally by the mutation hook with toast notification
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="alert-name-input" className="text-xs font-bold text-slate-700">
          Alert Name <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="alert-name-input"
          type="text"
          placeholder="e.g. Senior .NET Engineer in Remote"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (nameError) setNameError('');
          }}
          aria-invalid={Boolean(nameError)}
          className="h-10 text-sm rounded-xl border-slate-200"
        />
        {nameError && (
          <p className="text-xs font-medium text-rose-600" role="alert">
            {nameError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alert-title-input" className="text-xs font-bold text-slate-700">
          Role or Keyword <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="alert-title-input"
          type="text"
          placeholder="e.g. .NET Engineer, Machine Learning, Fullstack"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError) setTitleError('');
          }}
          aria-invalid={Boolean(titleError)}
          className="h-10 text-sm rounded-xl border-slate-200"
        />
        {titleError && (
          <p className="text-xs font-medium text-rose-600" role="alert">
            {titleError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="alert-location-input" className="text-xs font-bold text-slate-700">
          Location (Optional)
        </Label>
        <Input
          id="alert-location-input"
          type="text"
          placeholder="e.g. Remote, San Francisco, London"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="h-10 text-sm rounded-xl border-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="alert-employment-type-select" className="text-xs font-bold text-slate-700">
            Job Type
          </Label>
          <select
            id="alert-employment-type-select"
            aria-label="Filter by employment type"
            value={employmentType}
            onChange={(event) => setEmploymentType(event.target.value as EmploymentType | '')}
            className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 py-1 text-xs text-slate-800 transition-colors focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20 outline-none cursor-pointer"
          >
            <option value="">Any Type</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="alert-experience-level-select" className="text-xs font-bold text-slate-700">
            Experience
          </Label>
          <select
            id="alert-experience-level-select"
            aria-label="Filter by experience level"
            value={experienceLevel}
            onChange={(event) => setExperienceLevel(event.target.value as ExperienceLevel | '')}
            className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 py-1 text-xs text-slate-800 transition-colors focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20 outline-none cursor-pointer"
          >
            <option value="">Any Level</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="alert-work-arrangement-select" className="text-xs font-bold text-slate-700">
            Work Mode
          </Label>
          <select
            id="alert-work-arrangement-select"
            aria-label="Filter by work arrangement"
            value={workArrangement}
            onChange={(event) => setWorkArrangement(event.target.value as WorkArrangement | '')}
            className="h-10 w-full rounded-xl border border-input bg-transparent px-2.5 py-1 text-xs text-slate-800 transition-colors focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-700/20 outline-none cursor-pointer"
          >
            <option value="">Any Mode</option>
            {WORK_ARRANGEMENTS.map((arrangement) => (
              <option key={arrangement} value={arrangement}>
                {WORK_ARRANGEMENT_LABELS[arrangement]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter className="mt-6 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createAlertMutation.isPending}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all disabled:opacity-50"
        >
          {createAlertMutation.isPending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" />
              Creating Alert…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Bell className="size-4" />
              Create Alert
            </span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateJobAlertDialog({
  open,
  onOpenChange,
  filters,
  onAlertCreated,
}: CreateJobAlertDialogProps) {
  const router = useRouter();
  const { isAuthenticated, isEmployer } = useHeaderSession();

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="size-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto sm:mx-0">
              <BellRing className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Sign in to Create Job Alerts
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 leading-relaxed">
              Never miss an opportunity. Sign in as a candidate to get notified by email as soon as new jobs matching your skills and criteria are posted.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/login?returnUrl=/jobs')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all cursor-pointer"
            >
              Sign In to Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isEmployer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="size-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto sm:mx-0">
              <Briefcase className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Candidate Job Alerts
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 leading-relaxed">
              Job alerts are exclusively available for candidate accounts. To post openings and manage your candidate pipeline, please head over to your employer portal.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                router.push('/employers/jobs');
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-all cursor-pointer"
            >
              Go to Employer Portal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Bell className="size-4.5 text-emerald-700" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Create Job Alert
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Receive email alerts whenever new roles matching your criteria are published.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <CreateJobAlertForm
            filters={filters}
            onCancel={() => onOpenChange(false)}
            onSuccess={(createdAlertId) => {
              onOpenChange(false);
              onAlertCreated?.(createdAlertId);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
