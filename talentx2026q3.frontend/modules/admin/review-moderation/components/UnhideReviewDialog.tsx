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

interface UnhideReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  isPending: boolean;
  onConfirm: () => void;
}

// Confirms restoring a hidden review back to Published.
export function UnhideReviewDialog({ open, onOpenChange, companyName, isPending, onConfirm }: UnhideReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Unhide review</DialogTitle>
        <DialogDescription>
          Make this review of &ldquo;{companyName}&rdquo; public again?
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
            Unhide review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
