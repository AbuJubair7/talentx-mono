"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { refreshSession } from "../services/refresh.service";

export interface SessionRefreshViewProps {
  target?: string;
}

export function SessionRefreshView({ target = "/dashboard" }: SessionRefreshViewProps) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    // StrictMode-safe: refresh tokens rotate, so never fire twice.
    if (started.current) return;
    started.current = true;

    refreshSession()
      .then((isRefreshSuccessful) => {
        router.replace(isRefreshSuccessful ? target : "/login");
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router, target]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-gray-600">Restoring your session…</p>
      </div>
    </div>
  );
}
