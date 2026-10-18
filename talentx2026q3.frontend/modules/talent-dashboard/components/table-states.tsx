import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[15px] text-slate-500"
      >
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading…
        </span>
      </td>
    </tr>
  );
}

export function ErrorRow({
  colSpan,
  message,
  onRetry,
}: {
  colSpan: number;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[15px]"
      >
        <p className="text-rose-600">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 cursor-pointer rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
          >
            Try again
          </button>
        )}
      </td>
    </tr>
  );
}

export function EmptyRow({
  colSpan,
  message,
  actionLabel,
  actionHref,
}: {
  colSpan: number;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[15px] text-slate-500"
      >
        <p>{message}</p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="mt-3 inline-block rounded-md bg-emerald-700 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            {actionLabel}
          </Link>
        )}
      </td>
    </tr>
  );
}
