"use client";

import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVerificationStatusBadge } from "../constants/verification-status.constants";
import { useApproveEmployer } from "../hooks/useApproveEmployer";
import { useRejectEmployer } from "../hooks/useRejectEmployer";
import { useEmployerDetails } from "../hooks/useEmployerDetails";
import { formatEmployerDate } from "../utils/employer-verification.utils";
import { EmployerDetailField } from "./EmployerDetailField";

interface EmployerDetailPanelProps {
  employerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployerDetailPanel({
  employerId,
  isOpen,
  onClose,
}: EmployerDetailPanelProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const {
    data: employer,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployerDetails(isOpen && employerId ? employerId : "");

  const approveMutation = useApproveEmployer();
  const rejectMutation = useRejectEmployer();

  const handleClose = () => {
    setRejectionReason("");
    setRejectionError("");
    onClose();
  };

  const handleApprove = async () => {
    if (!employerId) return;
    try {
      await approveMutation.mutateAsync(employerId);
      handleClose();
    } catch {
      // toast is triggered by mutation hook
    }
  };

  const handleReject = async () => {
    if (!employerId) return;
    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setRejectionError("Please provide a reason for rejection.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: employerId, reason: trimmed });
      handleClose();
    } catch {
      // toast is triggered by mutation hook
    }
  };

  const isPendingVerification =
    employer?.verificationStatus === "PendingVerification";
  const statusConfig = employer
    ? getVerificationStatusBadge(employer.verificationStatus)
    : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-2xl dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-6 py-4 pr-12 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight text-zinc-900 dark:text-slate-100">
                Employer Details
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-slate-400">
                Review employer account credentials and verification status
              </DialogDescription>
            </div>
          </div>

          {statusConfig && StatusIcon && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
            >
              <StatusIcon className="size-3.5" />
              {statusConfig.label}
            </span>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400 dark:text-slate-500">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">
                Loading employer details…
              </p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="size-8 text-rose-600 dark:text-rose-400" />
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                Couldn&apos;t load employer details
              </p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                {(error as { message?: string })?.message ?? "Please try again."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void refetch();
                }}
                className="mt-2 cursor-pointer gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          )}

          {employer && (
            <div className="space-y-6">
              {/* Account & Company Info */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <EmployerDetailField label="Contact Name" value={employer.name} />
                <EmployerDetailField label="Email Address" value={employer.email} />
                <EmployerDetailField label="Company Name">
                  <div className="mt-1 flex items-center gap-2 font-medium text-zinc-900 dark:text-slate-100">
                    <Building2 className="size-4 text-zinc-400 dark:text-slate-500" />
                    <span>{employer.companyName}</span>
                  </div>
                </EmployerDetailField>
                <EmployerDetailField
                  label="Registered Date"
                  value={formatEmployerDate(employer.createdAt, "long")}
                />
                {employer.verifiedAt && (
                  <EmployerDetailField
                    label="Verified Date"
                    value={formatEmployerDate(employer.verifiedAt, "long")}
                  />
                )}
                {employer.rejectedAt && (
                  <EmployerDetailField
                    label="Rejected Date"
                    value={formatEmployerDate(employer.rejectedAt, "long")}
                  />
                )}
              </div>

              {/* Existing Rejection Reason Display */}
              {employer.rejectionReason && (
                <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="mt-0.5 size-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                        Rejection Reason
                      </h4>
                      <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">
                        {employer.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Verification Actions */}
              {isPendingVerification && (
                <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-slate-100">
                      Verification Actions
                    </h4>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                      Approve to grant full employer platform access, or enter a reason below and reject.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="rejection-reason-input"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-slate-300"
                    >
                      Rejection Reason <span className="font-normal normal-case text-zinc-500 dark:text-slate-400">(required if rejecting)</span>
                    </label>
                    <textarea
                      id="rejection-reason-input"
                      rows={4}
                      maxLength={1000}
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        if (rejectionError) setRejectionError("");
                      }}
                      placeholder="Provide a reason for rejection (required only if rejecting)..."
                      className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 shadow-2xs outline-none transition-all placeholder:text-zinc-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <div className="flex items-center justify-between">
                      {rejectionError && (
                        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                          {rejectionError}
                        </p>
                      )}
                      <p className={`text-xs ml-auto ${rejectionReason.length > 900 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400 dark:text-slate-500'}`}>
                        {rejectionReason.length} / 1000
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                      type="button"
                      onClick={handleReject}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="cursor-pointer gap-2 bg-rose-600 font-semibold text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Reject Employer
                    </Button>

                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="cursor-pointer gap-2 bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Approve Employer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
