'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { InterviewPreparationQuota } from '../types';

interface PreparationActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  quota?: InterviewPreparationQuota | null;
  generationCount?: number;
}

export function PreparationActions({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  quota,
  generationCount = 0,
}: PreparationActionsProps) {
  const regenerationsLeft = quota
    ? Math.max(0, quota.maxRegenerationCount - generationCount)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-warning" aria-hidden />
            Regenerate preparation?
          </DialogTitle>
          <DialogDescription className="pt-2">
            You&apos;ll get a fresh set of questions and guidance based on the same job,
            interview, and profile. Your current questions and practiced marks will be replaced.
          </DialogDescription>
        </DialogHeader>
        {quota && regenerationsLeft !== null && (
          <p className="rounded-md bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
            Regenerations left for this preparation:{' '}
            <span className="font-semibold tabular-nums text-ink">
              {regenerationsLeft} of {quota.maxRegenerationCount}
            </span>{' '}
            &middot; Generations left today:{' '}
            <span className="font-semibold tabular-nums text-ink">
              {quota.remainingGenerationsToday} of {quota.dailyGenerationLimit}
            </span>
          </p>
        )}
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand"
          >
            {isPending ? 'Regenerating…' : 'Regenerate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
