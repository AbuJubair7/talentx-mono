'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReportJobForm } from './ReportJobForm';

interface ReportJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

export function ReportJobDialog({ open, onOpenChange, jobId, jobTitle }: ReportJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-md max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Report Job</DialogTitle>
          <DialogDescription>
            You are reporting <span className="font-semibold text-slate-900">{jobTitle}</span>.
            Please tell us why this job should be reviewed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-1">
          {open && (
            <ReportJobForm
              jobId={jobId}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>

  );
}
