'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  User,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { CandidateMatch } from '../types/employer-job.types';
import { ScoreDial } from './ScoreDial';
import { DimensionBars, deriveDimensions } from './DimensionBars';
import { Button } from '@/components/ui/button';

interface CandidateRowProps {
  candidate: CandidateMatch;
  onViewProfile: (candidate: CandidateMatch) => void;
  onSendInvite: (talentUserId: string) => void;
  isInviting: boolean;
  onWithdraw?: (invitationId: string) => void;
  isWithdrawing?: boolean;
  rank?: number;
  featured?: boolean;
}

const BAND_CHIP: Record<string, string> = {
  strong: 'bg-[#0F6E56]/10 text-[#0F6E56] border-[#0F6E56]/20',
  good: 'bg-slate-100 text-slate-600 border-slate-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-400 border-slate-200',
};

const BAND_DOT: Record<string, string> = {
  strong: 'bg-[#0F6E56]',
  good: 'bg-slate-500',
  moderate: 'bg-amber-500',
  low: 'bg-slate-400',
};

function getBand(score: number): { key: string; label: string } {
  if (score >= 85) return { key: 'strong', label: 'Strong match' };
  if (score >= 70) return { key: 'good', label: 'Good match' };
  if (score >= 50) return { key: 'moderate', label: 'Moderate' };
  return { key: 'low', label: 'Stretch' };
}

function getDimensionSignals(candidate: CandidateMatch): { label: string; score: number }[] {
  return deriveDimensions(candidate)
    .filter((d) => d.status === 'available')
    .map((d) => ({ label: d.label.split(' ')[0], score: Math.round(d.score * 100) }));
}

