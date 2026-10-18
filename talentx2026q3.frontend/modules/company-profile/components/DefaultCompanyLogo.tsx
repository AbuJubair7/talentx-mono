import React from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DefaultCompanyLogoProps {
  companyName?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
}

const BG_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-slate-800 to-slate-950',
  'from-emerald-600 to-teal-800',
  'from-purple-600 to-indigo-800',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-pink-700',
  'from-cyan-600 to-blue-700',
] as const;

function getGradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BG_GRADIENTS[Math.abs(hash) % BG_GRADIENTS.length];
}

export function extractCompanyInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'CO';
  const clean = name.trim();
  if (!clean) return 'CO';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

const SIZE_CLASSES = {
  sm: 'size-10 text-xs rounded-lg',
  md: 'size-14 text-base rounded-xl',
  lg: 'size-20 text-xl rounded-2xl',
  xl: 'size-28 text-3xl rounded-2xl',
};

const ICON_SIZE_CLASSES = {
  sm: 'size-5',
  md: 'size-7',
  lg: 'size-10',
  xl: 'size-14',
};

export function DefaultCompanyLogo({
  companyName,
  size = 'md',
  className,
  showIcon = false,
}: DefaultCompanyLogoProps) {
  const safeName = companyName || 'Company';
  const gradient = getGradientForName(safeName);
  const initials = extractCompanyInitials(safeName);

  return (
    <div
      data-testid="default-company-logo"
      className={cn(
        'relative flex items-center justify-center font-bold text-white shadow-xs select-none bg-gradient-to-br shrink-0 overflow-hidden border border-white/10',
        gradient,
        SIZE_CLASSES[size],
        className
      )}
      aria-label={`${safeName} logo`}
    >
      {showIcon ? (
        <Building2 className={cn('text-white/90', ICON_SIZE_CLASSES[size])} aria-hidden="true" />
      ) : (
        <span className="font-extrabold tracking-wider">{initials}</span>
      )}
    </div>
  );
}
