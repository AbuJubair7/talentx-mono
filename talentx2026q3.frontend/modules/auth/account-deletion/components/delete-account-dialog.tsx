"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { type DeleteAccountRole, type DeleteAccountStep } from "../types";
import { WarningStep } from "./warning-step";
import { OtpStep } from "./otp-step";

interface DeleteAccountDialogProps {
  role: DeleteAccountRole;
}

const STEP_TITLES: Record<DeleteAccountStep, string> = {
  warning: "Delete your account?",
  otp: "Confirm with email code",
};

export function DeleteAccountDialog({ role }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    step,
    setStep,
    form,
    onSubmit,
    serverError,
    isSendingOtp,
    resendOtp,
    resendCooldown,
    resendSuccess,
    isDeleting,
    requestOtpIfNeeded,
    reset,
  } = useDeleteAccount();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const otpValue = watch("otp") || "";
  const isConfirmed = watch("isConfirmed");

  useEffect(() => {
    if (step === "otp") {
      requestOtpIfNeeded();
    }
  }, [step, requestOtpIfNeeded]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-background px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 transition-colors">
        Delete Account
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-y-auto gap-0 [&>button]:z-10">
        <DialogTitle className="sr-only">Delete Account</DialogTitle>

        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                {STEP_TITLES[step]}
              </h2>
              <p className="text-xs text-slate-500">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {step === "warning" && (
            <WarningStep
              role={role}
              isConfirmed={isConfirmed ?? false}
              confirmationError={errors.isConfirmed?.message}
              serverError={serverError}
              onConfirmedChange={(checked) =>
                setValue("isConfirmed", checked, { shouldValidate: true })
              }
              onCancel={() => {
                reset();
                setOpen(false);
              }}
              onContinue={() => setStep("otp")}
            />
          )}

          {step === "otp" && (
            <OtpStep
              register={register}
              errors={errors}
              otpValue={otpValue}
              serverError={serverError}
              isDeleting={isDeleting}
              isSendingOtp={isSendingOtp}
              resendCooldown={resendCooldown}
              resendSuccess={resendSuccess}
              onResend={resendOtp}
              onBack={() => setStep("warning")}
              onSubmit={handleSubmit(onSubmit)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
