'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface RunMatchingButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  label?: string;
  hasMatches?: boolean;
  matchCount?: number;
}

export function RunMatchingButton({
  onClick,
  isLoading,
  disabled = false,
  label,
  hasMatches = false,
  matchCount,
}: RunMatchingButtonProps) {
  const displayLabel = label ?? 'Find matching candidates';

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-md p-[1.5px] text-sm font-medium transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#10b981_310deg,#34d399_340deg,#ffffff_358deg,transparent_360deg)] opacity-70 blur-[2px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#059669_300deg,#34d399_330deg,#a7f3d0_350deg,#ffffff_358deg,transparent_360deg)] opacity-90 group-hover:opacity-100"
        />
        <span className="relative z-10 inline-flex h-full w-full items-center gap-2 rounded-[calc(0.375rem-1.5px)] bg-emerald-700 px-4 py-1.5 text-sm text-white transition-colors duration-150 group-hover:bg-emerald-800 group-active:bg-emerald-900">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
          ) : (
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{isLoading ? 'Finding candidates...' : displayLabel}</span>
        </span>
      </button>

      {hasMatches && matchCount !== undefined && matchCount > 0 && (
        <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-[#0F6E56]">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'} ready
        </span>
      )}
    </div>
  );
}
