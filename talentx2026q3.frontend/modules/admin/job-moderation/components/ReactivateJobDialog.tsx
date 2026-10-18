"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReactivateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  // PendingReview means the employer resubmitted, so reactivating is an approval.
  isApproval?: boolean;
  isExpired: boolean;
  isPending: boolean;
  onConfirm: () => void;
}

// Confirms putting a job back live; blocks confirm if its deadline has passed.
export function ReactivateJobDialog({
  open,
  onOpenChange,
  jobTitle,
  isApproval = false,
  isExpired,
  isPending,
  onConfirm,
}: ReactivateJobDialogProps) {
  const title = isApproval ? "Approve & reactivate job" : "Reactivate job";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Make &ldquo;{jobTitle}&rdquo; public again? The employer is emailed and matching talents may be alerted.
        </DialogDescription>

        {isExpired && (
          <p
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            This job&apos;s deadline has passed, so it can&apos;t go back on the public listing. Ask the employer to
            extend the deadline first.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            onClick={onConfirm}
            // Expired jobs are rejected by the backend, so the request is never worth sending.
            disabled={isPending || isExpired}
            className="cursor-pointer gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
