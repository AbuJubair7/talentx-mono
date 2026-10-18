'use client';

import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationErrorProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function GenerationError({ onRetry, isRetrying = false }: GenerationErrorProps) {
  return (
    <div role="alert" className="rounded-md border border-line bg-surface px-6 py-10 text-center shadow-card">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-danger-soft">
        <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">We couldn&apos;t load your preparation</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">
        Something went wrong on our side. Your application and interview details are unaffected.
      </p>
      <Button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-5 gap-2 bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand"
      >
        {isRetrying ? (
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <RefreshCw className="h-4 w-4" aria-hidden />
        )}
        {isRetrying ? 'Trying again…' : 'Try again'}
      </Button>
    </div>
  );
}
