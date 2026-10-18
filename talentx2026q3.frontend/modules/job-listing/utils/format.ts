export { formatLongDate as formatDate } from '@/lib/date';

const SALARY_PERIOD_LABELS: Record<string, string> = {
  PerMonth: 'month',
  PerYear: 'year',
};

const SALARY_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

/**
 * Capitalizes the first letter of every word (splitting on spaces and
 * hyphens) so tag pills always render in Title Case, e.g. "Full Remote".
 */
export function titleCaseTag(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) =>
          part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
        )
        .join('-'),
    )
    .join(' ');
}

export function formatEmploymentType(value: string | null | undefined): string {
  const map: Record<string, string> = {
    FullTime: 'Full Time',
    PartTime: 'Part Time',
    Contract: 'Contract',
    Internship: 'Internship',
  };
  return value ? (map[value] ?? titleCaseTag(value)) : '';
}

export function formatExperienceLevel(value: string | null | undefined): string {
  const map: Record<string, string> = {
    EntryLevel: 'Entry Level',
    MidLevel: 'Mid Level',
    SeniorLevel: 'Senior Level',
    Lead: 'Lead',
    Executive: 'Executive',
  };
  return value ? (map[value] ?? titleCaseTag(value)) : '';
}

export function formatWorkArrangement(value: string | null | undefined): string {
  const map: Record<string, string> = {
    OnSite: 'On-Site',
    FullRemote: 'Full Remote',
    Hybrid: 'Hybrid',
    RemoteButAccessible: 'Remote But Accessible',
  };
  return value ? (map[value] ?? titleCaseTag(value)) : '';
}

export function formatLocation(location: string | null | undefined): string | null {
  return location && location.trim().length > 0 ? location.trim() : null;
}

export function formatSalaryRange(
  salaryType: string | null | undefined,
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined,
  salaryCurrency: string | null | undefined,
  salaryPeriod: string | null | undefined
): string {
  if (
    !salaryType ||
    salaryType === 'Negotiable' ||
    !salaryCurrency ||
    salaryMin === null ||
    salaryMin === undefined
  ) {
    return 'Negotiable';
  }

  // No currency symbol: the code (USD/BDT) already names the currency, and a symbol
  // next to it reads as a duplicate.
  const periodLabel = salaryPeriod ? (SALARY_PERIOD_LABELS[salaryPeriod] ?? '') : '';
  const periodSuffix = periodLabel ? `/${periodLabel}` : '';
  const formattedMinAmount = SALARY_NUMBER_FORMATTER.format(salaryMin);

  if (salaryMax === null || salaryMax === undefined || salaryMax === salaryMin) {
    return `${formattedMinAmount} ${salaryCurrency}${periodSuffix}`;
  }

  const formattedMaxAmount = SALARY_NUMBER_FORMATTER.format(salaryMax);
  return `${formattedMinAmount}-${formattedMaxAmount} ${salaryCurrency}${periodSuffix}`;
}

const DAY_MS = 86_400_000;

// Human-readable age of a posting; a timestamp slightly in the future (clock skew) counts as today.
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 60) return '1 month ago';
  const months = Math.floor(diffDays / 30);
  return `${months} months ago`;
}

export function isNewPosting(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS)) < 3;
}

export function companyInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

// Muted, low-saturation tones so fallback avatars stay calm next to the single emerald accent.
const AVATAR_COLORS = [
  'bg-slate-900',
  'bg-slate-700',
  'bg-zinc-700',
  'bg-stone-700',
  'bg-neutral-800',
  'bg-[#3F4A5A]',
  'bg-[#4A4458]',
  'bg-[#3E5249]',
] as const;

export function avatarColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index++) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
