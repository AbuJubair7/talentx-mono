import { Mail } from "lucide-react";

interface EmployerContactCardProps {
  companyName: string;
  employerName: string;
  employerEmail: string;
}

// Employer name/email as a mailto link, or a "not found" note if the account is gone.
export function EmployerContactCard({ companyName, employerName, employerEmail }: EmployerContactCardProps) {
  // The backend sends empty strings when the employer's user record no longer exists.
  const hasAccount = Boolean(employerName || employerEmail);

  return (
    <section className="rounded-xl border border-zinc-200/80 p-4 dark:border-slate-800">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        Posted by
      </h3>
      <p className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-slate-100 break-words [overflow-wrap:anywhere]">{companyName}</p>
      {hasAccount ? (
        <>
          {employerName && (
            <p className="text-sm text-zinc-700 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
              {employerName}
            </p>
          )}
          {employerEmail && (
            <a
              href={`mailto:${employerEmail}`}
              title={employerEmail}
              className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400 break-all"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {employerEmail}
            </a>
          )}
        </>
      ) : (
        <p className="mt-1 text-sm italic text-zinc-400 dark:text-slate-500">Employer account not found</p>
      )}
    </section>
  );
}
