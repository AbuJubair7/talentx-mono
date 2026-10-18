'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  Globe,
  Link2,
  Mail,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApplicationStatusBadge } from '../ApplicationStatusBadge';
import { MatchScoreRing } from './MatchScoreRing';
import { APPLICANT_FALLBACKS } from '../../constants';
import { displayText, nonBlankText, safeStringList } from '../../utils/profileData';
import { formatUrlLabel, getInitials } from '../../utils/format';
import { formatShortDate } from '@/lib/date';
import type { CandidateProfile } from '../../types/applicant.types';

interface ProfileHeaderProps {
  profile: CandidateProfile;
}

const chipBase =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-[13px] text-ink-muted';
const linkChip = `${chipBase} transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40`;

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const name = displayText(profile.name, APPLICANT_FALLBACKS.NAME_FALLBACK);
  const email = nonBlankText(profile.email);
  const tagline = nonBlankText(profile.tagline);
  const location = nonBlankText(profile.location);
  const linkedInUrl = nonBlankText(profile.linkedInUrl);
  const additionalUrls = safeStringList(profile.additionalUrls);
  const profilePictureUrl = nonBlankText(profile.profilePictureUrl);
  const appliedDate = formatShortDate(profile.appliedAt, APPLICANT_FALLBACKS.NOT_SPECIFIED);

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success('Email copied to clipboard');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy email. Try selecting it manually.');
    }
  };

  return (
    <header className="rounded-xl border border-line bg-surface p-4 shadow-card md:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-20 shrink-0 border border-line">
            {profilePictureUrl ? (
              <AvatarImage src={profilePictureUrl} alt={name} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-brand-soft text-lg font-bold text-brand">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="break-words text-[22px] font-bold tracking-tight text-ink [overflow-wrap:anywhere] md:text-2xl">
                {name}
              </h1>
              <ApplicationStatusBadge status={profile.applicationStatus} />
            </div>

            {tagline && <p className="mt-0.5 text-[15px] text-ink-subtle">{tagline}</p>}

            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Contact details">
              {email && (
                <li className={`${chipBase} pr-1`}>
                  <Mail className="size-3.5 text-ink-subtle" aria-hidden="true" />
                  <a
                    href={`mailto:${email}`}
                    className="rounded text-ink-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {email}
                  </a>
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label={copied ? 'Email copied' : 'Copy email address'}
                    className="ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {copied ? <Check className="size-3.5 text-brand" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                  </button>
                </li>
              )}

              <li className={chipBase}>
                <MapPin className="size-3.5 text-ink-subtle" aria-hidden="true" />
                {location ?? APPLICANT_FALLBACKS.NOT_SPECIFIED}
              </li>

              <li className={chipBase}>
                <CalendarDays className="size-3.5 text-ink-subtle" aria-hidden="true" />
                Applied {appliedDate}
              </li>

              {linkedInUrl && (
                <li>
                  <a href={linkedInUrl} target="_blank" rel="noreferrer" className={linkChip}>
                    <Link2 className="size-3.5" aria-hidden="true" />
                    LinkedIn
                    <ArrowUpRight className="size-3 text-ink-subtle" aria-hidden="true" />
                  </a>
                </li>
              )}

              {additionalUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    className={linkChip}
                  >
                    <Globe className="size-3.5" aria-hidden="true" />
                    {formatUrlLabel(url)}
                    <ArrowUpRight className="size-3 text-ink-subtle" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 items-center border-t border-line pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <MatchScoreRing score={profile.aiMatchScore} />
        </div>
      </div>
    </header>
  );
}