export function CandidateRow({
  candidate,
  onViewProfile,
  onSendInvite,
  isInviting,
  onWithdraw,
  isWithdrawing,
  rank,
  featured = false,
}: CandidateRowProps) {
  const [expanded, setExpanded] = useState(false);
  const band = getBand(candidate.score);

  const invitationStatus =
    candidate.invitationStatus ?? (candidate.hasActiveInvitation ? 'Pending' : undefined);
  const canWithdraw =
    invitationStatus === 'Pending' && onWithdraw && candidate.invitationId;

  const renderInvitationBadge = () => {
    switch (invitationStatus) {
      case 'Pending':
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
              <Clock className="size-3.5 text-blue-500" />
              Invited
            </span>
            {canWithdraw && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onWithdraw!(candidate.invitationId!)}
                disabled={isWithdrawing}
                className="text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 h-7 px-2"
              >
                {isWithdrawing ? (
                  <Loader2 className="size-3 animate-spin mr-1" />
                ) : (
                  <X className="size-3 mr-1" />
                )}
                Withdraw
              </Button>
            )}
          </div>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <User className="size-3.5 text-slate-500" />
            Declined
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <Clock className="size-3.5 text-amber-500" />
            Withdrawn
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
            <Clock className="size-3.5 text-red-400" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const signals = getDimensionSignals(candidate);
  const topSignals = signals.slice(0, 2);
  const weakest = signals.length > 0 ? signals.reduce((a, b) => (a.score < b.score ? a : b)) : null;

  if (featured) {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-md border border-white/60 bg-white/90 backdrop-blur-sm shadow-lg shadow-black/5 overflow-hidden"
      >
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            <ScoreDial score={candidate.score} size="lg" label="match" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {rank != null && (
                  <span className="font-mono text-[11px] text-slate-400">#{rank}</span>
                )}
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium ${BAND_CHIP[band.key]}`}
                >
                  {band.label}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold leading-tight tracking-tight text-slate-900">
                {candidate.name}
              </h3>
              {candidate.tagline && (
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {candidate.tagline}
                </p>
              )}
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                {candidate.totalYearsExperience != null && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5 text-slate-400" />
                    {candidate.totalYearsExperience} yrs
                  </span>
                )}
                {candidate.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-slate-400" />
                    {candidate.location}
                  </span>
                )}
                {candidate.expectedSalary != null && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="size-3.5 text-slate-400" />
                    ${candidate.expectedSalary.toLocaleString()}/yr
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewProfile(candidate)}
                className="text-xs font-medium text-slate-700 h-8"
              >
                View Profile
              </Button>
              {invitationStatus ? (
                renderInvitationBadge()
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSendInvite(candidate.talentUserId)}
                  disabled={isInviting}
                  className="bg-[#0F6E56] hover:bg-[#0D5A47] text-white text-xs font-medium h-8"
                >
                  {isInviting ? (
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                  ) : (
                    <Send className="size-3.5 mr-1" />
                  )}
                  Invite
                </Button>
              )}
            </div>
          </div>

          {/* AI explanation */}
          {candidate.explanation && (
            <div className="mt-4 text-sm text-slate-600 bg-slate-50/80 border border-slate-100 rounded-lg p-3 italic">
              &ldquo;{candidate.explanation}&rdquo;
            </div>
          )}

          {/* Dimension bars + skills */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4 sm:gap-6">
            <DimensionBars candidate={candidate} dense />
            <div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                Technical skills
              </div>
              {candidate.technicalSkills && candidate.technicalSkills.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {candidate.technicalSkills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-md border border-[#0F6E56]/20 bg-[#0F6E56]/5 px-2 py-0.5 text-[11px] font-medium text-[#0F6E56]"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">No skills listed</p>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  // Compact row — lives inside parent's divided container, no own card styling
  return (
    <div>
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5"
      >
        {/* Rank */}
        <span className="font-mono text-sm font-semibold text-slate-400 w-7 text-right shrink-0">
          {rank != null ? `#${rank}` : ''}
        </span>

        {/* Score dial */}
        <ScoreDial score={candidate.score} size="sm" />

        {/* Name + metadata + signals */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-tight tracking-tight text-slate-900 truncate">
              {candidate.name}
            </h3>
            <span
              className={`shrink-0 rounded-md border px-1.5 py-px text-[9px] uppercase tracking-wide font-medium ${BAND_CHIP[band.key]}`}
            >
              {band.label}
            </span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
            {candidate.tagline && (
              <span className="truncate max-w-[180px]">{candidate.tagline}</span>
            )}
            {candidate.totalYearsExperience != null && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-3 text-slate-400" />
                {candidate.totalYearsExperience}y
              </span>
            )}
            {candidate.location && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="size-3 text-slate-400" />
                {candidate.location}
              </span>
            )}
          </p>
          {/* Dimension signals — top 2 + weakest */}
          {topSignals.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              {topSignals.map((sig) => (
                <span
                  key={sig.label}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-600"
                >
                  <span className={`size-1.5 rounded-full ${BAND_DOT[getBand(sig.score).key]}`} />
                  {sig.label}
                  <span className="text-slate-400">{sig.score}%</span>
                </span>
              ))}
              {weakest && topSignals.every((s) => s.label !== weakest.label) && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-px text-[10px] font-medium text-amber-700">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  {weakest.label} (low)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(candidate)}
            className="text-xs font-medium text-slate-700 h-7"
          >
            View Profile
          </Button>
          {invitationStatus ? (
            renderInvitationBadge()
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => onSendInvite(candidate.talentUserId)}
              disabled={isInviting}
              className="bg-[#0F6E56] hover:bg-[#0D5A47] text-white text-xs font-medium h-7"
            >
              {isInviting ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <Send className="size-3.5 mr-1" />
              )}
              Invite
            </Button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0F6E56] hover:text-[#0D5A47] transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                See details <ChevronDown className="size-3" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 py-3.5 sm:px-5 sm:py-3.5 space-y-3 sm:ml-[60px]">
              {candidate.explanation && (
                <div className="text-[13px] text-slate-600 bg-slate-50/80 border border-slate-100 rounded-lg p-3 italic">
                  &ldquo;{candidate.explanation}&rdquo;
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4 sm:gap-6">
                <DimensionBars candidate={candidate} dense />
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                    Technical skills
                  </div>
                  {candidate.technicalSkills && candidate.technicalSkills.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.technicalSkills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-md border border-[#0F6E56]/20 bg-[#0F6E56]/5 px-2 py-0.5 text-[11px] font-medium text-[#0F6E56]"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400 italic">No skills listed</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
