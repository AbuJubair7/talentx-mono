'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { JobApplicant, ApplicationStatus } from '../types/applicant.types';
import { ApplicantRow } from './ApplicantRow';

interface SortConfig {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ApplicantTableProps {
  applicants: JobApplicant[];
  selectedIds: Set<string>;
  pendingStatusIds: Set<string>;
  isFetching: boolean;
  sortConfig: SortConfig;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onOpenProfile: (id: string) => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onSort: (sortBy: string) => void;
}

function SortIcon({ field, sortConfig }: { field: string; sortConfig: SortConfig }) {
  if (sortConfig.sortBy !== field) {
    return <ArrowUpDown className="size-3.5 ml-1 text-slate-400" />;
  }
  return sortConfig.sortOrder === 'asc'
    ? <ArrowUp className="size-3.5 ml-1 text-emerald-600" />
    : <ArrowDown className="size-3.5 ml-1 text-emerald-600" />;
}

export function ApplicantTable({
  applicants,
  selectedIds,
  pendingStatusIds,
  isFetching,
  sortConfig,
  onToggleSelectAll,
  onToggleSelect,
  onOpenProfile,
  onStatusChange,
  onSort,
}: ApplicantTableProps) {
  const isAllSelected =
    applicants.length > 0 && applicants.every((app) => selectedIds.has(app.id));

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
      aria-busy={isFetching}
      aria-live="polite"
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
            <TableHead className="w-12 text-center py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
                className="size-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                aria-label="Select all applicants"
              />
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Candidate
            </TableHead>
            <TableHead
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 cursor-pointer select-none hover:text-slate-700"
              onClick={() => onSort('aiMatchScore')}
            >
              <span className="inline-flex items-center">
                AI Match
                <SortIcon field="aiMatchScore" sortConfig={sortConfig} />
              </span>
            </TableHead>
            <TableHead
              className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 cursor-pointer select-none hover:text-slate-700"
              onClick={() => onSort('appliedAt')}
            >
              <span className="inline-flex items-center">
                Applied Date
                <SortIcon field="appliedAt" sortConfig={sortConfig} />
              </span>
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3">
              Resume
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 text-right">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {applicants.map((applicant) => (
            <ApplicantRow
              key={applicant.id}
              applicant={applicant}
              isSelected={selectedIds.has(applicant.id)}
              isStatusPending={pendingStatusIds.has(applicant.id)}
              onToggleSelect={onToggleSelect}
              onOpenProfile={onOpenProfile}
              onStatusChange={onStatusChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
