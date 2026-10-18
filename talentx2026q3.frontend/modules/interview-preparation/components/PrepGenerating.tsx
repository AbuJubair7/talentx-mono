'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

const STEP_COUNT = 3;

export function PrepGenerating({ interviewType = 'Interview' }: { interviewType?: string }) {
  const steps = [
    'Reading the job posting',
    'Matching it with your profile',
    `Tailoring to your ${interviewType.toLowerCase()} interview`,
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((a) => Math.min(a + 1, STEP_COUNT - 1)),
      500,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <div className="rounded-md border border-ai-line bg-ai-soft p-5 sm:p-6">
        <p className="text-sm font-semibold text-ai">Preparing your guidance</p>
        <ul className="mt-3 space-y-2">
          {steps.map((step, i) => (
            <li
              key={step}
              className={`flex items-center gap-2 text-sm ${i <= active ? 'text-ink' : 'text-ink-subtle'}`}
            >
              {i < active ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : i === active ? (
                <Loader2 className="h-4 w-4 animate-spin text-ai motion-reduce:animate-none" aria-hidden />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                </span>
              )}
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-hidden rounded-md border border-line bg-surface" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-b-0">
            <div className="h-5 w-5 rounded-md bg-canvas" />
            <div
              className="h-3.5 flex-1 animate-pulse rounded bg-canvas motion-reduce:animate-none"
              style={{ maxWidth: `${80 - i * 12}%` }}
            />
          </div>
        ))}
      </div>
      <span className="sr-only">Generating interview preparation…</span>
    </div>
  );
}
