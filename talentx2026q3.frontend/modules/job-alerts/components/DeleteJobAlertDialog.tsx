'use client';

import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteJobAlert } from '../hooks';
import type { JobAlert } from '../types';

export interface DeleteJobAlertDialogProps {
  readonly alert: JobAlert | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onAlertDeleted?: () => void;
}

export function DeleteJobAlertDialog({
  alert,
  open,
  onOpenChange,
  onAlertDeleted,
}: DeleteJobAlertDialogProps) {
  const deleteAlertMutation = useDeleteJobAlert();

  if (!alert) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteAlertMutation.mutateAsync(alert.id);
      onOpenChange(false);
      onAlertDeleted?.();
    } catch {
      // Handled globally by useDeleteJobAlert with toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="size-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto sm:mx-0">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Delete Job Alert
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-900">&ldquo;{alert.name}&rdquo;</strong>? You will no longer receive email notifications for jobs matching this criteria. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleteAlertMutation.isPending}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {deleteAlertMutation.isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="size-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Trash2 className="size-4" />
                Delete Alert
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
