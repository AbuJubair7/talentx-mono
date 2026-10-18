'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COMPANY_REVIEW_STATUS_VALUES, REVIEW_STATUS_STYLES } from '@/modules/company-review';
import type { CompanyReviewStatus } from '@/modules/company-review';
import { EMPLOYER_REVIEW_SENTIMENT_OPTIONS } from '../constants/employer-reviews.constants';
import {
  ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER,
  ALL_EMPLOYER_REVIEW_STATUS_FILTER,
} from '../types/employer-reviews.types';
import type { EmployerReviewSentimentFilter, EmployerReviewStatusFilter } from '../types/employer-reviews.types';

interface EmployerReviewFilterToolbarProps {
  statusFilter: EmployerReviewStatusFilter;
  sentimentFilter: EmployerReviewSentimentFilter;
  counts: Record<CompanyReviewStatus, number>;
  totalSubmitted: number;
  onStatusFilterChange: (value: EmployerReviewStatusFilter) => void;
  onSentimentFilterChange: (value: EmployerReviewSentimentFilter) => void;
}

export function EmployerReviewFilterToolbar({
  statusFilter,
  sentimentFilter,
  counts,
  totalSubmitted,
  onStatusFilterChange,
  onSentimentFilterChange,
}: EmployerReviewFilterToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Tabs
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as EmployerReviewStatusFilter)}
        >
          <TabsList variant="line">
            <TabsTrigger value={ALL_EMPLOYER_REVIEW_STATUS_FILTER}>
              All
              <FilterCount count={totalSubmitted} />
            </TabsTrigger>
            {COMPANY_REVIEW_STATUS_VALUES.map((status) => (
              <TabsTrigger key={status} value={status}>
                {REVIEW_STATUS_STYLES[status.toLowerCase()].label}
                <FilterCount count={counts[status]} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex justify-end">
        <Select
          value={sentimentFilter}
          onValueChange={(value) => onSentimentFilterChange(value as EmployerReviewSentimentFilter)}
        >
          <SelectTrigger className="h-9 w-full cursor-pointer rounded-lg border-0 bg-slate-100 text-xs font-medium focus:ring-1 focus:ring-slate-300 sm:w-40">
            <SelectValue placeholder="All Sentiments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER}>All Sentiments</SelectItem>
            {EMPLOYER_REVIEW_SENTIMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function FilterCount({ count }: { count: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500">
      {count}
    </span>
  );
}
