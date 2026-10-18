'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/errors';
import { useSendInterviewInvitations } from '../hooks/useSendInterviewInvitations';
import type {
  CandidateInvitationResultDto,
  SendInterviewBatchPayload,
  SendInterviewBatchResponse,
} from '../types/interview.types';
import { ForceSendInviteDialog } from './ForceSendInviteDialog';

interface BatchInviteResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SendInterviewBatchResponse | null;
  jobId: string;
  originalPayload: Omit<SendInterviewBatchPayload, 'applicationIds'>;
  onResultUpdate: (updated: SendInterviewBatchResponse) => void;
}

export function BatchInviteResultsModal({
  open,
  onOpenChange,
  result,
  jobId,
  originalPayload,
  onResultUpdate,
}: BatchInviteResultsModalProps) {
  const sendMutation = useSendInterviewInvitations(jobId);
  const [forceSendTarget, setForceSendTarget] = useState<CandidateInvitationResultDto | null>(null);
  const [forceSendingApplicationId, setForceSendingApplicationId] = useState<string | null>(null);

  if (!result) return null;

  const hasSkipped = result.skippedCount > 0;

  const handleConfirmForceSend = async () => {
    if (!forceSendTarget) return;
    const target = forceSendTarget;

    setForceSendingApplicationId(target.applicationId);
    try {
      const response = await sendMutation.mutateAsync({
        applicationIds: [target.applicationId],
        ...originalPayload,
        force: true,
      });

      const updatedRow = response.results[0];
      const updatedResults = result.results.map((row) =>
        row.applicationId === target.applicationId ? updatedRow : row,
      );
      const invitedCount = updatedResults.filter((row) => row.success).length;

      onResultUpdate({
        totalProcessed: result.totalProcessed,
        invitedCount,
        skippedCount: updatedResults.length - invitedCount,
        results: updatedResults,
      });
      toast.success(`Invitation sent to ${target.candidateName}.`);
      setForceSendTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send interview invitation.'));
    } finally {
      setForceSendingApplicationId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              {hasSkipped ? (
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle className="size-5" />
                </div>
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
              )}
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  Interview Invitation Results
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Summary of sent and skipped candidate invitations.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Summary Badges */}
          <div className="grid grid-cols-3 gap-3 my-2 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 block">Total</span>
              <span className="text-lg font-bold text-slate-800">{result.totalProcessed}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xs font-medium text-emerald-700 block">Invited</span>
              <span className="text-lg font-bold text-emerald-800">{result.invitedCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xs font-medium text-amber-700 block">Skipped</span>
              <span className="text-lg font-bold text-amber-800">{result.skippedCount}</span>
            </div>
          </div>

          {/* Candidate Results List */}
          <div className="space-y-3 mt-2 max-h-[40vh] overflow-y-auto pr-1">
            {result.results.map((item, index) => (
              <div
                key={item.applicationId || index}
                className={`p-3 rounded-lg border text-sm ${
                  item.success
                    ? 'bg-white border-emerald-200'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {item.success ? (
                        <UserCheck className="size-4 text-emerald-600 shrink-0" />
                      ) : (
                        <UserX className="size-4 text-amber-600 shrink-0" />
                      )}
                      <span>{item.candidateName}</span>
                    </div>
                    {item.candidateEmail && (
                      <span className="text-xs text-slate-500 block mt-0.5 ml-5">
                        {item.candidateEmail}
                      </span>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      item.success
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.success ? 'Invited' : 'Skipped'}
                  </span>
                </div>

                {!item.success && item.skipReason && (
                  <div className="mt-2 text-xs text-amber-900 bg-amber-100/70 rounded p-2 border border-amber-200">
                    <span className="font-semibold">Reason: </span>
                    {item.skipReason}
                  </div>
                )}

                {!item.success && item.canForceSend && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer"
                    disabled={forceSendingApplicationId === item.applicationId}
                    onClick={() => setForceSendTarget(item)}
                  >
                    {forceSendingApplicationId === item.applicationId ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Send Anyway'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {forceSendTarget && (
        <ForceSendInviteDialog
          open={true}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setForceSendTarget(null);
          }}
          candidateName={forceSendTarget.candidateName}
          skipReason={forceSendTarget.skipReason ?? ''}
          hasDanglingPendingInvite={forceSendTarget.hasDanglingPendingInvite}
          onConfirm={handleConfirmForceSend}
          isPending={forceSendingApplicationId === forceSendTarget.applicationId}
        />
      )}
    </>
  );
}
