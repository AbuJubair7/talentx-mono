'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/errors';
import { COMPANY_REVIEW_FALLBACKS } from '../constants/company-review.constants';
import { useWithdrawCompanyReview } from '../hooks/useWithdrawCompanyReview';
import type { MyCompanyReviewItemDto } from '../types/company-review.types';

interface WithdrawReviewDialogProps {
  item: MyCompanyReviewItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawReviewDialog({ item, open, onOpenChange }: WithdrawReviewDialogProps) {
  const withdrawMutation = useWithdrawCompanyReview();

  const handleOpenChange = (nextOpen: boolean) => {
    if (withdrawMutation.isPending) return;
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!item.review) return;

    try {
      const response = await withdrawMutation.mutateAsync(item.review.id);
      toast.success(response?.message || 'Review withdrawn.');
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, COMPANY_REVIEW_FALLBACKS.ERROR_WITHDRAW));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogTitle>Withdraw review</DialogTitle>
        <DialogDescription>
          Withdraw your review of {item.companyName} for &quot;{item.jobTitle}&quot;? It will no longer be visible
          to anyone.
        </DialogDescription>

        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          This is final — you can&apos;t review this application again.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={withdrawMutation.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={withdrawMutation.isPending}
            className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
          >
            {withdrawMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Withdrawing…
              </>
            ) : (
              'Withdraw review'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
