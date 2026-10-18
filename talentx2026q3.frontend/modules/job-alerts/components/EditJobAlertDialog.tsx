'use client';

import { useState } from 'react';
import { Loader2, Sliders } from 'lucide-react';
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
import { useUpdateJobAlert } from '../hooks';
import type { JobAlert } from '../types';
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
  WorkArrangement,
} from '@/types/job';

export interface EditJobAlertDialogProps {
  readonly alert: JobAlert | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onAlertUpdated?: () => void;
}

interface EditJobAlertFormProps {
  readonly alert: JobAlert;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}

function EditJobAlertForm({ alert, onCancel, onSuccess }: EditJobAlertFormProps) {
  const [name, setName] = useState(alert.name);
  const [title, setTitle] = useState(alert.title);
  const [location, setLocation] = useState(alert.location ?? '');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>(
    alert.employmentType ?? ''
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    alert.experienceLevel ?? ''
  );
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | ''>(
    alert.workArrangement ?? ''
  );

  const [nameError, setNameError] = useState('');
  const [titleError, setTitleError] = useState('');

  const updateAlertMutation = useUpdateJobAlert();

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
      await updateAlertMutation.mutateAsync({
        id: alert.id,
        input: {
          name: trimmedName,
          title: trimmedTitle,
          location: trimmedLocation || null,
          employmentType: employmentType ? employmentType : null,
          experienceLevel: experienceLevel ? experienceLevel : null,
          workArrangement: workArrangement ? workArrangement : null,
        },
      });

      onSuccess();
    } catch {
      // Handled globally by the mutation hook with toast notification
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="edit-alert-name-input" className="text-xs font-bold text-slate-700">
          Alert Name <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="edit-alert-name-input"
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
        <Label htmlFor="edit-alert-title-input" className="text-xs font-bold text-slate-700">
          Role or Keyword <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="edit-alert-title-input"
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
        <Label htmlFor="edit-alert-location-input" className="text-xs font-bold text-slate-700">
          Location (Optional)
        </Label>
        <Input
          id="edit-alert-location-input"
          type="text"
          placeholder="e.g. Remote, San Francisco, London"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="h-10 text-sm rounded-xl border-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="edit-alert-employment-type" className="text-xs font-bold text-slate-700">
            Job Type
          </Label>
          <select
            id="edit-alert-employment-type"
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
          <Label htmlFor="edit-alert-experience-level" className="text-xs font-bold text-slate-700">
            Experience
          </Label>
          <select
            id="edit-alert-experience-level"
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
          <Label htmlFor="edit-alert-work-arrangement" className="text-xs font-bold text-slate-700">
            Work Mode
          </Label>
          <select
            id="edit-alert-work-arrangement"
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
          disabled={updateAlertMutation.isPending}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 transition-all disabled:opacity-50"
        >
          {updateAlertMutation.isPending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" />
              Saving Changes…
            </span>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditJobAlertDialog({
  alert,
  open,
  onOpenChange,
  onAlertUpdated,
}: EditJobAlertDialogProps) {
  if (!alert) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 sm:p-7">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sliders className="size-4.5 text-emerald-700" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit Job Alert
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update search criteria and notification preferences for this alert.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <EditJobAlertForm
            alert={alert}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              onAlertUpdated?.();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
