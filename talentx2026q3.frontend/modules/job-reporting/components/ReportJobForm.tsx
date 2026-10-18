'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { REPORT_REASONS, MAX_ADDITIONAL_DETAILS_LENGTH } from '../constants/job-reporting.constants';
import { reportJobSchema, type ReportJobFormValues } from '../schemas/report-job.schema';
import { useReportJob } from '../hooks/useReportJob';

interface ReportJobFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReportJobForm({ jobId, onSuccess, onCancel }: ReportJobFormProps) {
  const { mutate: reportJob, isPending } = useReportJob(jobId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportJobFormValues>({
    resolver: zodResolver(reportJobSchema),
    defaultValues: {
      additionalDetails: '',
    },
  });

  const additionalDetails = watch('additionalDetails') || '';
  const reason = watch('reason');

  const onSubmit = (data: ReportJobFormValues) => {
    reportJob(data, {
      onSuccess,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
          Reason for reporting <span className="text-red-500">*</span>
        </label>
        <select
          id="reason"
          {...register('reason')}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          disabled={isPending}
        >
          <option value="" disabled selected hidden>
            Select a reason...
          </option>
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="additionalDetails" className="block text-sm font-medium text-slate-700">
          Additional Details {reason === 'Other' && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id="additionalDetails"
          {...register('additionalDetails')}
          rows={4}
          className="max-h-32 w-full overflow-y-auto break-words resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Please provide any additional details that might help us investigate this issue..."
          disabled={isPending}
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {errors.additionalDetails ? (
              <span className="text-red-500">{errors.additionalDetails.message}</span>
            ) : (
              'Minimum 10 characters if provided (required if reason is "Other").'
            )}
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {additionalDetails.length} / {MAX_ADDITIONAL_DETAILS_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-700/20 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>

    </form>
  );
}
