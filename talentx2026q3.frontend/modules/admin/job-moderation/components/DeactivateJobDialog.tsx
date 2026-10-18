"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DEACTIVATION_DETAILS_MAX_LENGTH,
  DEACTIVATION_DETAILS_MIN_LENGTH,
  DEACTIVATION_REASON_OPTIONS,
} from "../constants/deactivation-reasons";
import type { DeactivateJobPayload, DeactivationReason } from "../types/job-moderation";

interface DeactivateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  // PendingReview jobs are being taken down a second time, which needs different wording.
  isRepeat?: boolean;
  isPending: boolean;
  onConfirm: (payload: DeactivateJobPayload) => void;
}

// Form for deactivating a job: reason and details, validated like the backend.
export function DeactivateJobDialog({ open, onOpenChange, ...formProps }: DeactivateJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {/* Mounted only while open, so a cancelled dialog can't reopen with stale text. */}
        {open && <DeactivateJobForm onOpenChange={onOpenChange} {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

type DeactivateJobFormProps = Omit<DeactivateJobDialogProps, "open">;

function DeactivateJobForm({
  onOpenChange,
  jobTitle,
  isRepeat = false,
  isPending,
  onConfirm,
}: DeactivateJobFormProps) {
  const [reason, setReason] = useState<DeactivationReason | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const reasonId = useId();
  const detailsId = useId();

  const trimmedDetails = details.trim();

  const handleConfirm = () => {
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    if (trimmedDetails.length < DEACTIVATION_DETAILS_MIN_LENGTH) {
      setError(`Add at least ${DEACTIVATION_DETAILS_MIN_LENGTH} characters so the employer knows what to fix.`);
      return;
    }
    onConfirm({ reason, details: trimmedDetails });
  };

  return (
    <>
      <DialogTitle>{isRepeat ? "Deactivate this job again" : "Deactivate job"}</DialogTitle>
      <DialogDescription>
        &ldquo;{jobTitle}&rdquo; is removed from the public listing and stops taking applications.
      </DialogDescription>

      <div className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label
            htmlFor={reasonId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-slate-300"
          >
            Reason
          </label>
          <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white transition-colors focus-within:border-emerald-600 dark:border-slate-700 dark:bg-slate-900">
            <select
              id={reasonId}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value as DeactivationReason | "");
                if (error) setError("");
              }}
              className="h-10 w-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-9 text-sm text-zinc-900 outline-none focus:outline-none focus:ring-0 dark:text-slate-100"
            >
              <option value="">Select a reason…</option>
              {DEACTIVATION_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 size-4 text-zinc-400 dark:text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={detailsId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-slate-300"
          >
            Details
          </label>
          <Textarea
            id={detailsId}
            rows={4}
            value={details}
            maxLength={DEACTIVATION_DETAILS_MAX_LENGTH}
            className="max-h-32 overflow-y-auto break-words resize-none border-zinc-300 focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => {
              setDetails(e.target.value);
              if (error) setError("");
            }}
            placeholder="Explain what is wrong with this posting…"
          />

          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              The employer sees this in an email and on their job — say what to fix.
            </p>
            <span className="shrink-0 font-mono text-xs text-zinc-400 dark:text-slate-500">
              {details.length} / {DEACTIVATION_DETAILS_MAX_LENGTH}
            </span>
          </div>
          {error && (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>
      </div>

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
          onClick={handleConfirm}
          disabled={isPending}
          className="cursor-pointer gap-2 bg-rose-600 text-white hover:bg-rose-700"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Deactivate job
        </Button>
      </div>
    </>
  );
}
