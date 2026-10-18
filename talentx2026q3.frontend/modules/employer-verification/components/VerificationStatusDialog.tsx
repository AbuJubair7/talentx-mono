"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DISMISSAL_STORAGE_KEY = "employer_verification_dialog_dismissed";

interface VerificationStatusDialogProps {
  verificationStatus: "PendingVerification" | "Verified" | "Rejected";
  rejectionReason?: string | null;
  onReApply?: () => void;
  isReApplying?: boolean;
}

interface DismissalState {
  dismissed: boolean;
  status: string;
}

function readDismissalState(): DismissalState | null {
  try {
    const stored = localStorage.getItem(DISMISSAL_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as DismissalState;
  } catch {
    return null;
  }
}

function writeDismissalState(status: string): void {
  try {
    localStorage.setItem(
      DISMISSAL_STORAGE_KEY,
      JSON.stringify({ dismissed: true, status })
    );
  } catch {
    // Ignore localStorage access restrictions
  }
}

export function VerificationStatusDialog({
  verificationStatus,
  rejectionReason,
  onReApply,
  isReApplying,
}: VerificationStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (verificationStatus === "Verified") {
      return;
    }

    const dismissal = readDismissalState();
    if (dismissal?.dismissed && dismissal.status === verificationStatus) {
      return;
    }

    setIsOpen(true);
  }, [verificationStatus]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        writeDismissalState(verificationStatus);
      }
      setIsOpen(open);
    },
    [verificationStatus]
  );

  if (verificationStatus === "Verified") {
    return null;
  }

  const isRejected = verificationStatus === "Rejected";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRejected ? (
              <>
                <XCircle className="size-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                <span>Verification Rejected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span>Pending Verification</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRejected
              ? "Your employer account verification was rejected."
              : "Your account is pending verification."}
          </DialogDescription>
        </DialogHeader>

        {isRejected && rejectionReason && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">Reason:</p>
            <p className="mt-1 text-sm text-red-800 dark:text-red-300 line-clamp-3">{rejectionReason}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {isRejected
            ? "Please update your profile information based on the reason above, then re-apply for verification."
            : "Once reviewed and approved by our team, you will be able to post jobs and recruit top talent on TalentX."}
        </p>

        {isRejected && onReApply && (
          <button
            type="button"
            onClick={onReApply}
            disabled={isReApplying}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
          >
            <RefreshCw className={`size-4 ${isReApplying ? "animate-spin" : ""}`} />
            {isReApplying ? "Re-applying..." : "Re-apply for Verification"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
