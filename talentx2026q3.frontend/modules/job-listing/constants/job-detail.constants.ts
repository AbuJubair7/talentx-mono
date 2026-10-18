export const JOB_DETAIL_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Published: {
    label: 'Active Opening',
    className: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  },
  Closed: {
    label: 'Closed',
    className: 'bg-slate-100 border border-slate-200 text-slate-600',
  },
  Expired: {
    label: 'Expired',
    className: 'bg-rose-50 border border-rose-200 text-rose-700',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-amber-50 border border-amber-200 text-amber-700',
  },
};

export const DEFAULT_JOB_STATUS_CONFIG: { label: string; className: string } = {
  label: 'Unknown',
  className: 'bg-slate-100 border border-slate-200 text-slate-600',
};

export const NON_ACTIVE_JOB_NOTICES: Record<string, { title: string; className: string }> = {
  Closed: {
    title: 'This job is closed',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  Expired: {
    title: 'Applications closed (Expired)',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  Draft: {
    title: 'This job is currently a draft',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
};
