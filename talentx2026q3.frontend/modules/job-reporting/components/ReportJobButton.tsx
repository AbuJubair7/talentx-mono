'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportJobDialog } from './ReportJobDialog';

interface ReportJobButtonProps {
  jobId: string;
  jobTitle: string;
  viewerIsTalent?: boolean;
}

export function ReportJobButton({ jobId, jobTitle, viewerIsTalent }: ReportJobButtonProps) {
  const [open, setOpen] = useState(false);

  if (!viewerIsTalent) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 rounded-sm cursor-pointer transition-colors"
      >
        <Flag className="size-3.5 text-rose-600 fill-rose-600/15" />
        <span>Report this job</span>
      </button>

      <ReportJobDialog
        open={open}
        onOpenChange={setOpen}
        jobId={jobId}
        jobTitle={jobTitle}
      />
    </>
  );
}
