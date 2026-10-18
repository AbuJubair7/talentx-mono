import { CalendarClock, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BULK_STATUS_OPTIONS } from '../constants';
import type { ApplicationStatus } from '../types/applicant.types';

interface BulkActionsBarProps {
  selectedCount: number;
  isUpdating: boolean;
  onBulkStatusChange: (status: ApplicationStatus) => void | Promise<void>;
  onClearSelection: () => void;
  onInviteToInterview?: () => void;
}

export function BulkActionsBar({
  selectedCount,
  isUpdating,
  onBulkStatusChange,
  onClearSelection,
  onInviteToInterview,
}: BulkActionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 text-white p-3 px-4 rounded-xl shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <CheckSquare className="size-4 text-emerald-400" />
        <span>
          {selectedCount} candidate{selectedCount > 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="flex items-center gap-3">
        {onInviteToInterview ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onInviteToInterview}
            disabled={isUpdating}
            className="h-8 gap-1.5 text-xs font-medium bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer"
          >
            <CalendarClock className="size-3.5" />
            Invite to Interview
          </Button>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">Set status:</span>
          <Select
            onValueChange={(val) => { void onBulkStatusChange(val as ApplicationStatus); }}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-35 h-8 text-xs font-medium bg-slate-800 text-white data-placeholder:text-white border-slate-700 rounded-lg cursor-pointer">
              <SelectValue placeholder="Bulk update..." />
            </SelectTrigger>
            <SelectContent>
              {BULK_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          disabled={isUpdating}
          className="text-xs font-medium text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
