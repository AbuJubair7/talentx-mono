"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DELETE_ACCOUNT_WARNING, type DeleteAccountRole } from "../types";

interface WarningStepProps {
  role: DeleteAccountRole;
  isConfirmed: boolean;
  confirmationError?: string;
  serverError: string | null;
  onConfirmedChange: (checked: boolean) => void;
  onCancel: () => void;
  onContinue: () => void;
}

export function WarningStep({
  role,
  isConfirmed,
  confirmationError,
  serverError,
  onConfirmedChange,
  onCancel,
  onContinue,
}: WarningStepProps) {
  return (
    <div className="space-y-4">
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3"
      >
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="text-xs font-medium text-amber-800">
          {DELETE_ACCOUNT_WARNING[role]}
        </p>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Deleting your account permanently removes your profile and all associated
        data from TalentX. You will be signed out immediately and will not be able
        to recover this account.
      </p>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(event) => onConfirmedChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-red-600 accent-red-600 focus:ring-red-500"
        />
        <span className="text-xs font-medium text-slate-700">
          I understand this action is permanent and all my data will be deleted.
        </span>
      </label>
      {confirmationError && (
        <p className="text-xs font-medium text-red-600 -mt-2">
          {confirmationError}
        </p>
      )}

      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-700"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 text-xs font-semibold"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!isConfirmed}
          className="h-10 rounded-lg bg-red-600 font-semibold text-xs text-white hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
