'use client';

import { Download, FileText, MapPin } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JobApplicant, ApplicationStatus } from '../types/applicant.types';
import { statusOptionsFor, APPLICANT_FALLBACKS } from '../constants';
import { getInitials, formatFullDate } from '../utils/format';
import { AiScoreBadge } from './AiScoreBadge';

interface ApplicantRowProps {
  applicant: JobApplicant;
  isSelected: boolean;
  isStatusPending: boolean;
  onToggleSelect: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
}

export function ApplicantRow({
  applicant,
  isSelected,
  isStatusPending,
  onToggleSelect,
  onOpenProfile,
  onStatusChange,
}: ApplicantRowProps) {
  const appliedDate = formatFullDate(applicant.appliedAt, APPLICANT_FALLBACKS.NOT_AVAILABLE);
  const normalizedStatus = applicant.status as ApplicationStatus;
  const statusOptions = statusOptionsFor(normalizedStatus);

  return (
    <TableRow
      className={`transition-colors border-b border-slate-100 last:border-0 group ${
        isSelected ? 'bg-emerald-50/40 hover:bg-emerald-50/60' : 'hover:bg-slate-50/60'
      }`}
    >
      <TableCell className="w-12 text-center px-4 py-3.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(applicant.id)}
          className="size-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
          aria-label={`Select ${applicant.applicantName}`}
        />
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenProfile(applicant.id)}
            className="shrink-0 focus:outline-none group/avatar cursor-pointer"
          >
            <Avatar className="size-9 border border-slate-200 group-hover/avatar:border-emerald-500 transition-colors">
              <AvatarFallback className="bg-slate-100 text-slate-800 text-xs font-bold">
                {getInitials(applicant.applicantName)}
              </AvatarFallback>
            </Avatar>
          </button>

          <button
            type="button"
            onClick={() => onOpenProfile(applicant.id)}
            className="text-left group/name focus:outline-none min-w-0 cursor-pointer"
          >
            <span className="font-semibold text-sm text-slate-900 group-hover/name:text-emerald-600 transition-colors tracking-tight block truncate">
              {applicant.applicantName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-medium truncate">
                {applicant.applicantEmail}
              </span>
              {applicant.location && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 font-medium shrink-0">
                  <MapPin className="size-3 text-slate-400" />
                  {applicant.location}
                </span>
              )}
            </div>
          </button>
        </div>
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <AiScoreBadge score={applicant.aiMatchScore} />
      </TableCell>

      <TableCell className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
        {appliedDate}
      </TableCell>

      <TableCell className="px-4 py-3.5">
        {applicant.resumeDownloadUrl ? (
          <a
            href={applicant.resumeDownloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="size-3.5" />
            Resume
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap">
            <FileText className="size-3 text-slate-300" />
            {APPLICANT_FALLBACKS.NO_CV}
          </span>
        )}
      </TableCell>

      <TableCell className="px-4 py-3.5 text-right">
        <div className="inline-flex items-center justify-end">
          <Select
            value={normalizedStatus}
            onValueChange={(val) => {
              if (val === normalizedStatus) {
                return;
              }
              onStatusChange(applicant.id, val as ApplicationStatus);
            }}
            disabled={isStatusPending}
          >
            <SelectTrigger className="w-38.5 h-8 text-xs font-medium bg-white border-slate-200 shadow-2xs rounded-lg cursor-pointer focus:ring-1 focus:ring-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.value === normalizedStatus}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableCell>
    </TableRow>
  );
}
