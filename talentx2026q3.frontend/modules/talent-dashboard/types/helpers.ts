import type { ApplicationStatus } from '../types';

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(iso))
    .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
}

export function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  A: 'bg-slate-500',
  B: 'bg-blue-600',
  C: 'bg-cyan-600',
  D: 'bg-indigo-500',
  E: 'bg-emerald-600',
  F: 'bg-fuchsia-600',
  G: 'bg-green-600',
  H: 'bg-orange-500',
  I: 'bg-teal-600',
  J: 'bg-yellow-500',
  K: 'bg-pink-600',
  L: 'bg-violet-600',
  M: 'bg-rose-500',
  N: 'bg-sky-600',
  O: 'bg-lime-600',
  P: 'bg-amber-600',
  Q: 'bg-red-600',
  R: 'bg-blue-700',
  S: 'bg-purple-600',
  T: 'bg-teal-700',
  U: 'bg-orange-600',
  V: 'bg-emerald-700',
  W: 'bg-indigo-600',
  X: 'bg-slate-600',
  Y: 'bg-cyan-700',
  Z: 'bg-rose-600',
};

export function avatarColor(company: string): string {
  const letter = getInitials(company);
  return AVATAR_COLORS[letter] ?? 'bg-slate-500';
}

export function formatEnumString(val?: string): string {
  if (!val) return '—';
  // Inserts a space before capital letters following lower/upper letters
  return val.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}