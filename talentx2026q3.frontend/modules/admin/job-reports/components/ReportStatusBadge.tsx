import React from 'react';
import type { JobReportStatus } from '../types/job-reports.types';
import { cn } from '@/lib/utils';

export function ReportStatusBadge({ status }: { status: JobReportStatus }) {
  let badgeClasses = 'px-2.5 py-0.5 rounded-md text-xs font-medium border';
  switch (status) {
    case 'Pending':
      badgeClasses = cn(badgeClasses, 'bg-amber-50 text-amber-700 border-amber-200');
      break;
    case 'Resolved':
      badgeClasses = cn(badgeClasses, 'bg-emerald-50 text-emerald-700 border-emerald-200');
      break;
    case 'Dismissed':
      badgeClasses = cn(badgeClasses, 'bg-slate-100 text-slate-600 border-slate-200');
      break;
  }
  return <span className={badgeClasses}>{status}</span>;
}
