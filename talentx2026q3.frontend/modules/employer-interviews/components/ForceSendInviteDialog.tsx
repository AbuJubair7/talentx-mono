'use client';

import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ForceSendInviteDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly candidateName: string;
  readonly skipReason: string;
  readonly hasDanglingPendingInvite: boolean;
  readonly onConfirm: () => void;
  readonly isPending: boolean;
}

// Only the two overridable skip reasons ever reach this dialog (Hired is never forceable), so
// this check is enough to tell which wording applies.
function isPendingInviteSkip(skipReason: string): boolean {
  return skipReason.includes('pending interview invitation');
}

export function ForceSendInviteDialog({
  open,
  onOpenChange,
  candidateName,
  skipReason,
  hasDanglingPendingInvite,
  onConfirm,
  isPending,
}: ForceSendInviteDialogProps) {
  const consequence = isPendingInviteSkip(skipReason)
    ? `This will cancel ${candidateName}'s existing pending interview invitation and send a new one.`
    : `${candidateName}'s application was marked Rejected — this will re-invite them to interview.`;

  const danglingInviteNote = !isPendingInviteSkip(skipReason) && hasDanglingPendingInvite
    ? ' This will also cancel their existing pending interview invitation.'
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="size-11 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto sm:mx-0">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Send Invitation Anyway
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            {consequence}
            {danglingInviteNote}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
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
            disabled={isPending}
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Send className="size-4" />
                Send Invitation
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
