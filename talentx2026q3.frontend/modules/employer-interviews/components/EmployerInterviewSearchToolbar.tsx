import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ALL_INTERVIEW_STATUS_FILTER,
  ALL_INTERVIEW_TYPE_FILTER,
  INTERVIEW_STATUS_OPTIONS,
  INTERVIEW_TYPE_OPTIONS,
} from '../constants/interview.constants';
import type { InterviewStatusFilter, InterviewTypeFilter } from '../types/interview.types';

interface EmployerInterviewSearchToolbarProps {
  totalCount: number;
  statusFilter: InterviewStatusFilter;
  typeFilter: InterviewTypeFilter;
  onStatusFilterChange: (value: InterviewStatusFilter) => void;
  onTypeFilterChange: (value: InterviewTypeFilter) => void;
}

export function EmployerInterviewSearchToolbar({
  totalCount,
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange,
}: EmployerInterviewSearchToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <p className="text-sm font-medium text-slate-700">
        {totalCount} {totalCount === 1 ? 'invitation' : 'invitations'}
      </p>
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center gap-2">
          <Filter className="size-4 text-slate-400 shrink-0 hidden sm:inline-block" />
          <Select
            value={typeFilter}
            onValueChange={(value) => onTypeFilterChange(value as InterviewTypeFilter)}
          >
            <SelectTrigger className="w-full sm:w-45 h-9 text-xs font-medium bg-slate-100 border-0 rounded-lg focus:ring-1 focus:ring-slate-300 cursor-pointer">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_INTERVIEW_TYPE_FILTER}>All Types</SelectItem>
              {INTERVIEW_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative inline-flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value as InterviewStatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-45 h-9 text-xs font-medium bg-slate-100 border-0 rounded-lg focus:ring-1 focus:ring-slate-300 cursor-pointer">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_INTERVIEW_STATUS_FILTER}>All Statuses</SelectItem>
              {INTERVIEW_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
