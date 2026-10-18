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

interface ApproveReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  isPending: boolean;
  onConfirm: () => void;
}

// Confirms publishing a pending review.
export function ApproveReviewDialog({ open, onOpenChange, companyName, isPending, onConfirm }: ApproveReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Approve review</DialogTitle>
        <DialogDescription>
          Publish this review of &ldquo;{companyName}&rdquo;? It becomes visible on the company&apos;s public profile.
        </DialogDescription>

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
            disabled={isPending}
            className="cursor-pointer gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Approve review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
