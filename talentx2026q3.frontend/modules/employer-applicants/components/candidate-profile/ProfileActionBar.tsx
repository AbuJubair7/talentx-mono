'use client';

import { Download, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ApplicationStatus, StatusOption } from '../../types/applicant.types';
import { nonBlankText } from '../../utils/profileData';

interface ProfileActionBarProps {
  statusValue: ApplicationStatus | null;
  currentStatus: ApplicationStatus | null;
  statusOptions: readonly StatusOption[];
  onStatusChange: (status: ApplicationStatus) => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
  resumeUrl: string | null;
}

const secondaryActionClass =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

export function ProfileActionBar({
  statusValue,
  currentStatus,
  statusOptions,
  onStatusChange,
  onSave,
  canSave,
  saving,
  resumeUrl,
}: ProfileActionBarProps) {
  const resumeHref = nonBlankText(resumeUrl);

  return (
    <div className="sticky bottom-0 z-30 mt-6 w-full border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span id="candidate-status-label" className="whitespace-nowrap text-sm font-medium text-ink">
            Move candidate to:
          </span>
          <Select
            value={statusValue}
            onValueChange={(val) => onStatusChange(val as ApplicationStatus)}
            disabled={saving}
          >
            <SelectTrigger
              aria-labelledby="candidate-status-label"
              className="h-9 w-44 cursor-pointer border-line bg-surface text-sm"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.value === currentStatus}
                  className="cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving}
            aria-busy={saving}
            className="inline-flex h-9 min-w-[112px] items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {saving ? 'Saving…' : 'Save status'}
          </button>
        </div>

        {resumeHref && (
          <div className="flex md:items-center">
            <a href={resumeHref} target="_blank" rel="noreferrer" className={secondaryActionClass}>
              <Download className="size-4" aria-hidden="true" />
              Download Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
