import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useJobReportDetails } from '../hooks/useJobReportDetails';
import { ReportStatusBadge } from './ReportStatusBadge';
import { Loader2 } from 'lucide-react';
import { ResolveReportDialog } from './ResolveReportDialog';
import { DismissReportDialog } from './DismissReportDialog';

interface Props {
  reportId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobReportDetailDialog({ reportId, isOpen, onOpenChange }: Props) {
  const { data: report, isLoading } = useJobReportDetails(isOpen ? reportId : '');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-md">
          <DialogHeader>
            <DialogTitle>Job Report Details</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : report ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Job Title</div>
                    <div className="font-semibold break-words">{report.jobTitle}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Company</div>
                    <div className="break-words">{report.companyName}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Job Status</div>
                    <div>{report.jobStatus}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Status</div>
                    <div className="mt-1"><ReportStatusBadge status={report.status} /></div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Reporter Email</div>
                    <div className="break-all">{report.reporterEmail || 'N/A'}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-500 font-medium">Created At</div>
                    <div className="break-words">{new Date(report.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium text-sm mb-1">Reason Label</div>
                  <div className="bg-slate-50 p-3 rounded-md text-sm border break-words">{report.reasonLabel}</div>
                </div>

                {report.additionalDetails && (
                  <div>
                    <div className="text-slate-500 font-medium text-sm mb-1">Additional Details</div>
                    <div className="bg-slate-50 p-3 rounded-md text-sm border whitespace-pre-wrap break-words">
                      {report.additionalDetails}
                    </div>
                  </div>
                )}

                {report.adminNotes && (
                  <div>
                    <div className="text-slate-500 font-medium text-sm mb-1">Admin Notes</div>
                    <div className="bg-amber-50 p-3 rounded-md text-sm border border-amber-100 whitespace-pre-wrap break-words">
                      {report.adminNotes}
                    </div>
                  </div>
                )}

                {report.resolvedByEmail && (
                  <div className="text-sm text-slate-500 italic break-words">
                    Resolved by {report.resolvedByEmail} on {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : 'N/A'}
                  </div>
                )}

                {report.status === 'Pending' && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" className="rounded-md focus-visible:ring-2" onClick={() => setDismissOpen(true)}>
                      Dismiss
                    </Button>
                    <Button className="bg-emerald-700 text-white rounded-md hover:bg-emerald-800 focus-visible:ring-2" onClick={() => setResolveOpen(true)}>
                      Resolve Report
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">Failed to load report details.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {reportId && (
        <ResolveReportDialog
          reportId={reportId}
          isOpen={resolveOpen}
          onOpenChange={setResolveOpen}
          onResolved={() => onOpenChange(false)}
        />
      )}
      
      {reportId && (
        <DismissReportDialog
          reportId={reportId}
          isOpen={dismissOpen}
          onOpenChange={setDismissOpen}
          onDismissed={() => onOpenChange(false)}
        />
      )}
    </>
  );
}
