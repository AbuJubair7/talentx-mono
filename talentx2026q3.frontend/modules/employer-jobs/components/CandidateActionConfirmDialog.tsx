'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export type CandidateActionConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: 'primary' | 'destructive';
  isPending?: boolean;
  onConfirm: () => void;
};

export function CandidateActionConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant = 'primary',
  isPending = false,
  onConfirm,
}: CandidateActionConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) onOpenChange(nextOpen);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={
              variant === 'destructive'
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-[#0F6E56] hover:bg-[#0D5A47] text-white cursor-pointer'
            }
          >
            {isPending && <Loader2 className="size-3.5 animate-spin mr-1" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
