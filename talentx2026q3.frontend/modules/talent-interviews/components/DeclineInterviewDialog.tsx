'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/errors';
import { TALENT_INTERVIEW_FALLBACKS } from '../constants/interview.constants';
import { useDeclineInterview } from '../hooks/useDeclineInterview';
import type { TalentInterviewDto } from '../types/interview.types';

interface DeclineInterviewDialogProps {
  interview: TalentInterviewDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeclineInterviewDialog({ interview, open, onOpenChange }: DeclineInterviewDialogProps) {
  const [reason, setReason] = useState('');
  const declineMutation = useDeclineInterview();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason('');
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    try {
      const response = await declineMutation.mutateAsync({
        invitationId: interview.id,
        payload: { reason: reason.trim() || undefined },
      });
      toast.success(response?.message || 'Interview invitation declined.');
      handleOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, TALENT_INTERVIEW_FALLBACKS.ERROR_DECLINE));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogTitle>Decline Interview</DialogTitle>
        <DialogDescription>
          Declining your interview for &quot;{interview.jobTitle}&quot; at {interview.companyName}. You can
          optionally let the employer know why.
        </DialogDescription>

        <div className="pt-1">
          <label className="text-sm font-medium text-slate-900 mb-1.5 block">
            Reason <span className="font-normal text-slate-500">optional</span>
          </label>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. I've accepted another offer."
          />
        </div>

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
            disabled={declineMutation.isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            {declineMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Declining…
              </>
            ) : (
              'Decline Interview'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
