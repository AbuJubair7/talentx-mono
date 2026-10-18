import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DEACTIVATION_REASON_OPTIONS } from '../constants/job-reports.constants';
import { useResolveJobReport } from '../hooks/useResolveJobReport';

const resolveSchema = z.object({
  deactivationReason: z.string().min(1, 'Please select a reason'),
  details: z.string().min(10, 'Details must be at least 10 characters').max(1000, 'Details cannot exceed 1000 characters'),
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
});

type ResolveFormValues = z.infer<typeof resolveSchema>;

interface Props {
  reportId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved?: () => void;
}

export function ResolveReportDialog({ reportId, isOpen, onOpenChange, onResolved }: Props) {
  const { mutate, isPending } = useResolveJobReport();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ResolveFormValues>({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      deactivationReason: '',
      details: '',
      adminNotes: '',
    },
  });

  const detailsValue = watch('details') || '';
  const adminNotesValue = watch('adminNotes') || '';

  const onSubmit = (values: ResolveFormValues) => {
    mutate(
      { id: reportId, payload: values },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onResolved?.();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-md">
        <DialogHeader>
          <DialogTitle>Resolve Report & Deactivate Job</DialogTitle>
          <DialogDescription>
            Resolving this report will immediately deactivate the job and email the employer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 pt-2 pr-1">
          <div>
            <label htmlFor="deactivation-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Deactivation Reason (Visible to Employer) <span className="text-red-500">*</span>
            </label>
            <select
              id="deactivation-reason"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('deactivationReason')}
            >
              <option value="" disabled>Select a reason...</option>
              {DEACTIVATION_REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.deactivationReason && <p className="mt-1.5 text-sm text-red-500">{errors.deactivationReason.message}</p>}
          </div>

          <div>
            <label htmlFor="deactivation-details" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Details to Employer <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="deactivation-details"
              className="max-h-32 overflow-y-auto break-words resize-none rounded-md border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0"
              placeholder="Provide more details for the employer..."
              rows={3}
              {...register('details')}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.details ? (
                <p className="text-sm text-red-500">{errors.details.message}</p>
              ) : <span />}
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {detailsValue.length} / 1000
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="admin-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Internal Admin Notes (Optional)
            </label>
            <Textarea
              id="admin-notes"
              className="max-h-32 overflow-y-auto break-words resize-none rounded-md border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0"
              placeholder="Internal notes for other admins..."
              rows={2}
              {...register('adminNotes')}
            />

            <div className="flex items-center justify-between mt-1">
              {errors.adminNotes ? (
                <p className="text-sm text-red-500">{errors.adminNotes.message}</p>
              ) : <span />}
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {adminNotesValue.length} / 1000
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-rose-600 hover:bg-rose-700 text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2">
              {isPending ? 'Resolving...' : 'Resolve & Deactivate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
