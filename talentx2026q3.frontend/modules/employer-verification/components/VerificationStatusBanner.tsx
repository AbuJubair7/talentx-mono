"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Pencil } from "lucide-react";

interface VerificationStatusBannerProps {
  status: "PendingVerification" | "Verified" | "Rejected";
  rejectionReason?: string | null;
  onReApply?: () => void;
  isReApplying?: boolean;
  editProfileHref?: string;
}

export function VerificationStatusBanner({ status, rejectionReason, onReApply, isReApplying, editProfileHref }: VerificationStatusBannerProps) {
  if (status === "Verified") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle className="size-5" />
          <span className="font-semibold">Your account is verified.</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700">
          You can now post jobs and recruit top talent on TalentX.
        </p>
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="size-5" />
          <span className="font-semibold">Your account verification was rejected.</span>
        </div>
        {rejectionReason && (
          <div className="mt-2 rounded bg-red-100 p-3">
            <p className="text-xs font-medium text-red-700">Reason:</p>
            <p className="mt-1 text-sm text-red-800 line-clamp-3">{rejectionReason}</p>
          </div>
        )}
        <p className="mt-2 text-sm text-red-700">
          Please update your profile information based on the reason above, then re-apply for verification.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {onReApply && (
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
          {editProfileHref && (
            <Link
              href={editProfileHref}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
            >
              <Pencil className="size-3.5" />
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="size-5" />
        <span className="font-semibold">Your account is pending verification.</span>
      </div>
      <p className="mt-1 text-sm text-amber-700">
        Once reviewed and approved by our team, you will be able to post jobs and recruit top talent on TalentX.
      </p>
      {editProfileHref && (
        <Link
          href={editProfileHref}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 rounded-sm"
        >
          <Pencil className="size-3.5" />
          Edit Profile
        </Link>
      )}
    </div>
  );
}
