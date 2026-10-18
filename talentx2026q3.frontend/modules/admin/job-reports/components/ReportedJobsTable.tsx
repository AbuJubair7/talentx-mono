import React, { useState } from 'react';
import type { JobReportListItem } from '../types/job-reports.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ReportStatusBadge } from './ReportStatusBadge';
import { JobReportDetailDialog } from './JobReportDetailDialog';
import { ResolveReportDialog } from './ResolveReportDialog';
import { DismissReportDialog } from './DismissReportDialog';
import { JobModerationDetailDialog } from '@/modules/admin/job-moderation';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  data: JobReportListItem[];
  isLoading: boolean;
}

export function ReportedJobsTable({ data, isLoading }: Props) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedReportForJob, setSelectedReportForJob] = useState<JobReportListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [dismissOpen, setDismissOpen] = useState(false);

  const openJobDetail = (report: JobReportListItem) => {
    setSelectedJobId(report.jobId);
    setSelectedReportForJob(report);
  };

  const openDetail = (id: string) => {
    setSelectedReportId(id);
    setDetailOpen(true);
  };

  const openResolve = (id: string) => {
    setSelectedReportId(id);
    setResolveOpen(true);
  };

  const openDismiss = (id: string) => {
    setSelectedReportId(id);
    setDismissOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading reports...</div>;
  }

  if (!data.length) {
    return (
      <div className="p-8 text-center text-slate-500 border rounded-md bg-white">
        No reported jobs found matching the current criteria.
      </div>
    );
  }

  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job & Company</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((report) => (
            <TableRow
              key={report.id}
              onClick={() => openJobDetail(report)}
              className="cursor-pointer hover:bg-slate-50/90 transition-colors"
            >
              <TableCell className="max-w-[280px] sm:max-w-xs md:max-w-sm min-w-0">
                <div className="font-medium line-clamp-2 break-words [overflow-wrap:anywhere]" title={report.jobTitle}>{report.jobTitle}</div>
                <div className="text-sm text-slate-500 truncate" title={report.companyName}>{report.companyName}</div>
              </TableCell>
              <TableCell className="max-w-[160px] min-w-0">
                <span className="text-sm truncate block" title={report.reasonLabel}>{report.reasonLabel}</span>
              </TableCell>
              <TableCell className="max-w-[180px] min-w-0">
                <span className="text-sm truncate block" title={report.reporterEmail || 'Anonymous'}>{report.reporterEmail || 'Anonymous'}</span>
              </TableCell>
              <TableCell>
                <ReportStatusBadge status={report.status} />
              </TableCell>
              <TableCell>
                <span className="text-sm">{new Date(report.createdAt).toLocaleDateString()}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      openDetail(report.id);
                    }}
                    className="h-8 w-8 rounded-md focus-visible:ring-2 cursor-pointer"
                    title="View Report Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {report.status === 'Pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation();
                          openResolve(report.id);
                        }}
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md focus-visible:ring-2 cursor-pointer"
                        title="Resolve & Deactivate"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation();
                          openDismiss(report.id);
                        }}
                        className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-md focus-visible:ring-2 cursor-pointer"
                        title="Dismiss Report"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Job Details Modal (from Job Moderation) */}
      <JobModerationDetailDialog
        jobId={selectedJobId}
        onClose={() => {
          setSelectedJobId(null);
          setSelectedReportForJob(null);
        }}
        customActions={
          selectedReportForJob && selectedReportForJob.status === 'Pending' ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const reportIdToResolve = selectedReportForJob.id;
                  setSelectedJobId(null);
                  setSelectedReportForJob(null);
                  openResolve(reportIdToResolve);
                }}
                className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:text-rose-400 focus-visible:ring-2"
              >
                Deactivate Job
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Report Metadata Details Modal */}
      {selectedReportId && (
        <JobReportDetailDialog
          reportId={selectedReportId}
          isOpen={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
      
      {/* Resolve & Deactivate Modal */}
      {selectedReportId && (
        <ResolveReportDialog
          reportId={selectedReportId}
          isOpen={resolveOpen}
          onOpenChange={setResolveOpen}
        />
      )}
      
      {/* Dismiss Report Modal */}
      {selectedReportId && (
        <DismissReportDialog
          reportId={selectedReportId}
          isOpen={dismissOpen}
          onOpenChange={setDismissOpen}
        />
      )}
    </div>
  );
}
