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
import { useDismissJobReport } from '../hooks/useDismissJobReport';

const dismissSchema = z.object({
  adminNotes: z.string().max(1000, 'Admin notes cannot exceed 1000 characters').optional(),
});

type DismissFormValues = z.infer<typeof dismissSchema>;

interface Props {
  reportId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDismissed?: () => void;
}

export function DismissReportDialog({ reportId, isOpen, onOpenChange, onDismissed }: Props) {
  const { mutate, isPending } = useDismissJobReport();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<DismissFormValues>({
    resolver: zodResolver(dismissSchema),
    defaultValues: {
      adminNotes: '',
    },
  });

  const adminNotesValue = watch('adminNotes') || '';

  const onSubmit = (values: DismissFormValues) => {
    mutate(
      { id: reportId, payload: values },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
          onDismissed?.();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-md">
        <DialogHeader>
          <DialogTitle>Dismiss Report</DialogTitle>
          <DialogDescription>
            Dismissing this report keeps the job active.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-5 pt-2 pr-1">
          <div>
            <label htmlFor="dismiss-admin-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Internal Admin Notes (Optional)
            </label>
            <Textarea
              id="dismiss-admin-notes"
              className="max-h-32 overflow-y-auto break-words resize-none rounded-md border-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0"
              placeholder="Why are you dismissing this report?"
              rows={3}
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
            <Button type="submit" disabled={isPending} className="bg-slate-900 text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
              {isPending ? 'Dismissing...' : 'Dismiss Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
