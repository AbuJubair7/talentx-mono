'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import type { JobActionConfirmDialogProps } from '../types/employer-job.types';


const INTENT_CONTENT = {
  close: {
    title: 'Close Job',
    confirmLabel: 'Close Job',
  },
  delete: {
    title: 'Delete Job',
    confirmLabel: 'Delete Job',
  },
  reopen: {
    title: 'Reopen Job',
    confirmLabel: 'Reopen Job',
  },
  publish: {
    title: 'Publish Job',
    confirmLabel: 'Publish Job',
  },
} as const;

export function JobActionConfirmDialog({
  open,
  onOpenChange,
  jobTitle,
  intent,
  isPending,
  onConfirm,
}: JobActionConfirmDialogProps) {
  const { title, confirmLabel } = INTENT_CONTENT[intent];

  const description =
    intent === 'close'
      ? `Closing "${jobTitle}" will remove it from public listings. Are you sure?`
      : intent === 'delete'
      ? `Deleting "${jobTitle}" is permanent and cannot be undone. Are you sure?`
      : intent === 'reopen'
      ? `Reopening "${jobTitle}" will make it live and start accepting candidate applications again.`
      : `Publishing "${jobTitle}" will make it immediately visible to job seekers.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={
              intent === 'delete'
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : intent === 'reopen' || intent === 'publish'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'cursor-pointer'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
