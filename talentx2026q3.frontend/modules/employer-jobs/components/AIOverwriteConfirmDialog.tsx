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

export interface AIOverwriteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetField: 'description' | 'requirements';
  isLoading?: boolean;
  onConfirm: () => void;
}

export function AIOverwriteConfirmDialog({
  open,
  onOpenChange,
  targetField,
  isLoading = false,
  onConfirm,
}: AIOverwriteConfirmDialogProps) {
  const dialogTitle =
    targetField === 'description'
      ? 'Overwrite Job Description?'
      : 'Overwrite Job Requirements?';

  const dialogDescription =
    targetField === 'description'
      ? 'Existing job description will be replaced with AI-generated content. This action cannot be undone. Do you wish to continue?'
      : 'Existing job requirements will be replaced with AI-generated content. This action cannot be undone. Do you wish to continue?';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
        <div className="flex justify-end gap-2 pt-2">
          <DialogClose>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer focus-visible:ring-emerald-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate & Replace'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
