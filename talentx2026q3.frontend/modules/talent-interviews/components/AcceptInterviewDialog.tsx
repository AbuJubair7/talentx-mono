'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/date';
import { TALENT_INTERVIEW_FALLBACKS } from '../constants/interview.constants';
import { formatTimeslotRange } from '../utils/interview.utils';
import { useAcceptInterview } from '../hooks/useAcceptInterview';
import type { TalentInterviewDto } from '../types/interview.types';

interface AcceptInterviewDialogProps {
  interview: TalentInterviewDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcceptInterviewDialog({ interview, open, onOpenChange }: AcceptInterviewDialogProps) {
  const [selectedTimeslotId, setSelectedTimeslotId] = useState<string | null>(null);
  const acceptMutation = useAcceptInterview();

  const hasTimeslots = interview.timeslots.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedTimeslotId(null);
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    try {
      const response = await acceptMutation.mutateAsync({
        invitationId: interview.id,
        payload: { selectedTimeslotId: selectedTimeslotId ?? undefined },
      });
      toast.success(response?.message || 'Interview invitation accepted.');
      handleOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, TALENT_INTERVIEW_FALLBACKS.ERROR_ACCEPT));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogTitle>Accept Interview</DialogTitle>
        <DialogDescription>
          Accepting your interview for &quot;{interview.jobTitle}&quot; at {interview.companyName}.
        </DialogDescription>

        {hasTimeslots && (
          <div className="space-y-2 pt-1" role="radiogroup" aria-label="Select a timeslot">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Pick a timeslot</p>
              <span className="text-xs text-slate-500">Times in your local time</span>
            </div>
            {interview.timeslots.map((slot) => {
              const isSelected = selectedTimeslotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={slot.isBooked && !isSelected}
                  onClick={() => setSelectedTimeslotId(slot.id)}
                  className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {formatTimeslotRange(slot.startTime, slot.endTime)}
                  {slot.isBooked && !isSelected ? (
                    <span className="ml-2 text-xs text-slate-400">(already booked)</span>
                  ) : null}
                </button>
              );
            })}

            {!selectedTimeslotId && (
              <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                Select a timeslot to continue.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={acceptMutation.isPending || (hasTimeslots && !selectedTimeslotId)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:cursor-not-allowed"
          >
            {acceptMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Accepting…
              </>
            ) : (
              'Accept Interview'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
