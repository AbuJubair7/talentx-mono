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
  MODERATION_DETAILS_MAX_LENGTH,
  MODERATION_DETAILS_MIN_LENGTH,
  MODERATION_REASON_OPTIONS,
} from "../constants/moderation-reasons";
import type { ModerationReasonPayload } from "../types/review-moderation";
import type { ReviewModerationReason } from "@/modules/company-review";

export type ModerationReasonAction = "reject" | "hide";

interface ModerationReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ModerationReasonAction;
  companyName: string;
  isPending: boolean;
  onConfirm: (payload: ModerationReasonPayload) => void;
}

const COPY: Record<ModerationReasonAction, { title: string; confirmLabel: string }> = {
  reject: { title: "Reject review", confirmLabel: "Reject review" },
  hide: { title: "Hide review", confirmLabel: "Hide review" },
};

// One component for both Reject and Hide: same reason + details shape, different copy.
export function ModerationReasonDialog({ open, onOpenChange, ...formProps }: ModerationReasonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        {/* Mounted only while open, so a cancelled dialog can't reopen with stale text. */}
        {open && <ModerationReasonForm onOpenChange={onOpenChange} {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

type ModerationReasonFormProps = Omit<ModerationReasonDialogProps, "open">;

function ModerationReasonForm({
  onOpenChange,
  action,
  companyName,
  isPending,
  onConfirm,
}: ModerationReasonFormProps) {
  const [reason, setReason] = useState<ReviewModerationReason | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const reasonId = useId();
  const detailsId = useId();
  const copy = COPY[action];

  const trimmedDetails = details.trim();

  const handleConfirm = () => {
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    if (trimmedDetails.length < MODERATION_DETAILS_MIN_LENGTH) {
      setError(`Add at least ${MODERATION_DETAILS_MIN_LENGTH} characters so the reviewer knows why.`);
      return;
    }
    onConfirm({ reason, details: trimmedDetails });
  };

  return (
    <>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogDescription>{`This review of "${companyName}" will ${action === "reject" ? "not be published" : "be taken down"}.`}</DialogDescription>

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
                setReason(e.target.value as ReviewModerationReason | "");
                if (error) setError("");
              }}
              className="h-10 w-full cursor-pointer appearance-none bg-transparent pl-3.5 pr-9 text-sm text-zinc-900 outline-none focus:outline-none focus:ring-0 dark:text-slate-100"
            >
              <option value="">Select a reason…</option>
              {MODERATION_REASON_OPTIONS.map((option) => (
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
            maxLength={MODERATION_DETAILS_MAX_LENGTH}
            className="max-h-32 overflow-y-auto break-words resize-none border-zinc-300 focus:border-emerald-600 focus:outline-none focus:ring-0 focus-visible:border-emerald-600 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => {
              setDetails(e.target.value);
              if (error) setError("");
            }}
            placeholder="Explain the decision…"
          />

          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              This explanation is shown to the reviewer.
            </p>
            <span className="shrink-0 font-mono text-xs text-zinc-400 dark:text-slate-500">
              {details.length} / {MODERATION_DETAILS_MAX_LENGTH}
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
          {copy.confirmLabel}
        </Button>
      </div>
    </>
  );
}
